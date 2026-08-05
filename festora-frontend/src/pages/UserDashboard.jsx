import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import EventImageSlider from "../components/EventImageSlider";
import { getUserDashboard } from "../services/dashboardService";
import { FiCalendar, FiBook, FiCreditCard, FiArrowRight, FiZap } from "react-icons/fi";
import "../pages/styles/Userdashboard.css";

function UserDashboard() {
  const [dashboard, setDashboard] = useState({
    upcoming: 0,
    bookings: 0,
    tickets: 0,
    "active-events": [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getUserDashboard();
        if (response.data) {
          setDashboard(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const activeEvents = dashboard["active-events"] || [];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />

      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div className="container-fluid px-3 py-2">
          {/* Bulletproof Dark Hero Banner with Explicit Fallback */}
          <div
            className="dashboard-hero-banner mb-4"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
              color: "#ffffff",
              borderRadius: "20px",
              padding: "32px 36px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <span className="badge hero-badge-light mb-2">
                  <FiZap className="text-primary me-1" /> Attendee Portal
                </span>
                <h2 className="fw-bold mb-1 text-white" style={{ color: "#ffffff", fontSize: "2.2rem" }}>
                  Welcome Back 👋
                </h2>
                <p className="mb-0 small" style={{ color: "#e2e8f0", fontSize: "1rem" }}>
                  Explore approved live events, manage your seat reservations, and view digital gate passes.
                </p>
              </div>
              <Link to="/user/events" className="btn btn-light rounded-pill px-4 fw-bold shadow-sm">
                Explore Events <FiArrowRight className="ms-1" />
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="dashboard-card-surface card border-0 p-4 h-100 text-center">
                <div className="stat-box-indigo rounded-circle d-inline-flex justify-content-center align-items-center mb-3 mx-auto" style={{ width: 64, height: 64 }}>
                  <FiCalendar size={28} />
                </div>
                <h6 className="text-muted fw-bold mb-1">UPCOMING EVENTS</h6>
                <h1 className="fw-bold text-dark mb-0">{dashboard.upcoming}</h1>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="dashboard-card-surface card border-0 p-4 h-100 text-center">
                <div className="stat-box-emerald rounded-circle d-inline-flex justify-content-center align-items-center mb-3 mx-auto" style={{ width: 64, height: 64 }}>
                  <FiBook size={28} />
                </div>
                <h6 className="text-muted fw-bold mb-1">ACTIVE BOOKINGS</h6>
                <h1 className="fw-bold text-dark mb-0">{dashboard.bookings}</h1>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="dashboard-card-surface card border-0 p-4 h-100 text-center">
                <div className="stat-box-amber rounded-circle d-inline-flex justify-content-center align-items-center mb-3 mx-auto" style={{ width: 64, height: 64 }}>
                  <FiCreditCard size={28} />
                </div>
                <h6 className="text-muted fw-bold mb-1">GATE PASS TICKETS</h6>
                <h1 className="fw-bold text-dark mb-0">{dashboard.tickets}</h1>
              </div>
            </div>
          </div>

          {/* Events Catalog */}
          <div className="dashboard-card-surface card border-0 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="fw-bold mb-0 text-dark">Approved Live Events</h4>
              <Link to="/user/events" className="text-primary fw-bold text-decoration-none">
                View All Catalog &rarr;
              </Link>
            </div>

            {activeEvents.length > 0 ? (
              <div className="row g-4">
                {activeEvents.map((event, index) => {
                  const eventId = event.eventId || event.event_id || index;

                  return (
                    <div className="col-md-6 col-lg-4" key={eventId}>
                      <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white d-flex flex-column justify-content-between">
                        <div>
                          <EventImageSlider images={event.images} height={200} />

                          <div className="p-4">
                            <h5 className="fw-bold mb-1 text-dark">{event.title}</h5>

                            <p className="text-muted mb-2 small">
                              {event.venue?.venueName || "N/A"} &middot; {event.category?.categoryName || "N/A"}
                            </p>

                            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                              <span className="fw-bold text-success fs-5">
                                ₹{event.price}
                              </span>

                              <span className="text-muted small">
                                {event.availableSeats || event.available_seats} seats left
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <Link
                            to={`/event/${eventId}`}
                            className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm py-2"
                          >
                            View Details & Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5">
                <h5 className="fw-bold text-dark">No Events Available</h5>
                <p className="text-muted small">Check back later for newly approved shows and festivals.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
