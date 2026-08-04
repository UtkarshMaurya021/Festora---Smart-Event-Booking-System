import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getEventsSummary } from "../../services/eventService";

const STATUS_BADGE = {
  PENDING: "bg-warning text-dark",
  PENDING_APPROVAL: "bg-warning text-dark",
  ACTIVE: "bg-success",
  FULL: "bg-info text-dark",
  STARTED: "bg-primary",
  COMPLETED: "bg-secondary",
  INACTIVE: "bg-danger",
};

function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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

  const filteredEvents =
    statusFilter === "ALL"
      ? events
      : events.filter((e) => e.status === statusFilter);

  const totals = filteredEvents.reduce(
    (acc, e) => {
      acc.tickets += e.totalBookings || 0;
      acc.seatsSold += e.bookedSeats || 0;
      acc.revenue += Number(e.revenue) || 0;
      return acc;
    },
    { tickets: 0, seatsSold: 0, revenue: 0 },
  );

  return (
    <>
      <Sidebar />
      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="card mt-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h4 className="mb-0">All My Events</h4>

            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
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
              <Link
                to="/organizer/events/create"
                className="btn btn-primary btn-sm"
              >
                + Create Event
              </Link>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <div className="dashboard-card">
                <h6>Total Tickets Sold (filtered)</h6>
                <h3>{totals.seatsSold}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dashboard-card">
                <h6>Total Bookings (filtered)</h6>
                <h3>{totals.tickets}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dashboard-card">
                <h6>Total Revenue (filtered)</h6>
                <h3>₹ {totals.revenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-4">Loading events...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Total Seats</th>
                    <th>Seats Sold</th>
                    <th>Seats Available</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No events found.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr key={event.eventId}>
                        <td>{event.title}</td>
                        <td>{event.category}</td>
                        <td>{event.venue}</td>
                        <td>
                          <span
                            className={`badge ${
                              STATUS_BADGE[event.status] || "bg-secondary"
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td>{event.totalSeats}</td>
                        <td>{event.bookedSeats}</td>
                        <td>{event.availableSeats}</td>
                        <td>{event.totalBookings}</td>
                        <td>₹ {Number(event.revenue).toFixed(2)}</td>
                        <td>
                          <Link
                            to={`/organizer/events/edit/${event.eventId}`}
                            className="btn btn-warning btn-sm"
                          >
                            Edit
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
