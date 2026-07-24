import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getUserDashboard } from "../services/dashboardService";

function UserDashboard() {
  const [dashboard, setDashboard] = useState({
    upcoming: 0,
    bookings: 0,
    tickets: 0,
     events: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getUserDashboard();

        setDashboard(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    loadDashboard();
  }, []);
  return (
    <>
      <Sidebar />

      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="row">
          <div className="col-md-4">
            <div className="dashboard-card">
              <h6>Upcoming Events</h6>

              <h2>{dashboard.upcoming}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="dashboard-card">
              <h6>Bookings</h6>

              <h2>{dashboard.bookings}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="dashboard-card">
              <h6>Tickets</h6>

              <h2>{dashboard.tickets}</h2>
            </div>
          </div>
        </div>

        <div className="card mt-5 p-4">
          <h4>Upcoming Events</h4>

          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.events && dashboard.events.length > 0 ? (
                dashboard.events.map((item, index) => (
                  <tr key={index}>
                    <td>{item.event}</td>
                    <td>{item.date}</td>
                    <td>{item.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No upcoming events
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
