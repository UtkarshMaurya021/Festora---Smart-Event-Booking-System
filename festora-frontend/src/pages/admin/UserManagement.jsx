import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getUsers, blockUser, activateUser } from "../../services/adminService";
import { FiUsers, FiSearch, FiUserCheck, FiUserX, FiShield } from "react-icons/fi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actingId, setActingId] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        const list = Array.isArray(rawData) ? rawData : [];
        const filtered = list.filter((u) => u.role === "ROLE_USER");
        setUsers(filtered);
        setFilteredUsers(filtered);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load users", err);
        setError("Could not load platform users. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

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

    setFilteredUsers(result);
  }, [searchQuery, statusFilter, users]);

  const handleBlock = (id) => {
    setActingId(id);
    setError("");
    setSuccessMsg("");
    blockUser(id)
      .then(() => {
        setSuccessMsg(`User #${id} has been blocked successfully.`);
        loadUsers();
      })
      .catch((err) => {
        console.error("Error blocking user:", err);
        setError(err.response?.data?.message || "Failed to block user.");
      })
      .finally(() => setActingId(null));
  };

  const handleActivate = (id) => {
    setActingId(id);
    setError("");
    setSuccessMsg("");
    activateUser(id)
      .then(() => {
        setSuccessMsg(`User #${id} has been activated successfully.`);
        loadUsers();
      })
      .catch((err) => {
        console.error("Error activating user:", err);
        setError(err.response?.data?.message || "Failed to activate user.");
      })
      .finally(() => setActingId(null));
  };

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const blockedCount = users.filter((u) => u.status === "INACTIVE").length;

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Hero Header Banner */}
        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-indigo text-white px-3 py-2 fw-bold mb-2 border border-light-subtle">
                <FiShield className="me-1" /> User Account Governance
              </span>
              <h2 className="fw-bold mb-1">Registered Attendee Directory</h2>
              <p className="mb-0 text-white-50 small">
                Manage user access, audit account statuses, and enforce platform security policies.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="row g-3 px-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Total Registered Users</h6>
              <h2 className="fw-bold mb-0 text-indigo">{users.length}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Active Accounts</h6>
              <h2 className="fw-bold mb-0 text-success">{activeCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Blocked / Inactive</h6>
              <h2 className="fw-bold mb-0 text-danger">{blockedCount}</h2>
            </div>
          </div>
        </div>

        {/* User Directory Table Card */}
        <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FiUsers className="text-primary" /> End-User Accounts ({filteredUsers.length})
            </h4>

            {/* Filter controls */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="input-group" style={{ maxWidth: 280 }}>
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search name, email, phone..."
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
                  <th>User ID</th>
                  <th>Attendee Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th className="text-end">Account Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.userId}>
                      <td className="fw-bold text-primary">#{u.userId}</td>
                      <td>
                        <div className="fw-bold">{u.name || "Attendee"}</div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>{u.phone || "N/A"}</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 fw-semibold ${
                            u.status === "ACTIVE" ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {u.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleBlock(u.userId)}
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            disabled={actingId === u.userId}
                          >
                            <FiUserX className="me-1" /> Block User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.userId)}
                            className="btn btn-success btn-sm rounded-pill px-3"
                            disabled={actingId === u.userId}
                          >
                            <FiUserCheck className="me-1" /> Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No matching user records found.
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
