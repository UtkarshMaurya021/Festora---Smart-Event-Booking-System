import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getOrganizerDashboard } from "../services/dashboardService"; 
import{Link} from "react-router-dom";
function OrganizerDashboard() {

  const [organizerData, setOrganizerData] = useState({
    eventsCount: 0,
    bookingsCount: 0,
    revenue: "₹0",
    pendingCount: 0,
    myEvents: [],
  });

 
  useEffect(() => {
    const loadOrganizerDashboard = async () => {
      try {
        const response = await getOrganizerDashboard();
        setOrganizerData(response.data);
      } catch (error) {
        console.log("Error loading organizer dashboard:", error);
      }
    };
    loadOrganizerDashboard();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="dashboard-main">
        <DashboardNavbar />

        {/* Dynamic Metric Cards */}
        <div className="row">
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Events</h6>
              <h2>{organizerData.eventsCount}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Bookings</h6>
              <h2>{organizerData.bookingsCount}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Revenue</h6>
              <h2>{organizerData.revenue}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Pending</h6>
              <h2>{organizerData.pendingCount}</h2>
            </div>
          </div>
        </div>

        {/* Dynamic My Events Table */}
        <div className="card mt-5 p-4">
          <h4>My Events</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Venue</th>
                <th>Seats</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {organizerData.myEvents && organizerData.myEvents.length > 0 ? (
                organizerData.myEvents.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.title}</td>
                    <td>{item.venue}</td>
                    <td>{item.seats}</td>
                    <td>{item.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    No events managed yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Link

to="/organizer/events"

className="btn btn-primary"

>

Manage Events

</Link>
        </div>
      </div>
    </>
  );
}

export default OrganizerDashboard;
