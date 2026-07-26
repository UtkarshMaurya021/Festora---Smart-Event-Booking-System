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
        <div className="row">
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

        {/* Dynamic Event Grid Section */}
        <h4 className="mt-5 mb-4">Available Events</h4>
        
        <div className="row">
          {activeEvents.length > 0 ? (
            /* FIXED: Use index parameter to avoid Math.random impure error */
            activeEvents.map((event, index) => (
              <div className="col-md-4 mb-4" key={event.event_id || event.eventId || index}>
                <div className="card shadow h-100">
                  <div className="card-body">
                    <h4 className="card-title">{event.title}</h4>
                    <p className="card-text text-muted">{event.description}</p>
                    <p className="mb-1">
                      <b>Category ID:</b> {event.category_category_id || event.category_id || "N/A"}
                    </p>
                    <p className="mb-1">
                      <b>Venue ID:</b> {event.venue_venue_id || event.venue_id || "N/A"}
                    </p>
                    <p className="mb-1">
                      <b>Price:</b> ₹ {event.price}
                    </p>
                    <p className="mb-3">
                      <b>Seats:</b> {event.available_seats || event.availableSeats}
                    </p>
                    <button className="btn btn-primary w-100">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 border rounded bg-light">
              <p className="text-muted mb-0">No upcoming events available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
