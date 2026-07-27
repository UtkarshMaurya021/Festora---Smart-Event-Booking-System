import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/events/" + id)

      .then((res) => setEvent(res.data));
  }, []);

  if (!event) {
    return <h3>Loading...</h3>;
  }

  const book = () => {
    axios
      .post(
        "http://localhost:8080/api/bookings",

        {
          eventId: event.eventId,

          quantity: quantity,
        },

        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      )

      .then(() => {
        alert("Booking Successful");
      })

      .catch((err) => {
        alert(err.response.data);
      });
  };

  return (
    <div className="container mt-5">
      <h2>{event.title}</h2>

      <p>{event.description}</p>

      <p>
        <b>Venue :</b> {event.venue.venueName}
      </p>

      <p>
        <b>Category :</b> {event.category.categoryName}
      </p>

      <p>
        <b>Price :</b> ₹ {event.price}
      </p>

      <p>
        <b>Seats :</b> {event.availableSeats}
      </p>

      <input
        type="number"
        min="1"
        className="form-control"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <br />

      <button className="btn btn-success" onClick={book}>
        Book Now
      </button>
    </div>
  );
}

export default EventDetails;
