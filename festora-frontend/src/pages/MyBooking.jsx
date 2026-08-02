import { useEffect, useState } from "react";
import { getMyBookings } from "../services/bookingService";
import { Link } from "react-router-dom";
function MyBooking() {
  const load = () => {
    getMyBookings().then((res) => {
      setBookings(res.data);
    });
  };

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Bookings</h2>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Event</th>

            <th>Quantity</th>

            <th>Total</th>

            <th>Date</th>

            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b.bookingId}>
              <td>{b.event.title}</td>

              <td>{b.quantity}</td>

              <td>₹{b.totalAmount}</td>

              <td>{b.bookingDate}</td>

              <td>
                <Link
                  to={`/payment/${b.bookingId}`}
                  className="btn btn-warning"
                >
                  Pay
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyBooking;
