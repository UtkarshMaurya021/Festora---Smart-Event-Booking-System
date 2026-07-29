import{ useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch booking details on mount
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        const data = await response.json();
        
        if (data.status !== 'Pending Payment') {
          navigate('/my-bookings');
          return;
        }
        setBooking(data);
      } catch (error) {
        console.error("Failed to load banking details:",error);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate]);

  // Handle the Razorpay payment flow
  const handlePayment = async () => {
    try {
      // 1. Matches your @PostMapping("/create-order/{bookingId}") path variable configuration
      const orderResponse = await fetch(`/api/payments/create-order/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!orderResponse.ok) throw new Error('Order creation failed on server');
      
      // Assumes your Payment entity returns razorpayOrderId and amount fields
      const paymentData = await orderResponse.json();

      // 2. Configure Razorpay options using properties from backend Payment entity
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: paymentData.amount, // Amount in paise, handled by backend
        currency: "INR",
        name: "Festora",
        description: "Event Booking",
        order_id: paymentData.razorpayOrderId, // Matches field from your Payment entity
        handler: async function (response) {
          // 3. Send payment tokens back to your server for signature verification
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: bookingId
              }),
            });
            
            if (verifyResponse.ok) {
              navigate('/my-bookings?status=success');
            } else {
              alert('Payment verification failed.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Error verification connection failed.');
          }
        },
        prefill: {
          name: booking?.user?.name || "",
          email: booking?.user?.email || "",
          contact: booking?.user?.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      // 4. Fire Razorpay Checkout window
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
        <h3>{booking.eventName}</h3>
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
