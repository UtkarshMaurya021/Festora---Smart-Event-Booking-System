import { useEffect, useState } from "react";
import Navbar from "../../components/AdminNavbar";
import { getEvents, deleteEvent } from "../../services/adminService";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = () => {
    setLoading(true);
    getEvents()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        setEvents(Array.isArray(rawData) ? rawData : []);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load events", err);
        setError("Failed to load events.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to remove this event?")) {
      deleteEvent(id)
        .then(loadEvents)
        .catch((err) => {
          console.error("Error deleting event:", err);
          alert("Error deleting event");
        });
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "-";
    const d = new Date(dt);
    return isNaN(d.getTime()) ? dt : d.toLocaleString();
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Event Management</h2>

        <div className="card p-4 shadow-sm">
          <h4>All Events ({events.length})</h4>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="table-responsive mt-3">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Category</th>
                  <th>Venue</th>
                  <th>Start Date</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-3">
                      Loading...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-3">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.eventId}>
                      <td>{ev.eventId}</td>
                      <td>{ev.title}</td>
                      <td>
                        {ev.organizer?.companyName ||
                          ev.organizer?.user?.name ||
                          "-"}
                      </td>
                      <td>{ev.category?.categoryName || ev.category?.name || "-"}</td>
                      <td>{ev.venue?.name || ev.venue?.venueName || "-"}</td>
                      <td>{formatDate(ev.eventStartDatetime)}</td>
                      <td>
                        {ev.availableSeats ?? "-"}/{ev.totalSeats ?? "-"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            ev.status === "ACTIVE" ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(ev.eventId)}
                          className="btn btn-danger btn-sm"
                          disabled={ev.status !== "ACTIVE"}
                        >
                          Remove
                        </button>
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
