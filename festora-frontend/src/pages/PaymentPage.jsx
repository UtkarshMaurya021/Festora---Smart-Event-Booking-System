import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBooking } from "../services/bookingService";
import {
  createOrder,
  verifyPayment,
  markPaymentFailed,
} from "../services/paymentService";
import { FiShield, FiCheckCircle } from "react-icons/fi";

/**
 * Real Razorpay Checkout integration, matching the PAYMENT entity in the
 * ER diagram (razorpay_order_id / razorpay_payment_id / razorpay_signature,
 * amount, status, payment_date).
 *
 * Flow:
 *  1. POST /api/payments/create-order  -> { orderId, amount, currency, key, name, email, phone }
 *  2. Open Razorpay's checkout.js widget with that order
 *  3. On success, Razorpay returns razorpay_order_id / razorpay_payment_id / razorpay_signature
 *  4. POST /api/payments/verify -> backend checks the signature and issues the ticket
 *  5. On dismiss/failure, POST /api/payments/fail so the Payment row doesn't sit PENDING forever
 *
 * TEST MODE CARDS (Razorpay test mode only, never real money):
 *   Card:        4111 1111 1111 1111, any future expiry, any CVV, OTP 1234 (or whatever the modal shows)
 *   UPI success: success@razorpay
 *   UPI failure: failure@razorpay
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

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

  const handlePayNow = async () => {
    setError("");
    setProcessing(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Couldn't load the payment gateway. Check your internet connection and try again.");
      setProcessing(false);
      return;
    }

    try {
      // Step 1: ask our backend to create a Razorpay order for this booking
      const { data: order } = await createOrder(bookingId);

      // Step 2: open Razorpay's checkout widget
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Festora",
        description: booking?.eventTitle || "Event booking",
        order_id: order.orderId,
        prefill: {
          name: order.name,
          email: order.email,
          contact: order.phone,
        },
        theme: { color: "#2563EB" },
        handler: async (response) => {
          // Step 3: payment succeeded on Razorpay's side -> verify signature on our backend
          try {
            await verifyPayment({
              bookingId: Number(bookingId),
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate("/my-bookings?status=success");
          } catch (err) {
            console.error("Verification failed:", err);
            setError("Payment went through, but we couldn't verify it. Please contact support with your payment ID.");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          // User closed the widget without paying
          ondismiss: async () => {
            setProcessing(false);
            try {
              await markPaymentFailed(bookingId);
            } catch (err) {
              console.error("Failed to record payment cancellation:", err);
            }
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      // Payment failed inside the widget (card declined, etc.)
      razorpay.on("payment.failed", async () => {
        setProcessing(false);
        setError("Payment failed. Please try again.");
        try {
          await markPaymentFailed(bookingId);
        } catch (err) {
          console.error("Failed to record payment failure:", err);
        }
      });

      razorpay.open();
    } catch (err) {
      console.error("Could not start payment:", err);
      setError(
        err.response?.data?.message ||
          "Couldn't start the payment. Please try again."
      );
      setProcessing(false);
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
          <span>Secured by Razorpay · Test Mode</span>
        </div>

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

        <button
          className="payment-pay-btn"
          onClick={handlePayNow}
          disabled={processing}
        >
          {processing ? "Processing…" : `Pay ₹${booking.totalAmount}`}
        </button>

        <p className="payment-footnote">
          <FiCheckCircle /> Your card details never touch our servers.
        </p>
      </div>
    </div>
  );
}

export default PaymentPage;
