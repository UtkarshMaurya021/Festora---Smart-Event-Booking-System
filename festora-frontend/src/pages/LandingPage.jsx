import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventImageSlider from "../components/EventImageSlider";
import { getAllEvents } from "../services/eventService";
import {
  FiZap,
  FiLock,
  FiCheckCircle,
  FiBell,
  FiDollarSign,
  FiHeadphones,
  FiSearch,
  FiShoppingCart,
  FiLogIn,
  FiCalendar,
  FiStar,
  FiMapPin,
  FiTag,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";
import "../pages/styles/landing.css";

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LandingPage() {
  const navigate = useNavigate();
  const [activeEvents, setActiveEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    getAllEvents()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setActiveEvents(list);
      })
      .catch((err) => {
        console.error("Failed to load active events for landing page:", err);
      })
      .finally(() => setLoadingEvents(false));
  }, []);

  const handleBookClick = (eventId) => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(`/event/${eventId}`);
    } else {
      navigate("/login", {
        state: {
          message: "Please log in or create an account to book tickets for this event.",
        },
      });
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero py-5">
        <div className="landing-hero-texture" />

        <div className="container position-relative py-4">
          <div className="row align-items-center">
            <div className="col-lg-9 text-start">
              <span className="landing-eyebrow mb-3">
                <FiZap className="landing-eyebrow-icon" /> Live events, real seats
              </span>

              <h1 className="landing-headline">
                Find events worth clearing your calendar for.
              </h1>

              <p className="landing-subtext">
                Music festivals, workshops, hackathons, sports and college fests — discovered in minutes, booked in seconds with instant gate QR tickets.
              </p>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                <Link
                  to="/events"
                  className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-bold shadow-lg d-inline-flex align-items-center gap-2"
                >
                  Explore Events <FiArrowRight />
                </Link>

                <Link
                  to="/signup"
                  className="btn btn-outline-light btn-lg rounded-pill px-4 py-3 fw-bold border-2"
                >
                  Get Started Free
                </Link>
              </div>

              <p className="landing-hero-caption text-white-50 small mb-0 d-flex align-items-center gap-2">
                <MdConfirmationNumber className="landing-hero-caption-icon text-warning" />
                Festora — Smart Event Booking Platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Colored Trust Strip */}
      <section className="landing-stats-strip py-4 bg-white border-bottom">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-6 col-md-3">
              <div className="stat-card p-3 rounded-4 transition-all">
                <span
                  className="stat-icon-box rounded-3 p-3 text-white mb-2 d-inline-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    width: 56,
                    height: 56,
                    boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  <FiCalendar size={24} />
                </span>
                <h5 className="fw-bold mb-0 text-dark">Live Events</h5>
                <span className="text-muted small">Approved & Active</span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="stat-card p-3 rounded-4 transition-all">
                <span
                  className="stat-icon-box rounded-3 p-3 text-white mb-2 d-inline-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    width: 56,
                    height: 56,
                    boxShadow: "0 8px 16px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <FiZap size={24} />
                </span>
                <h5 className="fw-bold mb-0 text-dark">Instant Tickets</h5>
                <span className="text-muted small">QR Gate Validation</span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="stat-card p-3 rounded-4 transition-all">
                <span
                  className="stat-icon-box rounded-3 p-3 text-white mb-2 d-inline-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    width: 56,
                    height: 56,
                    boxShadow: "0 8px 16px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <FiCheckCircle size={24} />
                </span>
                <h5 className="fw-bold mb-0 text-dark">Verified Hosts</h5>
                <span className="text-muted small">Vetted Organizers</span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="stat-card p-3 rounded-4 transition-all">
                <span
                  className="stat-icon-box rounded-3 p-3 text-white mb-2 d-inline-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                    width: 56,
                    height: 56,
                    boxShadow: "0 8px 16px rgba(236, 72, 153, 0.3)",
                  }}
                >
                  <FiStar size={24} />
                </span>
                <h5 className="fw-bold mb-0 text-dark">Top Rated</h5>
                <span className="text-muted small">4.9 ★ Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Active Events Section */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <span className="badge bg-primary text-white px-3 py-2 fw-bold mb-2">
                🎪 Approved & Open for Booking
              </span>
              <h2 className="fw-bold mb-1">Featured Live Events</h2>
              <p className="text-muted small mb-0">
                Browse dynamic active events approved on Festora. Log in or sign up to reserve your tickets.
              </p>
            </div>
            <Link to="/events" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
              View All Events <FiArrowRight className="ms-1" />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading approved events...</span>
              </div>
            </div>
          ) : activeEvents.length === 0 ? (
            <div className="alert alert-info rounded-4 text-center p-4">
              ✨ No active events published at the moment. Check back soon for exciting upcoming shows!
            </div>
          ) : (
            <div className="row g-4">
              {activeEvents.map((event) => (
                <div className="col-lg-4 col-md-6" key={event.eventId}>
                  <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white d-flex flex-column justify-content-between">
                    <div>
                      <EventImageSlider images={event.images || []} height={200} />

                      <div className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-bold mb-0 text-dark">{event.title}</h5>
                          <span className="badge bg-success text-white px-2 py-1 small">
                            ACTIVE
                          </span>
                        </div>

                        <p className="text-muted small mb-3">
                          {event.description?.length > 90
                            ? event.description.substring(0, 90) + "..."
                            : event.description || "No description provided."}
                        </p>

                        <div className="p-3 bg-light rounded-3 small mb-3">
                          <div className="d-flex align-items-center gap-2 mb-1 text-muted">
                            <FiCalendar className="text-primary" />
                            <span>{formatDate(event.eventStartDatetime)}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2 mb-1 text-muted">
                            <FiMapPin className="text-danger" />
                            <span>{event.venue?.venueName || "TBD"}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <FiTag className="text-warning" />
                            <span>{event.category?.categoryName || "General"}</span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          <div>
                            <span className="text-muted small d-block">Price per ticket</span>
                            <span className="fw-bold text-success fs-5">₹{event.price}</span>
                          </div>
                          <div className="text-end">
                            <span className="text-muted small d-block">Available Seats</span>
                            <span className="fw-bold text-primary">{event.availableSeats} / {event.totalSeats}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleBookClick(event.eventId)}
                        className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm py-2"
                      >
                        Book Ticket
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Festora */}
      <section className="landing-why-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="landing-eyebrow landing-eyebrow-dark mb-2">
              Why Festora
            </span>

            <h2 className="landing-section-title mt-2 fw-bold">
              Built for people who don't want to miss out
            </h2>

            <p className="landing-why-subtext">
              From instant QR check-ins to verified organizers, every part of
              Festora is designed to get you from discovery to the front row,
              without the hassle.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  <FiZap />
                </div>
                <h4>Instant Booking</h4>
                <p>
                  Reserve your seat in just a few taps and get a ticket that
                  scans instantly at the gate.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                  <FiLock />
                </div>
                <h4>Secure Payments</h4>
                <p>
                  Every transaction is encrypted end-to-end, so your money and
                  details stay protected.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <FiCheckCircle />
                </div>
                <h4>Verified Organizers</h4>
                <p>
                  We vet every organizer on the platform, so you always know who
                  you're buying from.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                  <FiBell />
                </div>
                <h4>Smart Alerts</h4>
                <p>
                  Get notified the moment events matching your interests go live
                  near you.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: "linear-gradient(135deg, #ec4899, #be185d)" }}>
                  <FiDollarSign />
                </div>
                <h4>No Hidden Fees</h4>
                <p>
                  The price you see at checkout is the price you pay. No
                  last-minute surprises.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                  <FiHeadphones />
                </div>
                <h4>Always-On Support</h4>
                <p>
                  Questions about a booking or an event? Our support team is
                  always a message away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="landing-eyebrow landing-eyebrow-dark mb-2">
              How it works
            </span>

            <h2 className="landing-section-title mt-2 fw-bold">
              From browsing to the front row in three steps
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="landing-step-card text-center">
                <span className="landing-step-icon mx-auto" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  <FiSearch />
                </span>
                <h4>Discover</h4>
                <p>
                  Browse festivals, workshops, and meetups curated for you.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-step-card text-center">
                <span className="landing-step-icon mx-auto" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <FiShoppingCart />
                </span>
                <h4>Book</h4>
                <p>
                  Pick your seats and check out securely, right from your phone.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-step-card text-center">
                <span className="landing-step-icon mx-auto" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                  <FiLogIn />
                </span>
                <h4>Walk In</h4>
                <p>Show your QR ticket at the gate and you're straight in.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonial-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="landing-eyebrow landing-eyebrow-dark mb-2">
              Testimonials
            </span>

            <h2 className="landing-section-title mt-2 fw-bold">
              Loved by event-goers
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="landing-testimonial-card">
                <p className="landing-testimonial-quote">
                  "Booked my festival pass in no time and the QR check-in at the
                  gate was instant. No queues, no stress."
                </p>
                <p className="landing-testimonial-author">
                  — Ananya R., Music Festival Attendee
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-testimonial-card">
                <p className="landing-testimonial-quote">
                  "As an organizer, the verification process gave our event
                  instant credibility with attendees."
                </p>
                <p className="landing-testimonial-author">
                  — Rohan K., Hackathon Organizer
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-testimonial-card">
                <p className="landing-testimonial-quote">
                  "Found a college fest happening in my city that I would've
                  completely missed otherwise. Great alerts."
                </p>
                <p className="landing-testimonial-author">
                  — Priya S., Student
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default LandingPage;
