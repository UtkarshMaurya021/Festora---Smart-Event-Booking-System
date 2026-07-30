import { useEffect, useState } from "react";
// Imported Link component from react-router-dom
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getUserDashboard } from "../services/dashboardService";
import "../pages/styles/Userdashboard.css"
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

      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div className="container-fluid px-4 py-4">
          {/* Welcome Banner */}
          <div
            className="rounded-4 p-5 text-white shadow-lg mb-4"
            style={{
              background:
                "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#3b82f6 100%)",
            }}
          >
            <h2 className="fw-bold mb-2">Welcome Back 👋</h2>

            <p className="mb-0 opacity-75">
              View your bookings and explore upcoming events.
            </p>
          </div>

          {/* Stats */}
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 rounded-4 shadow-sm h-100">
                <div className="card-body text-center py-4">
                  <div
                    className="rounded-circle d-inline-flex justify-content-center align-items-center mb-3"
                    style={{
                      width: 65,
                      height: 65,
                      background: "#e0e7ff",
                      color: "#2563eb",
                      fontSize: "28px",
                    }}
                  >
                    📅
                  </div>

                  <h6 className="text-muted">Upcoming Events</h6>

                  <h2 className="fw-bold">{dashboard.upcoming}</h2>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 rounded-4 shadow-sm h-100">
                <div className="card-body text-center py-4">
                  <div
                    className="rounded-circle d-inline-flex justify-content-center align-items-center mb-3"
                    style={{
                      width: 65,
                      height: 65,
                      background: "#dcfce7",
                      color: "#16a34a",
                      fontSize: "28px",
                    }}
                  >
                    🎟
                  </div>

                  <h6 className="text-muted">Bookings</h6>

                  <h2 className="fw-bold">{dashboard.bookings}</h2>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 rounded-4 shadow-sm h-100">
                <div className="card-body text-center py-4">
                  <div
                    className="rounded-circle d-inline-flex justify-content-center align-items-center mb-3"
                    style={{
                      width: 65,
                      height: 65,
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontSize: "28px",
                    }}
                  >
                    🎫
                  </div>

                  <h6 className="text-muted">Tickets</h6>

                  <h2 className="fw-bold">{dashboard.tickets}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Events */}

          <div className="card border-0 shadow rounded-4 mt-5">
            <div className="card-header bg-white border-0 py-4">
              <h4 className="fw-bold mb-0">Available Events</h4>
            </div>

            <div className="card-body">
              {activeEvents.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
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
                        const eventId =
                          event.eventId || event.event_id || index;

                        return (
                          <tr key={eventId}>
                            <td className="fw-semibold">{event.title}</td>

                            <td>{event.venue?.venueName || "N/A"}</td>

                            <td>{event.category?.categoryName || "N/A"}</td>

                            <td>₹ {event.price}</td>

                            <td>
                              {event.availableSeats || event.available_seats}
                            </td>

                            <td>
                              <Link
                                to={`/event/${eventId}`}
                                className="btn btn-primary rounded-pill px-4"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <h5>No Events Available</h5>

                  <p className="text-muted">Check back later for new events.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
