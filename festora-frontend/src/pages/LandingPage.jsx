import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllEvents } from "../services/eventService";

function LandingPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await getAllEvents();
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };
    loadEvents();
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold">Find Amazing Events</h1>
              <p className="lead text-muted">
                Music Festivals, Workshops, Hackathons, Sports, College Fests
                and much more.
              </p>
              <button className="btn btn-primary btn-lg px-4 me-md-2">Explore Events</button>
            </div>
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
                className="img-fluid rounded shadow"
                alt="Event"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Featured Events</h2>
          <span className="badge bg-secondary px-3 py-2">Showing Top Picks</span>
        </div>

        <div className="row g-4">
          {events && events.length > 0 ? (
            // Slice limits array items to 6 (max 2 rows of 3 columns)
            events.slice(0, 6).map((event) => (
              <div className="col-md-4" key={event.eventId}>
                <EventCard event={event} />
              </div>
            ))
          ) : (
            <>
              <div className="col-md-4">
                <div className="card p-4 text-center h-100 shadow-sm border-0 bg-light">
                  <h4 className="fw-semibold">100+ Events</h4>
                  <p className="text-muted mb-0">Discover trending events.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-4 text-center h-100 shadow-sm border-0 bg-light">
                  <h4 className="fw-semibold">Secure Booking</h4>
                  <p className="text-muted mb-0">Book tickets securely.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-4 text-center h-100 shadow-sm border-0 bg-light">
                  <h4 className="fw-semibold">Verified Organizers</h4>
                  <p className="text-muted mb-0">Only trusted organizers.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Professional Promotion CTA Section */}
        {events && events.length > 6 && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card text-center p-5 border-0 shadow-sm bg-dark text-white rounded-4 position-relative overflow-hidden">
                <div className="position-relative z-index-1">
                  <h3 className="fw-bold mb-2">Want to discover more personalized events?</h3>
                  <p className="text-white-50 mb-4 max-width-md mx-auto">
                    Join thousands of event-goers. Sign in to unlock exclusive ticket discounts, 
                    personalized recommendations, and custom local alerts.
                  </p>
                  <div className="d-sm-flex justify-content-center gap-3">
                    <Link to="/login" className="btn btn-light btn-lg px-4 fw-semibold mb-2 mb-sm-0">
                      Sign In / Register
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}

function EventCard({ event }) {
  return (
    <div className="card shadow-sm h-100 border-0 rounded-3 overflow-hidden">
      <div className="card-body d-flex flex-column justify-content-between p-4">
        <div>
          <span className="badge bg-primary-subtle text-primary mb-2 px-2 py-1 rounded small">
            🏷️ {event.category?.categoryName || "General"}
          </span>
          <h4 className="card-title h5 fw-bold mb-2">{event.title}</h4>
          <p className="card-text text-muted small mb-4">{event.description}</p>
          
          <div className="mb-3 small text-secondary">
            <p className="mb-1 text-truncate">📍 <strong>Venue:</strong> {event.venue?.venueName || "TBD"}</p>
            <p className="mb-1">💰 <strong>Price:</strong> ₹ {event.price}</p>
          </div>
        </div>
        
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-danger fw-semibold small">
              🎟️ {event.availableSeats} Seats Left
            </span>
          </div>
          <Link to="/login" className="btn btn-outline-primary w-100 fw-semibold">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
