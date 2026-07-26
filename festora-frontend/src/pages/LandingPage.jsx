import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllEvents } from "../services/eventService";

function LandingPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      const res = await getAllEvents();

      setEvents(res.data);
    };
    loadEvents();
  }, []);

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1>Find Amazing Events</h1>

              <p>
                Music Festivals, Workshops, Hackathons, Sports, College Fests
                and much more.
              </p>

              <button className="btn btn-primary btn-lg">Explore Events</button>
            </div>

            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
                className="img-fluid rounded"
                alt="Event"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          {events && events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))
          ) : (
            <>
              <div className="col-md-4">
                <div className="card p-4">
                  <h4>100+ Events</h4>

                  <p>Discover trending events.</p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card p-4">
                  <h4>Secure Booking</h4>

                  <p>Book tickets securely.</p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card p-4">
                  <h4>Verified Organizers</h4>

                  <p>Only trusted organizers.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

function EventCard({ event }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h4>{event.title}</h4>

        <p>{event.description}</p>

        <p>📍 {event.venue.venueName}</p>

        <p>🏷️ {event.category.categoryName}</p>

        <p>💰 ₹ {event.price}</p>

        <p>
          🎟️ {event.availableSeats}
          Seats Left
        </p>

        <button className="btn btn-primary w-100">View Details</button>
      </div>
    </div>
  );
}

export default LandingPage;
