import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getOrganizerDashboard } from "../services/dashboardService";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMyActiveEvents, deleteEvent } from "../services/eventService";
import { FiCalendar, FiPlusCircle, FiEye, FiEdit, FiTrash2, FiDollarSign, FiBookOpen, FiGrid, FiZap } from "react-icons/fi";

const STATUS_BADGE_CLASS = {
  ACTIVE: "bg-success text-white",
  FULL: "bg-warning text-dark",
  STARTED: "bg-primary text-white",
  COMPLETED: "bg-secondary text-white",
  INACTIVE: "bg-danger text-white",
};

function OrganizerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [success, setSuccess] = useState(() => {
    return location.state?.message || "";
  });
  const [error, setError] = useState("");

  const [dashboard, setDashboard] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalBookings: 0,
    revenue: 0,
  });

  const [events, setEvents] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });

      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate]);

  const loadDashboard = async () => {
    try {
      const res = await getOrganizerDashboard();
      setDashboard({
        totalEvents: res.data.totalEvents,
        activeEvents: res.data.activeEvents,
        totalBookings: res.data.totalTicketsBooked,
        revenue: res.data.totalRevenue,
      });
    } catch (error) {
      console.log("Error loading dashboard data:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await getMyActiveEvents();
      setEvents(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const initializeDashboardData = async () => {
      await loadDashboard();
      await loadEvents();
    };

    initializeDashboardData();

    const timer = setInterval(() => {
      loadDashboard();
      loadEvents();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const removeEvent = async (event) => {
    const confirmed = window.confirm(`Delete "${event.title}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(event.eventId);
      setError("");
      await deleteEvent(event.eventId);
      await Promise.all([loadEvents(), loadDashboard()]);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Could not delete this event. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

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
                  <FiZap className="text-primary me-1" /> Organizer Command Center
                </span>
                <h2 className="fw-bold mb-1 text-white" style={{ color: "#ffffff", fontSize: "2.2rem" }}>
                  Event Hosting Operations
                </h2>
                <p className="mb-0 small" style={{ color: "#e2e8f0", fontSize: "1rem" }}>
                  Monitor ticket sales, revenue earnings, live capacity, and published event listings in real-time.
                </p>
              </div>
              <Link
                to="/organizer/events/create"
                className="btn btn-light rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 px-4 py-2 text-dark"
              >
                <FiPlusCircle className="text-primary" /> Create New Event
              </Link>
            </div>
          </div>

          {/* Alert Notifications */}
          <div>
            {success && (
              <div className="alert alert-success border-0 shadow-sm rounded-4 p-3 mb-4" role="alert">
                🎉 {success}
              </div>
            )}

            {error && (
              <div className="alert alert-danger border-0 shadow-sm rounded-4 p-3 mb-4" role="alert">
                {error}
              </div>
            )}
          </div>

          {/* Summary Metric Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="dashboard-card-surface card border-0 p-4 h-100 text-center">
                <div className="stat-box-indigo rounded-circle d-inline-flex justify-content-center align-items-center mb-3 mx-auto" style={{ width: 56, height: 56 }}>
                  <FiGrid size={24} />
                </div>
                <h6 className="text-muted fw-bold mb-1">TOTAL EVENTS</h6>
                <h1 className="fw-bold text-dark mb-0">{dashboard.totalEvents ?? 0}</h1>
              </div>
            </div>

            <div className="col-md-3">
              <div className="dashboard-card-surface card border-0 p-4 h-100 text-center">
                <div className="stat-box-emerald rounded-circle d-inline-flex justify-content-center align-items-center mb-3 mx-auto" style={{ width: 56, height: 56 }}>
                  <FiCalendar size={24} />
                </div>
                <h6 className="text-muted fw-bold mb-1">ACTIVE EVENTS</h6>
                <h1 className="fw-bold text-dark mb-0">{dashboard.activeEvents ?? 0}</h1>
              </div>
            </div>

            <div className="col-md-3">
              <div className="dashboard-card-surface card border-0 p-4 h-100 text-center">
                <div className="stat-box-amber rounded-circle d-inline-flex justify-content-center align-items-center mb-3 mx-auto" style={{ width: 56, height: 56 }}>
                  <FiBookOpen size={24} />
                </div>
                <h6 className="text-muted fw-bold mb-1">TOTAL BOOKINGS</h6>
                <h1 className="fw-bold text-dark mb-0">{dashboard.totalBookings ?? 0}</h1>
              </div>
            </div>

            <div className="col-md-3">
              <div className="dashboard-card-surface card border-0 p-4 h-100 text-center">
                <div className="stat-box-rose rounded-circle d-inline-flex justify-content-center align-items-center mb-3 mx-auto" style={{ width: 56, height: 56 }}>
                  <FiDollarSign size={24} />
                </div>
                <h6 className="text-muted fw-bold mb-1">TOTAL REVENUE</h6>
                <h1 className="fw-bold text-dark mb-0">₹{dashboard.revenue ?? 0}</h1>
              </div>
            </div>
          </div>

          {/* Active Events Table Card */}
          <div className="dashboard-card-surface card border-0 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <FiCalendar className="text-primary" /> Active Hosting Events ({events.length})
              </h4>
              <Link to="/organizer/events" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                View All Events
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Venue</th>
                    <th>Price</th>
                    <th>Available / Total Seats</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No active events currently published. Click <strong>"+ Create Event"</strong> above to publish a new event.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.eventId}>
                        <td>
                          <div className="fw-bold text-dark">{event.title}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {event.category?.categoryName || event.category?.name || "General"}
                          </span>
                        </td>
                        <td className="small text-muted">{event.venue?.venueName || event.venue?.name || "TBD"}</td>
                        <td className="fw-bold text-success">₹{event.price}</td>
                        <td className="fw-bold">
                          {event.availableSeats} / {event.totalSeats}
                        </td>
                        <td>
                          <span
                            className={`badge px-3 py-2 fw-semibold ${
                              STATUS_BADGE_CLASS[event.status] || "bg-success"
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <Link
                              to={`/event/${event.eventId}`}
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            >
                              <FiEye className="me-1" /> View
                            </Link>
                            <Link
                              to={`/organizer/events/edit/${event.eventId}`}
                              className="btn btn-outline-warning btn-sm rounded-pill px-3 text-dark"
                            >
                              <FiEdit className="me-1" /> Edit
                            </Link>
                            <button
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              disabled={
                                event.status === "INACTIVE" ||
                                deletingId === event.eventId
                              }
                              onClick={() => removeEvent(event)}
                            >
                              <FiTrash2 className="me-1" />
                              {deletingId === event.eventId ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganizerDashboard;