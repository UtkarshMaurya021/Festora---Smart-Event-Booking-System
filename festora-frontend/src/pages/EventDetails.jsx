import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { bookEvent } from "../services/bookingService";
import EventImageSlider from "../components/EventImageSlider";

// Formats an ISO datetime string into something readable, e.g.
// "12 Aug 2026, 6:00 pm". Falls back gracefully if the value is missing
// or not a valid date.
function formatDateTime(dt) {
  if (!dt) return "N/A";
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

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/user/events/${id}`)
      .then((res) => {
        setEvent(res.data || {});
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setError("Could not load this event. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const book = async () => {
    try {
      const res = await bookEvent({
        eventId: event.eventId,

        quantity,
      });

     navigate(`/payment/${res.data.bookingId}`);
    } catch (e) {
      alert(e.response?.data || "Booking Failed");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const venue = event.venue || {};
  const category = event.category || {};

  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow-sm overflow-hidden">
        <EventImageSlider images={event.images} height={320} />

        <div className="p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
            <h2 className="mb-0">{event.title}</h2>
            {category.categoryName && (
              <span className="badge bg-primary-subtle text-primary align-self-center">
                {category.categoryName}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-muted mb-4">{event.description}</p>
          )}

          <div className="row g-3 mb-4">
            <div className="col-sm-6">
              <div className="border rounded p-3 h-100">
                <div className="text-muted small text-uppercase mb-1">
                  Starts
                </div>
                <div className="fw-semibold">
                  {formatDateTime(event.eventStartDatetime)}
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="border rounded p-3 h-100">
                <div className="text-muted small text-uppercase mb-1">
                  Ends
                </div>
                <div className="fw-semibold">
                  {formatDateTime(event.eventEndDatetime)}
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="border rounded p-3 h-100">
                <div className="text-muted small text-uppercase mb-1">
                  Venue
                </div>
                <div className="fw-semibold">
                  {venue.venueName || "N/A"}
                </div>
                {venue.address && (
                  <div className="text-muted small">
                    {venue.address}
                    {venue.city ? `, ${venue.city}` : ""}
                    {venue.state ? `, ${venue.state}` : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="col-sm-6">
              <div className="border rounded p-3 h-100">
                <div className="text-muted small text-uppercase mb-1">
                  Price &amp; Seats
                </div>
                <div className="fw-semibold">₹{event.price}</div>
                <div className="text-muted small">
                  {event.availableSeats} seat
                  {event.availableSeats === 1 ? "" : "s"} available
                </div>
              </div>
            </div>
          </div>

          <label className="form-label fw-bold">Number of Tickets</label>
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
    </div>
  );
}
export default EventDetails;
