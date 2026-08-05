import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import api from "../../services/api";
import { FiBook, FiSearch, FiBookmark, FiDollarSign } from "react-icons/fi";

export default function OrganizerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadBookings = () => {
    setLoading(true);
    api.get("/bookings/organizer")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBookings(list);
        setFilteredBookings(list);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load organizer bookings", err);
        setError("Could not load attendee booking records. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    let result = [...bookings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          (b.bookingId && String(b.bookingId).includes(q)) ||
          (b.user?.name && b.user.name.toLowerCase().includes(q)) ||
          (b.user?.email && b.user.email.toLowerCase().includes(q)) ||
          (b.event?.title && b.event.title.toLowerCase().includes(q)) ||
          (b.seatNumbers && b.seatNumbers.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(result);
  }, [searchQuery, statusFilter, bookings]);

  const totalTickets = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

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
                📖 Event Ticket Ledger
              </span>
              <h2 className="fw-bold mb-1">Attendee Ticket Bookings Audit</h2>
              <p className="mb-0 text-white-50 small">
                Track all attendee ticket purchases, inspect seat tier allocations, and audit real-time ticket sales for your hosted events.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="row g-3 px-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="text-muted small fw-bold">TOTAL ATTENDEE BOOKINGS</h6>
              <h2 className="fw-bold mb-0 text-indigo">{bookings.length}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="text-muted small fw-bold">TOTAL TICKETS ISSUED</h6>
              <h2 className="fw-bold mb-0 text-success">{totalTickets}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="text-muted small fw-bold">TOTAL REVENUE COLLECTED</h6>
              <h2 className="fw-bold mb-0 text-warning">₹{totalRevenue}</h2>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FiBookmark className="text-primary" /> Ticket Sales Audit Log ({filteredBookings.length})
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
                  placeholder="Search attendee, event, seat..."
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
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-danger rounded-4">{error}</div>}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Booking ID</th>
                  <th>Attendee Name</th>
                  <th>Email Address</th>
                  <th>Hosted Event Title</th>
                  <th>Seat / Tier</th>
                  <th>Qty</th>
                  <th>Total Paid</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => (
                    <tr key={b.bookingId}>
                      <td className="fw-bold text-primary">#{b.bookingId}</td>
                      <td>
                        <div className="fw-bold">{b.user?.name || "Attendee"}</div>
                      </td>
                      <td className="text-muted">{b.user?.email}</td>
                      <td className="fw-bold">{b.event?.title || "N/A"}</td>
                      <td>
                        <span className="badge bg-dark">{b.seatNumbers || "General Entry"}</span>
                      </td>
                      <td className="fw-bold">{b.quantity}</td>
                      <td className="fw-bold text-success">₹{b.totalAmount}</td>
                      <td className="small text-muted">
                        {b.bookingDate ? new Date(b.bookingDate).toLocaleString() : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge px-3 py-2 fw-semibold ${
                            b.status === "ACTIVE" || b.status === "CONFIRMED"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No attendee bookings found for your hosted events yet.
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
