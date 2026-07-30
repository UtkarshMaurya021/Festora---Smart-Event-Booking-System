import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

        {/* ---------------- SUCCESS ---------------- */}
        {step === "success" && result && (
          <div className="payment-status-screen">
            <FiCheckCircle className="payment-status-icon payment-status-icon-success" />
            <h2 className="payment-status-title">Payment successful</h2>
            <p className="payment-status-text">
              {result.ticketNumber
                ? `Your ticket ${result.ticketNumber} has been issued.`
                : "Your booking is confirmed."}
            </p>
            <button className="payment-pay-btn" onClick={() => navigate("/my-bookings?status=success")}>
              View my bookings
            </button>
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
