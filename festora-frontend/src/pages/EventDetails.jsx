import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { bookEvent } from "../services/bookingService";
import EventImageSlider from "../components/EventImageSlider";
import Navbar from "../components/Navbar";
import { FiCalendar, FiClock, FiMapPin, FiTag, FiCheckCircle, FiArrowLeft, FiCreditCard } from "react-icons/fi";

const SEAT_TIERS = [
  { id: "VVIP", name: "Tier 1: VVIP / Diamond", multiplier: 2.5, badge: "2.5x Base", description: "Front Row Premium Access (10% Seats)" },
  { id: "VIP", name: "Tier 2: VIP / Platinum", multiplier: 2.0, badge: "2.0x Base", description: "Executive Viewing Lounge (15% Seats)" },
  { id: "PREMIUM", name: "Tier 3: Premium / Gold", multiplier: 1.5, badge: "1.5x Base", description: "Prime Center Sound & View (20% Seats)" },
  { id: "EXECUTIVE", name: "Tier 4: Executive / Silver", multiplier: 1.2, badge: "1.2x Base", description: "Elevated Mid-Section (25% Seats)" },
  { id: "STANDARD", name: "Tier 5: Standard / General", multiplier: 1.0, badge: "1.0x Base", description: "Standard General Admission (30% Seats)" },
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
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container mt-5 text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading event details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container mt-5">
          <div className="alert alert-danger rounded-4 shadow-sm">{error}</div>
        </div>
      </div>
    );
  }

  const venue = event.venue || {};
  const category = event.category || {};

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar />

      <div className="container mt-4">
        {/* Back Link */}
        <div className="mb-3">
          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill fw-bold border-0 bg-white shadow-sm px-3">
            <FiArrowLeft className="me-1" /> Back to Events
          </button>
        </div>

        {/* Main Clean Elevated Event Card Surface */}
        <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
          {/* Media Header Slider */}
          <EventImageSlider images={event.images} height={360} />

          <div className="p-4 p-md-5">
            {/* Event Title Banner */}
            <div className="dashboard-hero-banner mb-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)", borderRadius: "16px", padding: "28px 32px" }}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  {category.categoryName && (
                    <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                      <FiTag className="text-primary me-1" /> {category.categoryName}
                    </span>
                  )}
                  <h1 className="fw-bold mb-2 text-white" style={{ color: "#ffffff", fontSize: "2.2rem" }}>{event.title}</h1>
                  {event.description && (
                    <p className="mb-0 small" style={{ color: "#e2e8f0", fontSize: "1rem", maxWidth: "800px" }}>{event.description}</p>
                  )}
                </div>

                <div className="text-md-end bg-white bg-opacity-10 p-3 rounded-4 backdrop-blur border border-white border-opacity-20 text-white">
                  <div className="small text-white-50 text-uppercase fw-bold">Base Ticket Price</div>
                  <div className="fw-bold fs-3 text-warning">₹{basePrice}</div>
                  <div className="badge bg-success px-3 py-1 mt-1">{event.availableSeats || 0} seats left</div>
                </div>
              </div>
            </div>

            {/* Quick Metadata Info Grid */}
            <div className="row g-3 mb-5">
              <div className="col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ border: "1px solid #e2e8f0" }}>
                  <div className="stat-box-indigo rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: 48, height: 48 }}>
                    <FiCalendar size={22} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold mb-1">Starts At</div>
                  <div className="fw-bold text-dark">{formatDateTime(event.eventStartDatetime)}</div>
                </div>
              </div>

              <div className="col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ border: "1px solid #e2e8f0" }}>
                  <div className="stat-box-emerald rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: 48, height: 48 }}>
                    <FiClock size={22} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold mb-1">Ends At</div>
                  <div className="fw-bold text-dark">{formatDateTime(event.eventEndDatetime)}</div>
                </div>
              </div>

              <div className="col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ border: "1px solid #e2e8f0" }}>
                  <div className="stat-box-amber rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: 48, height: 48 }}>
                    <FiMapPin size={22} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold mb-1">Venue Location</div>
                  <div className="fw-bold text-dark">{venue.venueName || "N/A"}</div>
                  {venue.address && (
                    <div className="text-muted small">
                      {venue.address}{venue.city ? `, ${venue.city}` : ""}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ border: "1px solid #e2e8f0" }}>
                  <div className="stat-box-rose rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: 48, height: 48 }}>
                    <FiCreditCard size={22} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold mb-1">Gate Pass Pass Tier</div>
                  <div className="fw-bold text-primary">{currentTierObj.name.split(":")[1] || currentTierObj.name}</div>
                  <div className="text-muted small">Instant QR Generation</div>
                </div>
              </div>
            </div>

            {/* Seat Tier Selection Box */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-light" style={{ border: "1px solid #e2e8f0" }}>
              <h4 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                🎟️ Select Seat Tier & Ticket Quantity
              </h4>

              {/* 1. Choose Tier */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-3">1. Select Your Preferred Viewing Tier:</label>
                <div className="row g-3">
                  {SEAT_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    const price = Math.round(basePrice * tier.multiplier);
                    return (
                      <div className="col-12 col-md-6 col-lg-4" key={tier.id}>
                        <div
                          className={`p-3 rounded-4 border cursor-pointer h-100 transition-all ${
                            isSelected
                              ? "border-primary bg-white shadow-md text-dark"
                              : "border-secondary-subtle bg-white text-dark opacity-90"
                          }`}
                          onClick={() => setSelectedTier(tier.id)}
                          style={{
                            cursor: "pointer",
                            border: isSelected ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                            boxShadow: isSelected ? "0 8px 24px rgba(79, 70, 229, 0.15)" : "none"
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong className={isSelected ? "text-primary" : "text-dark"}>{tier.name}</strong>
                            <span className={`badge ${isSelected ? "bg-primary text-white" : "bg-light text-dark border"} fw-bold`}>₹{price}</span>
                          </div>
                          <p className="small text-muted mb-0">{tier.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Quantity & Order Summary */}
              <div className="row align-items-center g-3 p-3 bg-white rounded-4 border">
                <div className="col-sm-6">
                  <label className="form-label fw-bold text-dark mb-2">2. Number of Tickets:</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={event.availableSeats || 10}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="form-control text-dark border-secondary-subtle rounded-3 py-2 px-3 fw-bold"
                      style={{ maxWidth: 160, fontSize: "1.1rem" }}
                    />
                    <span className="text-muted small">Max: {event.availableSeats || 10}</span>
                  </div>
                </div>

                <div className="col-sm-6 text-sm-end">
                  <div className="text-muted small">Selected Tier: <strong className="text-dark">{currentTierObj.name}</strong></div>
                  <div className="text-muted small">Price Per Ticket: <strong className="text-dark">₹{ticketPrice}</strong></div>
                  <div className="fs-3 fw-bold text-success mt-1">Total Payable: ₹{totalAmount}</div>
                </div>
              </div>
            </div>

            {/* Inline Error Message */}
            {bookingError && (
              <div className="alert alert-danger rounded-4 fw-semibold mb-3">
                {bookingError}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              className="btn btn-primary btn-lg px-5 py-3 fw-bold w-100 rounded-pill shadow"
              onClick={book}
              disabled={bookingLoading}
            >
              {bookingLoading ? "Processing Booking..." : `Proceed to Payment (Total: ₹${totalAmount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
