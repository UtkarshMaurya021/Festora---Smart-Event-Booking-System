import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { bookEvent } from "../services/bookingService";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({});
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data);
      });
  }, []);

  const book = async () => {
    try {
      const res = await bookEvent({
        eventId: event.eventId,

        quantity,
      });

      navigate("/payment", {
        state: {
          bookingId: res.data.bookingId,
        },
      });
    } catch (e) {
      alert(e.response?.data || "Booking Failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h2>{event.title}</h2>
        <p>{event.description}</p>
        <h5>Price : ₹{event.price}</h5>
        <h6>Available Seats :{event.availableSeats}</h6>
        <input
          type="number"
          min="1"
          max={event.availableSeats}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="form-control mb-3"
        />
        <button className="btn btn-success" onClick={book}>
          Book Ticket
        </button>
      </div>
    </div>
  );
}
export default EventDetails;
