import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getAdminDashboard } from "../services/dashboardService";
import { approveOrganizer, rejectOrganizer } from "../services/adminService";

const emptyStats = {
  users: 0,
  organizers: 0,
  eventsCount: 0,
  revenue: 0,
};

function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const loadDashboard = () => {
    getAdminDashboard()
      .then((res) => {
        const data = res.data || {};

        setStats({
          users: data.users ?? 0,
          organizers: data.organizers ?? 0,
          eventsCount: data.eventsCount ?? 0,
          revenue: data.revenue ?? 0,
        });

        setOrganizerRequests(data.organizerRequests || []);
      })
      .catch((err) => {
        console.error("Error fetching admin dashboard:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApprove = (id) => {
    setActingId(id);

    approveOrganizer(id)
      .then(() => loadDashboard())
      .catch((err) => {
        console.error("Error approving organizer:", err);
        alert("Error approving organizer");
      })
      .finally(() => {
        setActingId(null);
      });
  };

  const handleReject = (id) => {
    if (!window.confirm("Reject this organizer request?")) return;

    setActingId(id);

    rejectOrganizer(id)
      .then(() => loadDashboard())
      .catch((err) => {
        console.error("Error rejecting organizer:", err);
        alert("Error rejecting organizer");
      })
      .finally(() => {
        setActingId(null);
      });
  };

  return (
    <>
      <Sidebar />

      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="row">
          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Users</h6>
              <h2>{stats.users}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Organizers</h6>
              <h2>{stats.organizers}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Events</h6>
              <h2>{stats.eventsCount}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card">
              <h6>Revenue</h6>
              <h2>₹{stats.revenue}</h2>
            </div>
          </div>
        </div>

        <div className="card mt-5 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>
              Organizer Requests{" "}
              {organizerRequests.length > 0 && (
                <span className="badge bg-warning text-dark ms-2">
                  {organizerRequests.length} Pending
                </span>
              )}
            </h4>
          </div>

          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    Loading...
                  </td>
                </tr>
              ) : organizerRequests.length > 0 ? (
                organizerRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.name}</td>
                    <td>{req.email}</td>
                    <td>{req.phone}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        disabled={actingId === req.id}
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        disabled={actingId === req.id}
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    No pending organizer requests
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

export default AdminDashboard;