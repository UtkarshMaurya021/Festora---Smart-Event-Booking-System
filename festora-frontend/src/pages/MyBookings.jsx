import { useEffect, useState } from "react";
import axios from "axios";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios
      .get(
        "http://localhost:8080/api/bookings/my",

        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      )

      .then((res) => setBookings(res.data));
  }, []);

  return (
    <div className="container">
      <h2>My Bookings</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Event</th>

            <th>Seats</th>

            <th>Total</th>

            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b.bookingId}>
              <td>{b.eventTitle}</td>

              <td>{b.quantity}</td>

              <td>₹ {b.totalAmount}</td>

              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyBookings;
