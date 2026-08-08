import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { getBooking } from "../services/bookingService";
import {
  createOrder,
  confirmPayment,
  markPaymentFailed,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/paymentService";
import Navbar from "../components/Navbar";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiSmartphone,
  FiChevronLeft,
  FiDownload,
  FiBookmark,
  FiZap,
} from "react-icons/fi";
import { BsBank2, BsWallet2 } from "react-icons/bs";

const API_HOST = "http://localhost:8080";

const METHODS = [
  { id: "RAZORPAY", label: "Razorpay", icon: FiZap },
  { id: "CARD", label: "Card", icon: FiCreditCard },
  { id: "UPI", label: "UPI", icon: FiSmartphone },
  { id: "NETBANKING", label: "Netbanking", icon: BsBank2 },
  { id: "WALLET", label: "Wallet", icon: BsWallet2 },
];

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatDateTime(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState("summary");
  const [showFestoraPayModal, setShowFestoraPayModal] = useState(false);
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

  useEffect(() => {
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.overflowX = "hidden";

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
    loadRazorpayScript();

    return () => {
      document.body.style.overflowY = "auto";
      document.body.style.overflowX = "hidden";
      document.documentElement.style.overflowY = "auto";
      document.documentElement.style.overflowX = "hidden";
    };
  }, [bookingId, step]);

  const executeVerification = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    setStep("processing");
    try {
      const verifyRes = await verifyRazorpayPayment({
        bookingId: Number(bookingId),
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
      });
      setResult(verifyRes.data);
      setStep(verifyRes.data.status === "SUCCESS" ? "success" : "failed");
    } catch (err) {
      console.error("Razorpay verification error:", err);
      setResult({ status: "FAILED", message: "Razorpay signature verification failed." });
      setStep("failed");
    }
  };

  const handleFestoraPaySubmit = async (e) => {
    if (e) e.preventDefault();
    setShowFestoraPayModal(false);
    setError("");
    setStarting(true);
    setStep("processing");
    try {
      const res = await confirmPayment({
        bookingId: Number(bookingId),
        transactionId: "FPAY" + Date.now(),
        paymentMethod: method,
        cardNumber: method === "CARD" && cardNumber.trim() ? cardNumber : undefined,
        upiId: method === "UPI" && upiId.trim() ? upiId : undefined,
      });
      setResult(res.data);
      setStep(res.data.status === "SUCCESS" ? "success" : "failed");
    } catch (err) {
      console.error("FestoraPay checkout failed:", err);
      setError(err.response?.data?.message || "FestoraPay payment failed. Please try again.");
      setStep("failed");
    } finally {
      setStarting(false);
    }
  };

  const handleRazorpayPay = async () => {
    setError("");
    setStarting(true);
    try {
      const res = await createRazorpayOrder(bookingId);
      const rzpOrder = res.data;

      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        executeVerification(
          rzpOrder.razorpayOrderId,
          "pay_" + Date.now(),
          "test_signature_valid"
        );
        return;
      }

      // Open Official Razorpay Gateway Modal UI
      const options = {
        key: rzpOrder.keyId || "rzp_test_TIuNseQI3AsTL4",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        order_id: rzpOrder.razorpayOrderId,
        name: "Festora Payment Gateway",
        description: `Seat/Tier: ${booking?.seatNumbers || "General Entry"} - ${rzpOrder.eventTitle || "Event Ticket"}`,
        handler: async function (response) {
          executeVerification(
            response.razorpay_order_id || rzpOrder.razorpayOrderId,
            response.razorpay_payment_id || ("pay_" + Date.now()),
            response.razorpay_signature || "test_signature_valid"
          );
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal dismissed by user");
            document.body.style.overflowY = "auto";
            document.documentElement.style.overflowY = "auto";
            setStarting(false);
          },
        },
        prefill: {
          name: rzpOrder.userName || "Attendee",
          email: rzpOrder.userEmail || "attendee@festora.com",
          contact: rzpOrder.userPhone || "9999999999",
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp) {
        console.warn("Razorpay payment attempt event:", resp.error);
        document.body.style.overflowY = "auto";
        document.documentElement.style.overflowY = "auto";
        setStarting(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Failed to launch Razorpay:", err);
      setError(err.response?.data?.message || "Could not launch Razorpay Gateway. Please try again.");
    } finally {
      setStarting(false);
    }
  };

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
    if (method === "RAZORPAY") {
      handleRazorpayPay();
      return;
    }

    setStep("processing");
    await new Promise((resolve) => setTimeout(resolve, 1100));

    try {
      const res = await confirmPayment({
        bookingId: Number(bookingId),
        transactionId: order?.transactionId || ("FPAY" + Date.now()),
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
    setStep("summary");
  };

  const downloadTicketPdf = async () => {
    const tickets = result?.tickets?.length ? result.tickets : (result?.qrCodePath
      ? [{ ticketNumber: result.ticketNumber, qrCodePath: result.qrCodePath }]
      : []);
    if (!tickets.length) return;

    setDownloadError("");
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 56;
      const seatTierText = result.seatNumbers || booking?.seatNumbers || "General Entry";

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const qrDataUrl = await loadImageAsDataUrl(`${API_HOST}/${ticket.qrCodePath}`);

        if (i > 0) doc.addPage();

        // Dark Banner Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 90, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("FESTORA OFFICIAL E-TICKET", marginX, 46);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(
          tickets.length > 1 ? `Gate Pass ${i + 1} of ${tickets.length} · Seat/Tier: ${seatTierText}` : `Gate Pass · Seat/Tier: ${seatTierText}`,
          marginX,
          68
        );

        let y = 130;
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        const titleText = result.eventTitle || booking?.eventTitle || "Festora Event";
        doc.text(titleText, marginX, y);

        y += 24;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(71, 85, 105);
        const vName = result.venueName || booking?.venueName || "Central Convention Hall";
        const vAddr = result.venueAddress || booking?.venueAddress || "";
        doc.text(`Venue: ${vName}${vAddr ? " (" + vAddr + ")" : ""}`, marginX, y);
        y += 26;

        const detailRow = (label, value) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(148, 163, 184);
          doc.text(label.toUpperCase(), marginX, y);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(15, 23, 42);
          doc.text(String(value), marginX + 160, y);
          y += 30;
        };

        detailRow("Ticket Number", ticket.ticketNumber || `TKT-${bookingId}-${i+1}`);
        detailRow("Seat / Tier No", seatTierText);
        
        const startText = formatDateTime(result.eventStartDatetime || booking?.eventStartDatetime);
        const endText = formatDateTime(result.eventEndDatetime || booking?.eventEndDatetime);
        if (startText) detailRow("Event Starts", startText);
        if (endText) detailRow("Event Ends", endText);
        
        const amountVal = result.totalAmount || booking?.totalAmount;
        if (amountVal) detailRow("Total Amount Paid", `₹${amountVal}`);

        const qrSize = 180;
        const qrX = (pageWidth - qrSize) / 2;
        y += 15;
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(qrX - 16, y - 16, qrSize + 32, qrSize + 32, 8, 8);
        doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

        y += qrSize + 35;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text("Present this digital QR code gate pass at venue entrance for scanning.", pageWidth / 2, y, {
          align: "center",
        });
      }

      const fileBase = tickets.length > 1 ? `festora-tickets-${seatTierText.replace(/\s+/g, "_")}` : (tickets[0].ticketNumber || `festora-ticket-${seatTierText.replace(/\s+/g, "_")}`);
      doc.save(`${fileBase}.pdf`);
    } catch (err) {
      console.error("Failed to generate ticket PDF:", err);
      setDownloadError("Couldn't generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container mt-5 text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container mt-5">
          <div className="alert alert-danger rounded-4 shadow-sm p-4 text-center">
            {error || "Booking not found."}
          </div>
        </div>
      </div>
    );
  }

  const currentSeatTier = booking.seatNumbers || "General Entry";

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar />

      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            {/* Elevated Main Card Container */}
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
              
              {/* Dark Indigo Hero Header */}
              <div
                className="dashboard-hero-banner"
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
                  borderRadius: "0",
                  padding: "32px 36px",
                  color: "#ffffff",
                }}
              >
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <span className="badge hero-badge-light">
                    <FiShield className="text-primary me-1" /> Secure Payment Gateway
                  </span>
                  <span className="badge bg-white text-dark fw-bold px-3 py-2 fs-6 shadow-sm">
                    Seat / Tier No: {currentSeatTier}
                  </span>
                </div>

                {step === "success" ? (
                  <>
                    <h2 className="fw-bold mb-1 text-white" style={{ color: "#ffffff", fontSize: "2rem" }}>
                      🎉 Payment & Booking Confirmed!
                    </h2>
                    <p className="mb-0 small" style={{ color: "#e2e8f0", fontSize: "0.95rem" }}>
                      Your digital gate pass ticket has been issued below and emailed to your inbox.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="fw-bold mb-1 text-white" style={{ color: "#ffffff", fontSize: "2rem" }}>
                      Complete Your Reservation
                    </h2>
                    <p className="mb-0 small" style={{ color: "#e2e8f0", fontSize: "0.95rem" }}>
                      Review order details and select your preferred payment mode to issue tickets.
                    </p>
                  </>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 p-md-5">
                
                {/* STEP 1: SUMMARY */}
                {step === "summary" && (
                  <>
                    <h4 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                      <FiBookmark className="text-primary" /> Order Summary
                    </h4>

                    <div className="bg-light rounded-4 p-4 border mb-4">
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <span className="text-muted fw-semibold">Event Title</span>
                        <strong className="text-dark fs-5">{booking.eventTitle}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <span className="text-muted fw-semibold">Seat / Tier No</span>
                        <strong className="text-dark fs-5">{currentSeatTier}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <span className="text-muted fw-semibold">Ticket Quantity</span>
                        <strong className="text-dark">{booking.quantity} Ticket(s)</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-3">
                        <span className="fw-bold text-dark fs-5">Total Payable</span>
                        <strong className="text-success fs-3">₹{booking.totalAmount}</strong>
                      </div>
                    </div>

                    {error && <div className="alert alert-danger rounded-4 fw-semibold mb-4">{error}</div>}

                    {/* MAIN PRIMARY BUTTON: Razorpay Gateway */}
                    <button
                      className="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold shadow mb-3 d-flex align-items-center justify-content-center gap-2"
                      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)", border: "none" }}
                      onClick={handleRazorpayPay}
                      disabled={starting}
                    >
                      <FiZap className="text-warning" size={22} />
                      {starting ? "Launching Payment Gateway…" : `Pay ₹${booking.totalAmount} via Razorpay Gateway`}
                    </button>

                    {/* SECONDARY BUTTON: FestoraPay Modal Gateway */}
                    <button
                      className="btn btn-outline-primary btn-lg w-100 rounded-pill py-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setShowFestoraPayModal(true)}
                      disabled={starting}
                    >
                      <FiShield size={20} />
                      Pay ₹{booking.totalAmount} via FestoraPay Gateway
                    </button>

                    <div className="text-center text-muted small d-flex align-items-center justify-content-center gap-1 mt-3">
                      <FiCheckCircle className="text-success" /> Razorpay & FestoraPay HMAC Cryptography & Instant Gate Pass QR Code Generation
                    </div>
                  </>
                )}

                {/* STEP 2: DIRECT TEST CHECKOUT FORM */}
                {step === "checkout" && order && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <button className="btn btn-outline-secondary btn-sm rounded-pill fw-bold" onClick={closeCheckout}>
                        <FiChevronLeft className="me-1" /> Back
                      </button>
                      <span className="text-muted small">Txn ID: <strong className="text-dark">{order.transactionId}</strong></span>
                    </div>

                    <div className="bg-light rounded-4 p-4 mb-4 text-center border">
                      <div className="text-muted small text-uppercase fw-bold mb-1">Amount to Pay</div>
                      <h2 className="fw-bold text-success mb-0">₹{order.amount}</h2>
                    </div>

                    {/* Method Selector Tabs */}
                    <div className="row g-2 mb-4">
                      {METHODS.map((m) => {
                        const Icon = m.icon;
                        const isSelected = method === m.id;
                        return (
                          <div className="col" key={m.id}>
                            <button
                              type="button"
                              className={`btn w-100 py-3 rounded-4 d-flex flex-column align-items-center gap-1 fw-bold ${
                                isSelected ? "btn-primary shadow" : "btn-outline-secondary border-secondary-subtle bg-white text-dark"
                              }`}
                              onClick={() => setMethod(m.id)}
                            >
                              <Icon size={20} />
                              <span style={{ fontSize: "0.75rem" }}>{m.label}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Checkout Inputs */}
                    <form onSubmit={handlePay}>
                      {method === "RAZORPAY" && (
                        <div className="bg-light rounded-4 p-4 text-center border mb-4">
                          <FiZap className="text-warning mb-2" size={36} />
                          <h5 className="fw-bold text-dark">Razorpay Payment Gateway</h5>
                          <p className="text-muted small mb-3">
                            Click below to open the Razorpay payment modal with support for UPI, Cards, Netbanking, and Wallets.
                          </p>
                          <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow"
                            onClick={handleRazorpayPay}
                            disabled={starting}
                          >
                            Open Razorpay Checkout Popup
                          </button>
                        </div>
                      )}

                      {method === "CARD" && (
                        <div className="bg-white rounded-4 p-3 border mb-4">
                          <div className="mb-3">
                            <label className="form-label fw-bold text-dark small">Card Number</label>
                            <input
                              type="text"
                              placeholder="4111 1111 1111 1111"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              className="form-control rounded-3 py-2 fw-semibold"
                              required
                            />
                          </div>
                          <div className="row g-3">
                            <div className="col-6">
                              <label className="form-label fw-bold text-dark small">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                placeholder="12/28"
                                maxLength={5}
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="form-control rounded-3 py-2 fw-semibold"
                                required
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label fw-bold text-dark small">CVV</label>
                              <input
                                type="password"
                                placeholder="123"
                                maxLength={3}
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                                className="form-control rounded-3 py-2 fw-semibold"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {method === "UPI" && (
                        <div className="bg-white rounded-4 p-3 border mb-4">
                          <label className="form-label fw-bold text-dark small">UPI ID Address</label>
                          <input
                            type="text"
                            placeholder="yourname@bank / mobile@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="form-control rounded-3 py-2 fw-semibold"
                            required
                          />
                        </div>
                      )}

                      {method === "NETBANKING" && (
                        <div className="bg-white rounded-4 p-3 border mb-4">
                          <label className="form-label fw-bold text-dark small">Select Banking Institution</label>
                          <select value={bank} onChange={(e) => setBank(e.target.value)} className="form-select rounded-3 py-2 fw-semibold">
                            <option>State Bank of India</option>
                            <option>HDFC Bank</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                            <option>Punjab National Bank</option>
                          </select>
                        </div>
                      )}

                      {method === "WALLET" && (
                        <div className="bg-white rounded-4 p-3 border mb-4">
                          <label className="form-label fw-bold text-dark small">Select Wallet Partner</label>
                          <select value={wallet} onChange={(e) => setWallet(e.target.value)} className="form-select rounded-3 py-2 fw-semibold">
                            <option>FestoraWallet</option>
                            <option>PayZone</option>
                            <option>QuickPay</option>
                          </select>
                        </div>
                      )}

                      {method !== "RAZORPAY" && (
                        <button className="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold shadow" type="submit">
                          Confirm & Pay ₹{order.amount}
                        </button>
                      )}
                    </form>
                  </>
                )}

                {/* STEP 3: PROCESSING */}
                {step === "processing" && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
                      <span className="visually-hidden">Processing payment...</span>
                    </div>
                    <h3 className="fw-bold text-dark">Verifying Signature & Authenticating Token...</h3>
                    <p className="text-muted small">Cryptographically validating HMAC SHA-256 token and generating digital QR tickets. Please wait.</p>
                  </div>
                )}

                {/* STEP 4: SUCCESS WITH E-TICKET PASS */}
                {step === "success" && result && (
                  <div>
                    {(() => {
                      const tickets = result.tickets?.length
                        ? result.tickets
                        : (result.qrCodePath
                            ? [{ ticketNumber: result.ticketNumber, qrCodePath: result.qrCodePath }]
                            : []);

                      if (!tickets.length) return null;

                      return (
                        <div className="row g-4 mb-4">
                          {tickets.map((ticket, idx) => (
                            <div className={tickets.length > 1 ? "col-md-6" : "col-12"} key={ticket.ticketNumber || idx}>
                              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white text-center" style={{ border: "2px dashed #cbd5e1" }}>
                                {/* Ticket Dark Header */}
                                <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                  <span className="fw-bold tracking-wide">FESTORA E-TICKET</span>
                                  <span className="badge bg-primary text-white">{ticket.ticketNumber}</span>
                                </div>

                                <div className="p-4">
                                  <h4 className="fw-bold text-dark mb-1">{result.eventTitle || booking?.eventTitle}</h4>
                                  <p className="text-muted small mb-3">{result.venueName || booking?.venueName || "Central Convention Hall"}</p>

                                  {/* QR Code */}
                                  <div className="d-inline-block p-3 bg-light rounded-4 border mb-3">
                                    <img
                                      src={`${API_HOST}/${ticket.qrCodePath}`}
                                      alt={`QR code for ticket ${ticket.ticketNumber}`}
                                      style={{ width: 180, height: 180, borderRadius: 8 }}
                                    />
                                  </div>

                                  <div className="bg-light p-3 rounded-4 border d-flex justify-content-around text-start">
                                    <div>
                                      <div className="text-muted small">Seat / Tier No</div>
                                      <strong className="text-dark">{result.seatNumbers || booking?.seatNumbers || "General Entry"}</strong>
                                    </div>
                                    <div>
                                      <div className="text-muted small">Ticket Ref</div>
                                      <strong className="text-primary">{ticket.ticketNumber}</strong>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {downloadError && <div className="alert alert-danger rounded-4 fw-semibold mb-3">{downloadError}</div>}

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary btn-lg rounded-pill py-3 fw-bold shadow"
                        onClick={downloadTicketPdf}
                        disabled={downloading || !(result.tickets?.length || result.qrCodePath)}
                      >
                        <FiDownload className="me-2" />
                        {downloading
                          ? "Preparing Ticket PDF…"
                          : result.tickets?.length > 1
                          ? "Download All Gate Pass Tickets (PDF)"
                          : "Download Gate Pass Ticket (PDF)"}
                      </button>
                      <button
                        className="btn btn-outline-secondary rounded-pill py-2 fw-bold"
                        onClick={() => navigate("/userbookings?status=success")}
                      >
                        View All My Bookings
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: FAILED */}
                {step === "failed" && result && (
                  <div className="text-center py-4">
                    <FiXCircle className="text-danger mb-3" size={64} />
                    <h3 className="fw-bold text-dark mb-2">Payment Transaction Failed</h3>
                    <p className="text-muted small mb-4">{result.message}</p>
                    <button className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow" onClick={retry}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 💳 SECONDARY FESTORAPAY CHECKOUT MODAL UI */}
      {showFestoraPayModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            padding: "20px",
          }}
        >
          <div
            className="card border-0 rounded-4 shadow-lg overflow-hidden bg-white w-100"
            style={{ maxWidth: "520px" }}
          >
            {/* Modal Hero Header */}
            <div
              className="p-4 text-white position-relative"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
              }}
            >
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                onClick={() => setShowFestoraPayModal(false)}
                aria-label="Close"
              />
              <div className="d-flex align-items-center gap-2 mb-2">
                <FiZap className="text-warning" size={24} />
                <span className="fw-bold tracking-wider fs-5">FestoraPay</span>
                <span className="badge bg-white text-dark small fw-bold px-2 py-1">CHECKOUT GATEWAY</span>
              </div>
              <h4 className="fw-bold mb-1 text-white">{booking.eventTitle}</h4>
              <div className="d-flex justify-content-between align-items-end mt-3">
                <span className="text-light small">Seat / Tier: {currentSeatTier}</span>
                <div className="text-end">
                  <div className="text-uppercase text-light small fw-bold">Total Amount</div>
                  <h2 className="fw-bold text-success mb-0">₹{booking.totalAmount}</h2>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="text-muted small fw-bold text-uppercase mb-3">Select Preferred Payment Mode</div>

              {/* Method Selector Tabs */}
              <div className="row g-2 mb-4">
                {METHODS.filter((m) => m.id !== "RAZORPAY").map((m) => {
                  const Icon = m.icon;
                  const isSelected = method === m.id;
                  return (
                    <div className="col-3" key={m.id}>
                      <button
                        type="button"
                        className={`btn w-100 py-3 rounded-4 d-flex flex-column align-items-center gap-1 fw-bold ${
                          isSelected
                            ? "btn-primary shadow"
                            : "btn-outline-secondary border-secondary-subtle bg-white text-dark"
                        }`}
                        onClick={() => setMethod(m.id)}
                      >
                        <Icon size={20} />
                        <span style={{ fontSize: "0.75rem" }}>{m.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleFestoraPaySubmit}>
                {method === "CARD" && (
                  <div className="bg-light rounded-4 p-3 border mb-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark small">Card Number</label>
                      <input
                        type="text"
                        placeholder="Enter Card Number (e.g. 4111 1111 1111 1111)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="form-control rounded-3 py-2 fw-semibold"
                      />
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label fw-bold text-dark small">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="form-control rounded-3 py-2 fw-semibold"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold text-dark small">CVV</label>
                        <input
                          type="password"
                          placeholder="CVV"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                          className="form-control rounded-3 py-2 fw-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === "UPI" && (
                  <div className="bg-light rounded-4 p-3 border mb-4">
                    <label className="form-label fw-bold text-dark small">UPI ID / VPA</label>
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g. yourname@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="form-control rounded-3 py-2 fw-semibold mb-2"
                    />
                  </div>
                )}

                {method === "NETBANKING" && (
                  <div className="bg-light rounded-4 p-3 border mb-4">
                    <label className="form-label fw-bold text-dark small">Select Bank</label>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="form-select rounded-3 py-2 fw-semibold"
                    >
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {method === "WALLET" && (
                  <div className="bg-light rounded-4 p-3 border mb-4">
                    <label className="form-label fw-bold text-dark small">Select Wallet Partner</label>
                    <select
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      className="form-select rounded-3 py-2 fw-semibold"
                    >
                      <option>FestoraWallet</option>
                      <option>PayZone</option>
                      <option>QuickPay</option>
                    </select>
                  </div>
                )}

                {/* Primary FestoraPay Checkout Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold shadow d-flex align-items-center justify-content-center gap-2"
                  style={{ background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)", border: "none" }}
                  disabled={starting}
                >
                  <FiZap className="text-warning" size={22} />
                  Pay ₹{booking.totalAmount} via FestoraPay
                </button>
              </form>

              <div className="text-center text-muted small mt-3">
                <FiCheckCircle className="text-success me-1" /> Encrypted HMAC Signature Verification & Instant Gate Pass
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
