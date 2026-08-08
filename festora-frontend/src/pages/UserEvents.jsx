import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import EventImageSlider from "../components/EventImageSlider";
import { getAllEvents } from "../services/eventService";

function UserEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await getAllEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;

    return events.filter((event) => {
      const title = (event.title || "").toLowerCase();
      const venue = (event.venue?.venueName || "").toLowerCase();
      const category = (event.category?.categoryName || "").toLowerCase();
      return (
        title.includes(term) ||
        venue.includes(term) ||
        category.includes(term)
      );
    });
  }, [events, search]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />

      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div className="container-fluid px-4 py-4">

          <div
            className="rounded-4 p-5 text-white shadow-lg mb-4"
            style={{
              background:
                "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#3b82f6 100%)",
            }}
          >
            <h2 className="fw-bold mb-2">Explore Events 🎉</h2>

            <p className="mb-0 opacity-75">
              Browse everything happening right now and grab your seat.
            </p>
          </div>

          <div className="card border-0 shadow rounded-4">
            <div className="card-header bg-white border-0 py-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <h4 className="fw-bold mb-0">All Events</h4>

              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 280 }}
                placeholder="Search by title, venue, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="card-body">
              {filteredEvents.length > 0 ? (
                <div className="row g-4">
                  {filteredEvents.map((event, index) => {
                    const eventId =
                      event.eventId || event.event_id || index;

                    return (
                      <div className="col-md-6 col-lg-4" key={eventId}>
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                          <EventImageSlider images={event.images} />

                          <div className="card-body d-flex flex-column">
                            <h5 className="fw-bold mb-1">{event.title}</h5>

                            <p className="text-muted mb-2 small">
                              {event.venue?.venueName || "N/A"} &middot;{" "}
                              {event.category?.categoryName || "N/A"}
                            </p>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="fw-semibold">
                                ₹ {event.price}
                              </span>

                              <span className="text-muted small">
                                {event.availableSeats ||
                                  event.available_seats}{" "}
                                seats left
                              </span>
                            </div>

                            <Link
                              to={`/event/${eventId}`}
                              className="btn btn-primary rounded-pill px-4 mt-auto align-self-start"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5">
                  <h5>No Events Found</h5>

                  <p className="text-muted">
                    Try a different search term, or check back later.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserEvents;
