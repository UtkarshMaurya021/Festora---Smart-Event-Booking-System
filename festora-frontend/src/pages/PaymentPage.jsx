import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBooking } from '../services/bookingService';
import { createOrder, verifyPayment } from '../services/paymentService';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await getBooking(bookingId);
        setBooking(response.data);
      } catch (error) {
        console.error("Failed to load booking details:", error);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePayment = async () => {
    try {
      const orderResponse = await createOrder(bookingId);
      const paymentData = orderResponse.data;

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Festora",
        description: "Event Booking",
        order_id: paymentData.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: bookingId
            });

            if (verifyResponse.status === 200) {
              navigate('/my-bookings?status=success');
            } else {
              alert('Payment verification failed.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: paymentData.name || "",
          email: paymentData.email || "",
          contact: paymentData.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Initialization error:', error);
      alert('Could not initialize payment window. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading payment details...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="payment-container">
      <h1>Complete Your Booking</h1>
      <div className="booking-summary">
        <h3>{booking.eventTitle}</h3>
        <p><strong>Booking ID:</strong> {bookingId}</p>
        <p><strong>Status:</strong> <span className="status-pending">{booking.status}</span></p>
        <p className="total-amount"><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>
      </div>
      <button className="pay-now-btn" onClick={handlePayment}>
        Pay Now
      </button>
    </div>
  );
};

export default PaymentPage;