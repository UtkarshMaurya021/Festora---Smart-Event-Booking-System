import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getAdminDashboard } from "../services/dashboardService"; // Make sure this service function exists

function AdminDashboard() {
  // 1. Initialize state with default values matching your dashboard metrics and tables
  const [adminData, setAdminData] = useState({
    users: 0,
    organizers: 0,
    eventsCount: 0,
    revenue: "₹0",
    recentEvents: [],
  });

  // 2. Fetch data from backend on component mount
  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        const response = await getAdminDashboard();
        setAdminData(response.data);
      } catch (error) {
        console.log("Error fetching admin dashboard data:", error);
      }
    };
    loadAdminDashboard();
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
              <h6>Users</h6>
              <h2>{adminData.users}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Organizers</h6>
              <h2>{adminData.organizers}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Events</h6>
              <h2>{adminData.eventsCount}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Revenue</h6>
              <h2>{adminData.revenue}</h2>
            </div>
          </div>
        </div>

        {/* Dynamic Recent Events Table */}
        <div className="card mt-5 p-4">
          <h4>Recent Events</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Organizer</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminData.recentEvents && adminData.recentEvents.length > 0 ? (
                adminData.recentEvents.map((event, index) => (
                  <tr key={event.id || index}>
                    <td>{event.title}</td>
                    <td>{event.organizerName}</td>
                    <td>{event.category}</td>
                    <td>{event.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    No recent events found</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
