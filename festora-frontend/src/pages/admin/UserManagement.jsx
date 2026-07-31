import { useEffect, useState } from "react";
import Navbar from "../../components/AdminNavbar";
import { getUsers, blockUser, activateUser } from "../../services/adminService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        const list = Array.isArray(rawData) ? rawData : [];
        // Only plain end-users on this page (organizers/admins have their own views)
        setUsers(list.filter((u) => u.role === "ROLE_USER"));
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load users", err);
        setError("Failed to load users.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBlock = (id) => {
    blockUser(id)
      .then(loadUsers)
      .catch((err) => {
        console.error("Error blocking user:", err);
        alert("Error blocking user");
      });
  };

  const handleActivate = (id) => {
    activateUser(id)
      .then(loadUsers)
      .catch((err) => {
        console.error("Error activating user:", err);
        alert("Error activating user");
      });
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">User Management</h2>

        <div className="card p-4 shadow-sm">
          <h4>All Users</h4>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="table-responsive mt-3">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.userId}>
                      <td>{u.userId}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.status === "ACTIVE" ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {u.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleBlock(u.userId)}
                            className="btn btn-danger btn-sm"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.userId)}
                            className="btn btn-success btn-sm"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
