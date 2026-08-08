import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getEvents, deleteEvent } from "../../services/adminService";
import { FiCalendar, FiSearch, FiTrash2 } from "react-icons/fi";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actingId, setActingId] = useState(null);

  const loadEvents = () => {
    setLoading(true);
    getEvents()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        const list = Array.isArray(rawData) ? rawData : [];
        setEvents(list);
        setFilteredEvents(list);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load events", err);
        setError("Could not load platform events. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    let result = [...events];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ev) =>
          (ev.title && ev.title.toLowerCase().includes(q)) ||
          (ev.organizer?.companyName && ev.organizer.companyName.toLowerCase().includes(q)) ||
          (ev.organizer?.user?.name && ev.organizer.user.name.toLowerCase().includes(q)) ||
          (ev.category?.categoryName && ev.category.categoryName.toLowerCase().includes(q)) ||
          (ev.venue?.venueName && ev.venue.venueName.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((ev) => ev.status === statusFilter);
    }

    setFilteredEvents(result);
  }, [searchQuery, statusFilter, events]);

  const handleDelete = (id) => {
    if (!id) return;
    setActingId(id);
    setError("");
    setSuccessMsg("");
    deleteEvent(id)
      .then(() => {
        setSuccessMsg(`Event #${id} has been removed successfully.`);
        loadEvents();
      })
      .catch((err) => {
        console.error("Error deleting event:", err);
        setError(err.response?.data?.message || "Failed to remove event.");
      })
      .finally(() => setActingId(null));
  };

  const formatDate = (dt) => {
    if (!dt) return "-";
    const d = new Date(dt);
    return isNaN(d.getTime()) ? dt : d.toLocaleString();
  };

  const activeCount = events.filter((e) => e.status === "ACTIVE").length;
  const pendingCount = events.filter((e) => e.status === "PENDING").length;

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                🎟️ Event Moderation & Publishing
              </span>
              <h2 className="fw-bold mb-1">Global Event Catalogue</h2>
              <p className="mb-0 text-white-50 small">
                Audit published events, check venue capacities, inspect organizer ownership, and manage live listings.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-3 px-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Live Published Events</h6>
              <h2 className="fw-bold mb-0 text-success">{activeCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Pending Review</h6>
              <h2 className="fw-bold mb-0 text-warning">{pendingCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Total Platform Events</h6>
              <h2 className="fw-bold mb-0 text-primary">{events.length}</h2>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FiCalendar className="text-primary" /> Platform Events Directory ({filteredEvents.length})
            </h4>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="input-group" style={{ maxWidth: 280 }}>
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search title, category, venue..."
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
                <option value="PENDING">PENDING</option>
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
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Category</th>
                  <th>Venue</th>
                  <th>Start Date</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading events...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((ev) => (
                    <tr key={ev.eventId}>
                      <td className="fw-bold text-primary">#{ev.eventId}</td>
                      <td>
                        <div className="fw-bold">{ev.title}</div>
                      </td>
                      <td className="small text-muted">
                        {ev.organizer?.companyName || ev.organizer?.user?.name || "-"}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {ev.category?.categoryName || ev.category?.name || "-"}
                        </span>
                      </td>
                      <td className="small">{ev.venue?.name || ev.venue?.venueName || "-"}</td>
                      <td className="small text-muted">{formatDate(ev.eventStartDatetime)}</td>
                      <td className="fw-bold">
                        {ev.availableSeats ?? "-"}/{ev.totalSeats ?? "-"}
                      </td>
                      <td>
                        <span
                          className={`badge px-3 py-2 fw-semibold ${
                            ev.status === "ACTIVE" ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleDelete(ev.eventId)}
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          disabled={actingId === ev.eventId || ev.status !== "ACTIVE"}
                        >
                          <FiTrash2 className="me-1" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No matching events found.
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
