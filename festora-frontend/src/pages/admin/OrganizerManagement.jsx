import { useEffect, useState } from "react";
import Navbar from "../../components/AdminNavbar";
import {
  getUsers,
  blockUser,
  activateUser,
  approveOrganizer,
  rejectOrganizer,
} from "../../services/adminService";

const statusBadge = {
  ACTIVE: "bg-success",
  PENDING: "bg-warning text-dark",
  INACTIVE: "bg-secondary",
};

export default function OrganizerManagement() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
 useEffect(() => {
  const loadOrganizers = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        const list = Array.isArray(rawData) ? rawData : [];
        setOrganizers(list.filter((u) => u.role === "ROLE_ORGANIZER"));
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load organizers", err);
        setError("Failed to load organizers.");
      })
      .finally(() => setLoading(false));
  };

 
    loadOrganizers();
  }, []);

  const runAction = (id, action) => {
    setActingId(id);
    action(id)
      .then(loadOrganizers)
      .catch((err) => {
        console.error("Error updating organizer:", err);
        alert("Error updating organizer");
      })
      .finally(() => setActingId(null));
  };

  const handleApprove = (id) => runAction(id, approveOrganizer);
  const handleReject = (id) => runAction(id, rejectOrganizer);
  const handleBlock = (id) => runAction(id, blockUser);
  const handleActivate = (id) => runAction(id, activateUser);

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Organizer Management</h2>

        <div className="card p-4 shadow-sm">
          <h4>All Organizers</h4>

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
                ) : organizers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      No organizers found.
                    </td>
                  </tr>
                ) : (
                  organizers.map((u) => (
                    <tr key={u.userId}>
                      <td>{u.userId}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span
                          className={`badge ${statusBadge[u.status] || "bg-secondary"}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {u.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApprove(u.userId)}
                              className="btn btn-success btn-sm me-2"
                              disabled={actingId === u.userId}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(u.userId)}
                              className="btn btn-danger btn-sm"
                              disabled={actingId === u.userId}
                            >
                              Reject
                            </button>
                          </>
                        ) : u.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleBlock(u.userId)}
                            className="btn btn-danger btn-sm"
                            disabled={actingId === u.userId}
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.userId)}
                            className="btn btn-success btn-sm"
                            disabled={actingId === u.userId}
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
