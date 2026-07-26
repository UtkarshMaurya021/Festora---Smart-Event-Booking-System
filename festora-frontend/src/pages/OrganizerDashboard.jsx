import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getOrganizerDashboard } from "../services/dashboardService";
import { Link } from "react-router-dom";
import { getMyEvents, deleteEvent } from "../services/eventService";

function OrganizerDashboard() {
  // Step 107: State configuration
  const [dashboard, setDashboard] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalBookings: 0,
    revenue: 0
  });

  const [events, setEvents] = useState([]);

  const loadDashboard = async () => {
    try {
      const res = await getOrganizerDashboard();
      setDashboard(res.data);
    } catch (error) {
      console.log("Error loading dashboard data:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await getMyEvents();
      setEvents(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Step 107: Using an explicit async wrapper block to stop cascading render alerts
  useEffect(() => {
    const initializeDashboardData = async () => {
      await loadDashboard();
      await loadEvents();
    };
    
    initializeDashboardData();
  }, []);

  const removeEvent = async (id) => {
    if (window.confirm("Delete this event?")) {
      await deleteEvent(id);
      loadEvents();
    }
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main">
        <DashboardNavbar />

        {/* Step 108: Dynamic Metric Cards with <h3> tags */}
        <div className="row">
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Total Events</h6>
              <h3> {dashboard.totalEvents} </h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Active Events</h6>
              <h3> {dashboard.activeEvents} </h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Total Bookings</h6>
              <h3> {dashboard.totalBookings} </h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Revenue</h6>
              <h3> ₹ {dashboard.revenue} </h3>
            </div>
          </div>
        </div>

        {/* Table layout remains completely untouched */}
        <div className="card mt-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>My Events</h4>
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
                    No Events Created
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
                      <span className="badge bg-success">{event.status}</span>
                    </td>
                    <td>
                      <Link
                        to={`/organizer/events/edit/${event.eventId}`}
                        className="btn btn-warning btn-sm me-2"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeEvent(event.eventId)}
                      >
                        Delete
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
