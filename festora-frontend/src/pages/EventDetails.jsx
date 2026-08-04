import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { bookEvent } from "../services/bookingService";
import EventImageSlider from "../components/EventImageSlider";

const SEAT_TIERS = [
  { id: "VVIP", name: "Tier 1: VVIP / Diamond", multiplier: 2.5, badge: "2.5x Base Price", description: "Front Row Premium Access (10% Seats)" },
  { id: "VIP", name: "Tier 2: VIP / Platinum", multiplier: 2.0, badge: "2.0x Base Price", description: "Executive Viewing Lounge (15% Seats)" },
  { id: "PREMIUM", name: "Tier 3: Premium / Gold", multiplier: 1.5, badge: "1.5x Base Price", description: "Prime Center Sound & View (20% Seats)" },
  { id: "EXECUTIVE", name: "Tier 4: Executive / Silver", multiplier: 1.2, badge: "1.2x Base Price", description: "Elevated Mid-Section (25% Seats)" },
  { id: "STANDARD", name: "Tier 5: Standard / General", multiplier: 1.0, badge: "1.0x Base Price", description: "Standard General Admission (30% Seats)" },
];

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
  const [selectedTier, setSelectedTier] = useState("STANDARD");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/user/events/${id}`)
      .then((res) => {
        setEvent(res.data || {});
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching event details:", err);
        setError("Could not load this event. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const currentTierObj = SEAT_TIERS.find((t) => t.id === selectedTier) || SEAT_TIERS[4];
  const basePrice = event.price || 500;
  const ticketPrice = Math.round(basePrice * currentTierObj.multiplier);
  const totalAmount = ticketPrice * quantity;

  const book = async () => {
    setBookingError("");
    if (quantity <= 0) {
      setBookingError("⚠️ Please select at least 1 ticket.");
      return;
    }

    // Generate tier-based seat identifiers (e.g. VVIP-1, VVIP-2)
    const generatedSeats = Array.from({ length: quantity }, (_, i) => `${currentTierObj.id}-${i + 1}`);

    setBookingLoading(true);
    try {
      const res = await bookEvent({
        eventId: event.eventId,
        quantity,
        seatNumbers: generatedSeats,
      });

      navigate(`/payment/${res.data.bookingId}`);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || "Booking Failed. Please try again.";
      setBookingError(typeof msg === "string" ? msg : "Booking failed. Please check your ticket details.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading event details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger rounded-4">{error}</div>
      </div>
    );
  }

  const venue = event.venue || {};
  const category = event.category || {};

  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow-lg overflow-hidden" style={{ background: "#0f172a", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20 }}>
        <EventImageSlider images={event.images} height={320} />

        <div className="p-4">
          {/* Header & Category */}
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
            <h2 className="mb-0 fw-bold">{event.title}</h2>
            {category.categoryName && (
              <span className="badge bg-info text-dark align-self-center px-3 py-2 fw-bold">
                {category.categoryName}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-light opacity-75 mb-4">{event.description}</p>
          )}

          {/* Event Details Grid */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-md-3">
              <div className="border border-secondary-subtle rounded-4 p-3 h-100 bg-dark bg-opacity-50">
                <div className="text-info small text-uppercase fw-bold mb-1">Starts</div>
                <div className="fw-semibold">{formatDateTime(event.eventStartDatetime)}</div>
              </div>
            </div>

            <div className="col-sm-6 col-md-3">
              <div className="border border-secondary-subtle rounded-4 p-3 h-100 bg-dark bg-opacity-50">
                <div className="text-info small text-uppercase fw-bold mb-1">Ends</div>
                <div className="fw-semibold">{formatDateTime(event.eventEndDatetime)}</div>
              </div>
            </div>

            <div className="col-sm-6 col-md-3">
              <div className="border border-secondary-subtle rounded-4 p-3 h-100 bg-dark bg-opacity-50">
                <div className="text-info small text-uppercase fw-bold mb-1">Venue</div>
                <div className="fw-semibold">{venue.venueName || "N/A"}</div>
                {venue.address && (
                  <div className="text-muted small">
                    {venue.address}
                    {venue.city ? `, ${venue.city}` : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="col-sm-6 col-md-3">
              <div className="border border-secondary-subtle rounded-4 p-3 h-100 bg-dark bg-opacity-50">
                <div className="text-info small text-uppercase fw-bold mb-1">Base Price & Seats</div>
                <div className="fw-bold fs-5 text-warning">₹{basePrice}</div>
                <div className="text-muted small">{event.availableSeats} seats remaining</div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="card bg-dark bg-opacity-75 border-secondary-subtle rounded-4 p-4 mb-4">
            <h4 className="fw-bold text-info mb-3">🎟️ Select Seat Tier & Quantity</h4>

            {/* 1. Choose Tier (5 Options) */}
            <div className="mb-4">
              <label className="form-label fw-bold mb-2">1. Choose Seat Tier (5 Options):</label>
              <div className="row g-2">
                {SEAT_TIERS.map((tier) => {
                  const isSelected = selectedTier === tier.id;
                  const price = Math.round(basePrice * tier.multiplier);
                  return (
                    <div className="col-12 col-md-6 col-lg-4" key={tier.id}>
                      <div
                        className={`p-3 rounded-4 border cursor-pointer h-100 transition-all ${
                          isSelected
                            ? "border-info bg-info bg-opacity-20 shadow"
                            : "border-secondary bg-dark bg-opacity-50 opacity-75"
                        }`}
                        onClick={() => setSelectedTier(tier.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className={isSelected ? "text-info" : "text-white"}>{tier.name}</strong>
                          <span className="badge bg-warning text-dark fw-bold">₹{price}</span>
                        </div>
                        <p className="small text-white-50 mb-0">{tier.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Number of Tickets */}
            <div className="row align-items-center g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label fw-bold">2. Number of Tickets:</label>
                <input
                  type="number"
                  min="1"
                  max={event.availableSeats || 10}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="form-control bg-dark text-white border-secondary rounded-3"
                  style={{ maxWidth: 200 }}
                />
              </div>

              <div className="col-sm-6 text-sm-end">
                <div className="text-muted small">Selected Tier: <strong>{currentTierObj.name}</strong></div>
                <div className="text-muted small">Price Per Ticket: <strong>₹{ticketPrice}</strong></div>
                <div className="fs-4 fw-bold text-warning mt-1">Total: ₹{totalAmount}</div>
              </div>
            </div>
          </div>

          {/* Inline Error Message */}
          {bookingError && (
            <div className="alert alert-danger rounded-4 fw-semibold mb-3">
              {bookingError}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="btn btn-success btn-lg px-5 py-3 fw-bold w-100 rounded-4"
            onClick={book}
            disabled={bookingLoading}
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", border: "none" }}
          >
            {bookingLoading ? "Processing Booking..." : `Proceed to Payment (Total: ₹${totalAmount})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
