import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import {
  getUsers,
  blockUser,
  activateUser,
  approveOrganizer,
  rejectOrganizer,
} from "../../services/adminService";
import { FiUsers, FiSearch, FiCheckCircle, FiXCircle, FiSlash, FiCheck } from "react-icons/fi";

const statusBadge = {
  ACTIVE: "bg-success",
  PENDING: "bg-warning text-dark",
  INACTIVE: "bg-secondary",
};

export default function OrganizerManagement() {
  const [organizers, setOrganizers] = useState([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actingId, setActingId] = useState(null);

  const loadOrganizers = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        const list = Array.isArray(rawData) ? rawData : [];
        const orgs = list.filter((u) => u.role === "ROLE_ORGANIZER");
        setOrganizers(orgs);
        setFilteredOrganizers(orgs);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load organizers", err);
        setError("Could not load platform organizers. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrganizers();
  }, []);

  useEffect(() => {
    let result = [...organizers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q)) ||
          (u.userId && String(u.userId).includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((u) => u.status === statusFilter);
    }

    setFilteredOrganizers(result);
  }, [searchQuery, statusFilter, organizers]);

  const runAction = (id, action, actionLabel) => {
    setActingId(id);
    setError("");
    setSuccessMsg("");
    action(id)
      .then(() => {
        setSuccessMsg(`Organizer #${id} action '${actionLabel}' processed successfully.`);
        loadOrganizers();
      })
      .catch((err) => {
        console.error("Error updating organizer:", err);
        setError(err.response?.data?.message || `Failed to ${actionLabel} organizer.`);
      })
      .finally(() => setActingId(null));
  };

  const handleApprove = (id) => runAction(id, approveOrganizer, "Approve");
  const handleReject = (id) => runAction(id, rejectOrganizer, "Reject");
  const handleBlock = (id) => runAction(id, blockUser, "Block");
  const handleActivate = (id) => runAction(id, activateUser, "Activate");

  const pendingCount = organizers.filter((u) => u.status === "PENDING").length;
  const activeCount = organizers.filter((u) => u.status === "ACTIVE").length;

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                🎪 Event Host Approval Portal
              </span>
              <h2 className="fw-bold mb-1">Organizer Accreditation & Verification</h2>
              <p className="mb-0 text-white-50 small">
                Review organizer registration applications, grant publishing credentials, and manage host accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-3 px-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Pending Applications</h6>
              <h2 className="fw-bold mb-0 text-warning">{pendingCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Active Approved Hosts</h6>
              <h2 className="fw-bold mb-0 text-success">{activeCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Total Registered Organizers</h6>
              <h2 className="fw-bold mb-0 text-primary">{organizers.length}</h2>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FiUsers className="text-primary" /> Event Organizers ({filteredOrganizers.length})
            </h4>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="input-group" style={{ maxWidth: 280 }}>
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search organizer name, email..."
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
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-danger rounded-4">{error}</div>}
          {successMsg && <div className="alert alert-success rounded-4">{successMsg}</div>}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Organizer Name</th>
                  <th>Email Address</th>
                  <th>Contact Phone</th>
                  <th>Status</th>
                  <th className="text-end">Administrative Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading organizers...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrganizers.length > 0 ? (
                  filteredOrganizers.map((u) => (
                    <tr key={u.userId}>
                      <td className="fw-bold text-primary">#{u.userId}</td>
                      <td>
                        <div className="fw-bold">{u.name || "Organizer"}</div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>{u.phone || "N/A"}</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 fw-semibold ${statusBadge[u.status] || "bg-secondary"}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {u.status === "PENDING" ? (
                          <div className="d-inline-flex gap-2">
                            <button
                              onClick={() => handleApprove(u.userId)}
                              className="btn btn-success btn-sm rounded-pill px-3"
                              disabled={actingId === u.userId}
                            >
                              <FiCheck className="me-1" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(u.userId)}
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              disabled={actingId === u.userId}
                            >
                              <FiXCircle className="me-1" /> Reject
                            </button>
                          </div>
                        ) : u.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleBlock(u.userId)}
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            disabled={actingId === u.userId}
                          >
                            <FiSlash className="me-1" /> Block Host
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.userId)}
                            className="btn btn-success btn-sm rounded-pill px-3"
                            disabled={actingId === u.userId}
                          >
                            <FiCheckCircle className="me-1" /> Activate Host
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No matching organizer records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
