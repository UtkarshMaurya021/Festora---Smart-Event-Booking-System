import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { getBooking } from "../services/bookingService";
import {
  createOrder,
  confirmPayment,
  markPaymentFailed,
} from "../services/paymentService";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiSmartphone,
  FiChevronLeft,
  FiDownload,
} from "react-icons/fi";
import { BsBank2, BsWallet2 } from "react-icons/bs";

/**
 * FestoraPay -- a self-built, free mock payment gateway.
 *
 * Same shape as a real checkout (order -> pick a method -> pay -> verify)
 * but everything happens on our own server, so there's no signup, no KYC,
 * and no external dependency to explain.
 *
 * Simulated outcomes (documented here so it's easy to demo):
 *   - Card number ending in 0000   -> declined
 *   - UPI id "fail@festora"        -> declined
 *   - Netbanking / Wallet          -> always succeed
 *   - anything else                -> succeeds
 */

// Where the backend serves uploaded files (QR codes) from. Kept as one
// constant so it's obvious where to point this at deploy time.
const API_HOST = "http://localhost:8080";

const METHODS = [
  { id: "CARD", label: "Card", icon: FiCreditCard },
  { id: "UPI", label: "UPI", icon: FiSmartphone },
  { id: "NETBANKING", label: "Netbanking", icon: BsBank2 },
  { id: "WALLET", label: "Wallet", icon: BsWallet2 },
];

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

// Reads a same/known-origin image URL into a base64 PNG data URL so it can
// be embedded straight into the generated PDF.
function loadImageAsDataUrl(url) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Could not fetch QR code image");
      return res.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // step: summary -> checkout -> processing -> success | failed
  const [step, setStep] = useState("summary");
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("State Bank of India");
  const [wallet, setWallet] = useState("FestoraWallet");
  const [result, setResult] = useState(null);
  const [starting, setStarting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const qrImgRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getBooking(bookingId);
        setBooking(res.data);
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError("We couldn't load this booking. It may not exist or may not belong to you.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const startCheckout = async () => {
    setError("");
    setStarting(true);
    try {
      const res = await createOrder(bookingId);
      setOrder(res.data);
      setStep("checkout");
    } catch (err) {
      console.error("Could not start payment:", err);
      setError(
        err.response?.data?.message || "Couldn't start the payment. Please try again."
      );
    } finally {
      setStarting(false);
    }
  };

  const closeCheckout = async () => {
    setStep("summary");
    try {
      await markPaymentFailed(bookingId);
    } catch (err) {
      console.error("Failed to record payment cancellation:", err);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setStep("processing");

    // brief, deliberate delay so it *feels* like a real gateway round-trip
    await new Promise((resolve) => setTimeout(resolve, 1100));

    try {
      const res = await confirmPayment({
        bookingId: Number(bookingId),
        transactionId: order.transactionId,
        paymentMethod: method,
        cardNumber: method === "CARD" ? cardNumber : undefined,
        upiId: method === "UPI" ? upiId : undefined,
      });
      setResult(res.data);
      setStep(res.data.status === "SUCCESS" ? "success" : "failed");
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      setResult({
        status: "FAILED",
        message:
          err.response?.data?.message || "Something went wrong confirming your payment.",
      });
      setStep("failed");
    }
  };

  const retry = () => {
    setResult(null);
    setStep("checkout");
  };

  const downloadTicketPdf = async () => {
    if (!result?.qrCodePath) return;

    setDownloadError("");
    setDownloading(true);
    try {
      const qrDataUrl = await loadImageAsDataUrl(`${API_HOST}/${result.qrCodePath}`);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 56;

      // Header
      doc.setFillColor(29, 78, 216);
      doc.rect(0, 0, pageWidth, 90, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("FESTORA", marginX, 50);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("E-Ticket", marginX, 68);

      // Event details
      let y = 140;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(result.eventTitle || "Event", marginX, y);

      y += 26;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      if (result.venueName) {
        doc.text(result.venueName, marginX, y);
        y += 30;
      } else {
        y += 10;
      }

      const detailRow = (label, value) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(label.toUpperCase(), marginX, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(String(value), marginX, y + 16);
        y += 46;
      };

      detailRow("Ticket Number", result.ticketNumber);
      detailRow("Booking ID", `#${result.bookingId}`);
      detailRow("Quantity", result.quantity);

      // QR code, centered
      const qrSize = 180;
      const qrX = (pageWidth - qrSize) / 2;
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(qrX - 16, y - 16, qrSize + 32, qrSize + 32, 8, 8);
      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

      y += qrSize + 40;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text("Present this QR code at the venue entrance for scanning.", pageWidth / 2, y, {
        align: "center",
      });

      doc.save(`${result.ticketNumber || "festora-ticket"}.pdf`);
    } catch (err) {
      console.error("Failed to generate ticket PDF:", err);
      setDownloadError("Couldn't generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <p className="payment-loading">Loading your booking…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <p className="payment-error">{error || "Booking not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-badge">
          <FiShield />
          <span>Secured by FestoraPay · Test Mode</span>
        </div>

        {/* ---------------- SUMMARY ---------------- */}
        {step === "summary" && (
          <>
            <h1 className="payment-title">Complete your booking</h1>
            <p className="payment-subtitle">
              Review your order, then pay securely to confirm your seats.
            </p>

            <div className="payment-summary">
              <div className="payment-summary-row">
                <span>Event</span>
                <strong>{booking.eventTitle}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Booking ID</span>
                <strong>#{bookingId}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Quantity</span>
                <strong>{booking.quantity}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Status</span>
                <strong className={`payment-status payment-status-${booking.status?.toLowerCase()}`}>
                  {booking.status}
                </strong>
              </div>
              <div className="payment-summary-divider" />
              <div className="payment-summary-row payment-summary-total">
                <span>Total amount</span>
                <strong>₹{booking.totalAmount}</strong>
              </div>
            </div>

            {error && <div className="payment-error-banner">{error}</div>}

            <button className="payment-pay-btn" onClick={startCheckout} disabled={starting}>
              {starting ? "Starting checkout…" : `Pay ₹${booking.totalAmount}`}
            </button>

            <p className="payment-footnote">
              <FiCheckCircle /> No real money moves. This is a demo payment gateway.
            </p>
          </>
        )}

        {/* ---------------- CHECKOUT (method + form) ---------------- */}
        {step === "checkout" && order && (
          <>
            <button className="payment-back-btn" onClick={closeCheckout}>
              <FiChevronLeft /> Back
            </button>

            <h1 className="payment-title">Pay ₹{order.amount}</h1>
            <p className="payment-subtitle">Transaction ID: {order.transactionId}</p>

            <div className="payment-method-tabs">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    className={`payment-method-tab ${method === m.id ? "active" : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <Icon />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <form className="payment-form" onSubmit={handlePay}>
              {method === "CARD" && (
                <>
                  <div className="payment-field">
                    <label>Card number</label>
                    <input
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      required
                    />
                  </div>
                  <div className="payment-field-row">
                    <div className="payment-field">
                      <label>Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="payment-field">
                      <label>CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                  </div>
                  <p className="payment-hint">
                    Test tip: any card works — a number ending in <strong>0000</strong> simulates a decline.
                  </p>
                </>
              )}

              {method === "UPI" && (
                <>
                  <div className="payment-field">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                    />
                  </div>
                  <p className="payment-hint">
                    Test tip: any UPI ID works — <strong>fail@festora</strong> simulates a decline.
                  </p>
                </>
              )}

              {method === "NETBANKING" && (
                <div className="payment-field">
                  <label>Select your bank</label>
                  <select value={bank} onChange={(e) => setBank(e.target.value)}>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Punjab National Bank</option>
                  </select>
                </div>
              )}

              {method === "WALLET" && (
                <div className="payment-field">
                  <label>Select your wallet</label>
                  <select value={wallet} onChange={(e) => setWallet(e.target.value)}>
                    <option>FestoraWallet</option>
                    <option>PayZone</option>
                    <option>QuickPay</option>
                  </select>
                </div>
              )}

              <button className="payment-pay-btn" type="submit">
                Pay ₹{order.amount}
              </button>
            </form>
          </>
        )}

        {/* ---------------- PROCESSING ---------------- */}
        {step === "processing" && (
          <div className="payment-status-screen">
            <div className="payment-spinner" />
            <h2 className="payment-status-title">Processing payment…</h2>
            <p className="payment-status-text">Please don't close this window.</p>
          </div>
        )}

        {/* ---------------- SUCCESS: QR ticket + PDF download ---------------- */}
        {step === "success" && result && (
          <div className="payment-status-screen">
            <FiCheckCircle className="payment-status-icon payment-status-icon-success" />
            <h2 className="payment-status-title">Payment successful</h2>
            <p className="payment-status-text">Your ticket is ready — scan it at the venue.</p>

            {result.qrCodePath && (
              <div className="ticket-card">
                <div className="ticket-card-header">
                  <span className="ticket-card-brand">Festora E-Ticket</span>
                  <span className="ticket-card-number">{result.ticketNumber}</span>
                </div>

                <p className="ticket-card-event">{result.eventTitle}</p>
                {result.venueName && <p className="ticket-card-venue">{result.venueName}</p>}

                <div className="ticket-card-qr-wrap">
                  <img
                    ref={qrImgRef}
                    src={`${API_HOST}/${result.qrCodePath}`}
                    alt={`QR code for ticket ${result.ticketNumber}`}
                  />
                </div>

                <div className="ticket-card-details">
                  <div className="ticket-card-detail">
                    <span>Booking ID</span>
                    <strong>#{result.bookingId}</strong>
                  </div>
                  <div className="ticket-card-detail">
                    <span>Quantity</span>
                    <strong>{result.quantity}</strong>
                  </div>
                </div>
              </div>
            )}

            {downloadError && <div className="payment-error-banner">{downloadError}</div>}

            <div className="payment-actions">
              <button
                className="payment-pay-btn"
                onClick={downloadTicketPdf}
                disabled={downloading || !result.qrCodePath}
              >
                <FiDownload style={{ marginRight: 8, verticalAlign: "middle" }} />
                {downloading ? "Preparing PDF…" : "Download ticket as PDF"}
              </button>
              <button
                className="payment-secondary-btn"
                onClick={() => navigate("/my-bookings?status=success")}
              >
                View my bookings
              </button>
            </div>
          </div>
        )}

        {/* ---------------- FAILED ---------------- */}
        {step === "failed" && result && (
          <div className="payment-status-screen">
            <FiXCircle className="payment-status-icon payment-status-icon-failed" />
            <h2 className="payment-status-title">Payment failed</h2>
            <p className="payment-status-text">{result.message}</p>
            <button className="payment-pay-btn" onClick={retry}>
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;
