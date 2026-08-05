import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getEventsSummary } from "../../services/eventService";
import { FiCalendar, FiPlusCircle, FiEdit, FiSearch } from "react-icons/fi";

const STATUS_BADGE = {
  PENDING: "bg-warning text-dark",
  PENDING_APPROVAL: "bg-warning text-dark",
  ACTIVE: "bg-success text-white",
  FULL: "bg-info text-dark",
  STARTED: "bg-primary text-white",
  COMPLETED: "bg-secondary text-white",
  INACTIVE: "bg-danger text-white",
};

function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getEventsSummary();
        setEvents(res.data);
        setError("");
      } catch (err) {
        console.error("Error loading events summary:", err);
        setError("Could not load your events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  let filteredEvents = statusFilter === "ALL"
    ? events
    : events.filter((e) => e.status === statusFilter);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (e) =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q))
    );
  }

  const totals = filteredEvents.reduce(
    (acc, e) => {
      acc.tickets += e.totalBookings || 0;
      acc.seatsSold += e.bookedSeats || 0;
      acc.revenue += Number(e.revenue) || 0;
      return acc;
    },
    { tickets: 0, seatsSold: 0, revenue: 0 }
  );

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Hero Header Banner */}
        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-primary text-white px-3 py-2 fw-bold mb-2">
                📊 Portfolio Overview
              </span>
              <h2 className="fw-bold mb-1">My Events Portfolio</h2>
              <p className="mb-0 text-white-50 small">
                Complete financial break-down, seating capacity tracking, and status breakdown across all your hosted events.
              </p>
            </div>
            <Link
              to="/organizer/events/create"
              className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 px-4"
            >
              <FiPlusCircle /> Create Event
            </Link>
          </div>
        </div>

        {/* Financial Breakdown Cards */}
        <div className="row g-3 px-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="text-muted small fw-bold">TOTAL SEATS SOLD</h6>
              <h2 className="fw-bold mb-0 text-primary">{totals.seatsSold}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="text-muted small fw-bold">TOTAL BOOKINGS</h6>
              <h2 className="fw-bold mb-0 text-success">{totals.tickets}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="text-muted small fw-bold">TOTAL REVENUE EARNED</h6>
              <h2 className="fw-bold mb-0 text-warning">₹{totals.revenue.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FiCalendar className="text-primary" /> All Hosted Events ({filteredEvents.length})
            </h4>

            {/* Filter controls */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="input-group" style={{ maxWidth: 260 }}>
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search title, venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select bg-light"
                style={{ width: "auto" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="FULL">Full</option>
                <option value="STARTED">Started</option>
                <option value="COMPLETED">Completed</option>
                <option value="INACTIVE">Inactive / Deleted</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-danger rounded-4">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading events portfolio...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Total Seats</th>
                    <th>Seats Sold</th>
                    <th>Available Seats</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4 text-muted">
                        No events match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr key={event.eventId}>
                        <td className="fw-bold text-dark">{event.title}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{event.category}</span>
                        </td>
                        <td className="small text-muted">{event.venue}</td>
                        <td>
                          <span
                            className={`badge px-3 py-2 fw-semibold ${
                              STATUS_BADGE[event.status] || "bg-secondary"
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="fw-semibold">{event.totalSeats}</td>
                        <td className="text-success fw-semibold">{event.bookedSeats}</td>
                        <td className="text-primary fw-semibold">{event.availableSeats}</td>
                        <td className="fw-bold">{event.totalBookings}</td>
                        <td className="fw-bold text-success">₹{Number(event.revenue).toFixed(2)}</td>
                        <td className="text-end">
                          <Link
                            to={`/organizer/events/edit/${event.eventId}`}
                            className="btn btn-outline-warning btn-sm rounded-pill px-3 text-dark"
                          >
                            <FiEdit className="me-1" /> Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AllEvents;
