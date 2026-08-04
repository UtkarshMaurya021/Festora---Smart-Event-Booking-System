import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getOrganizerDashboard } from "../services/dashboardService";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMyActiveEvents, deleteEvent } from "../services/eventService";

const STATUS_BADGE_CLASS = {
  ACTIVE: "bg-success",
  FULL: "bg-warning text-dark",
  STARTED: "bg-primary",
  COMPLETED: "bg-secondary",
  INACTIVE: "bg-danger",
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
    // The backend automatically flips an event's status (e.g. ACTIVE ->
    // STARTED) once its organizer-set start time arrives. Re-fetch
    // periodically so that change shows up here without a manual reload.
    const timer = setInterval(() => {
      loadDashboard();
      loadEvents();
    }, 30000);

    return () => clearInterval(timer);
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
      <div className="dashboard-main">
        <DashboardNavbar />

        {success && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="row">
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Total Events</h6>
              <h3>{dashboard.totalEvents ?? 0}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Active Events</h6>
              <h3>{dashboard.activeEvents ?? 0}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Total Bookings</h6>
              <h3>{dashboard.totalBookings ?? 0}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Revenue</h6>
              <h3>₹ {dashboard.revenue ?? 0}</h3>
            </div>
          </div>
        </div>

        <div className="card mt-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>My Active Events</h4>
            <Link to="/organizer/events/create" className="btn btn-primary">
              + Create Event
            </Link>
          </div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Venue</th>
                <th>Price</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Active Events 
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.eventId}>
                    <td>{event.title}</td>
                    <td>{event.category?.categoryName}</td>
                    <td>{event.venue?.venueName}</td>
                    <td>₹ {event.price}</td>
                    <td>
                      {event.availableSeats}/ {event.totalSeats}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          STATUS_BADGE_CLASS[event.status] || "bg-success"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/event/${event.eventId}`}
                        className="btn btn-outline-secondary btn-sm me-2"
                      >
                        View
                      </Link>
                      <Link
                        to={`/organizer/events/edit/${event.eventId}`}
                        className="btn btn-warning btn-sm me-2"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={
                          event.status === "INACTIVE" ||
                          deletingId === event.eventId
                        }
                        onClick={() => removeEvent(event)}
                      >
                        {deletingId === event.eventId
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default OrganizerDashboard;