import { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import api from "../services/api";
import { FiCheckSquare, FiSearch, FiCheckCircle, FiXCircle, FiUser, FiMail, FiCalendar, FiDollarSign, FiBookmark } from "react-icons/fi";

export default function VerifyTicket() {
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      setError("Please enter a valid Seat Tier, Seat Number, or Ticket Code.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    api.get(`/bookings/verify/${encodeURIComponent(ticketId.trim())}`)
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        console.error("Error verifying ticket", err);
        setError("Could not verify ticket. Invalid token or network error.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Hero Header Banner */}
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
                🎟️ Entry Gate Operations
              </span>
              <h2 className="fw-bold mb-1">Ticket Verification Center</h2>
              <p className="mb-0 text-white-50 small">
                Verify attendee ticket authenticity, seat tier allocations, and payment status instantly by entering Seat Tier / Numbers or Ticket Code.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-3 mb-5" style={{ maxWidth: 800 }}>
          {/* Lookup Input Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiCheckSquare className="text-primary" /> Enter Seat Tier / Numbers or Ticket Code
            </h4>

            <form onSubmit={handleVerify} className="d-flex gap-2 flex-wrap">
              <div className="input-group flex-grow-1">
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-start-0 ps-0 fw-semibold"
                  placeholder="e.g. EXECUTIVE-14, VIP-1, TKT-19-1..."
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Token"}
              </button>
            </form>

            {error && <div className="alert alert-danger rounded-4 mt-3 mb-0">{error}</div>}
          </div>

          {/* Verification Result Card */}
          {result && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div
                className={`alert border-0 rounded-4 p-3 mb-4 d-flex align-items-center gap-3 ${
                  result.valid ? "alert-success" : "alert-danger"
                }`}
              >
                {result.valid ? (
                  <FiCheckCircle size={32} className="text-success flex-shrink-0" />
                ) : (
                  <FiXCircle size={32} className="text-danger flex-shrink-0" />
                )}
                <div>
                  <h5 className="fw-bold mb-1">
                    {result.valid ? "TICKET VERIFIED & VALID" : "INVALID / EXPIRED TICKET"}
                  </h5>
                  <div className="small">{result.verificationMessage}</div>
                </div>
              </div>

              {(result.bookingId || result.seatNumbers) && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">SEAT TIER / NUMBERS</span>
                      <h4 className="fw-bold text-primary mb-0">{result.seatNumbers || "EXECUTIVE-14"}</h4>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">TICKET STATUS</span>
                      <span
                        className={`badge px-3 py-2 fw-semibold fs-6 ${
                          result.valid ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">BOOKING REFERENCE</span>
                      <div className="fw-bold text-dark">#{result.bookingId}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">
                        <FiUser className="me-1" /> ATTENDEE NAME
                      </span>
                      <div className="fw-bold text-dark">{result.attendeeName}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">
                        <FiMail className="me-1" /> ATTENDEE EMAIL
                      </span>
                      <div className="fw-bold text-dark">{result.attendeeEmail}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">
                        <FiCalendar className="me-1" /> EVENT TITLE
                      </span>
                      <div className="fw-bold text-primary">{result.eventTitle}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">QUANTITY</span>
                      <div className="fw-bold text-dark">{result.quantity} Ticket(s)</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-4">
                      <span className="text-muted small fw-bold d-block mb-1">
                        <FiDollarSign className="me-1" /> TOTAL AMOUNT PAID
                      </span>
                      <div className="fw-bold text-success fs-5">₹{result.totalAmount}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
