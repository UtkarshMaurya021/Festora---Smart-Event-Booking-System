import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getUserDashboard } from "../services/dashboardService";

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
        console.log("Database Response Data:", response.data);
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
      <div className="dashboard-main">
        <DashboardNavbar />

        {/* Counter Cards */}
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="dashboard-card text-center p-3 border rounded shadow-sm">
              <h6 className="text-muted">Upcoming Events</h6>
              <h2>{dashboard.upcoming}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-card text-center p-3 border rounded shadow-sm">
              <h6 className="text-muted">Bookings</h6>
              <h2>{dashboard.bookings}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-card text-center p-3 border rounded shadow-sm">
              <h6 className="text-muted">Tickets</h6>
              <h2>{dashboard.tickets}</h2>
            </div>
          </div>
        </div>

        {/* Structured Events Table Section */}
        <h4 className="mt-5 mb-4">Available Events</h4>
        <div className="container-fluid px-0">
          {activeEvents.length > 0 ? (
            <table className="table table-bordered shadow-sm bg-white">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Venue</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeEvents.map((event, index) => {
                  const eventId = event.event_id || event.eventId || index;
                  return (
                    <tr key={eventId}>
                      <td>{event.title}</td>
                      <td>{event.venue?.venueName || "N/A"}</td>
                      <td>{event.category?.categoryName || "N/A"}</td>
                      <td>₹ {event.price}</td>
                      <td>{event.available_seats || event.availableSeats}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => window.location.href = "/event/" + eventId}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5 border rounded bg-light">
              <p className="text-muted mb-0">No upcoming events available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
