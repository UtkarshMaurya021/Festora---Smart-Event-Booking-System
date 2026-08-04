import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventImageSlider from "../components/EventImageSlider";
import { getAllEvents } from "../services/eventService";
import "./styles/publicEvents.css";

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const res = await getAllEvents();
        if (isMounted) {
          setEvents(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const list = [
      ...new Set(
        events
          .map((e) => e.category?.categoryName)
          .filter(Boolean)
      ),
    ];
    return ["All", ...list];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        search.trim() === "" ||
        event.title?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || event.category?.categoryName === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category, events]);

  return (
    <>
      <Navbar />
      <section className="public-events-header">
        <div className="container">
          <h1>Explore Events</h1>
          <p> Browse all upcoming events and book your tickets. </p>
          <div className="row mt-4">
            <div className="col-md-8 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>
      <section className="container py-5">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="alert alert-info"> No events found. </div>
        ) : (
          <div className="row g-4">
            {filteredEvents.map((event) => (
              <div className="col-lg-4 col-md-6" key={event.eventId}>
                <div className="event-card shadow-sm">
                  <EventImageSlider images={event.images || []} height={220} />
                  <div className="p-3">
                    <h4>{event.title}</h4>
                    <p className="text-muted small mb-2">
                      {event.description?.length > 100
                        ? event.description.substring(0, 100) + "..."
                        : event.description}
                    </p>
                    <div className="event-info">
                      <p>
                        <strong>Date:</strong>{" "}
                        {formatDate(event.eventStartDatetime)}
                      </p>
                      <p>
                        <strong>Venue:</strong> {event.venue?.venueName}
                      </p>
                      <p>
                        <strong>Category:</strong> {event.category?.categoryName}
                      </p>
                      <p>
                        <strong>Price:</strong> ₹ {event.price}
                      </p>
                      <p>
                        <strong>Seats:</strong> {event.availableSeats}
                      </p>
                    </div>
                    <Link
                      to={`/event/${event.eventId}`}
                      className="btn btn-primary w-100 mt-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}

export default PublicEvents;
