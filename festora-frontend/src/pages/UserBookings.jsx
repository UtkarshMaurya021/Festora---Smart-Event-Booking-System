import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import EventImageSlider from "../components/EventImageSlider";
import { getMyBookings } from "../services/bookingService";

function statusBadgeClass(st) {
  switch (st) {
    case "CONFIRMED":
    case "ACTIVE":
      return "bg-success text-white";
    case "PENDING":
      return "bg-warning text-dark";
    case "CANCELLED":
    case "FAILED":
      return "bg-danger text-white";
    default:
      return "bg-secondary text-white";
  }
}

export default function UserBookings() {
  const [searchParams] = useSearchParams();
  const isSuccessRedirect = searchParams.get("status") === "success";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data || []))
      .catch((err) => {
        console.error("Failed to load user bookings:", err);
        setError("Could not load your bookings right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Dashboard Hero Header */}
        <div
          className="dashboard-hero-banner mx-3 mb-4"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
            borderRadius: "20px",
            padding: "32px 36px",
            color: "#ffffff",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge hero-badge-light mb-2">
                🎟️ My Passes & Tickets
              </span>
              <h2 className="fw-bold mb-1 text-white">Your Event Reservations</h2>
              <p className="mb-0 text-white-50 small">
                Track your active gate passes, ticket receipts, and confirmed event allocations.
              </p>
            </div>

            <span className="badge bg-white text-dark px-3 py-2 fw-bold fs-6">
              Total Reserved: {bookings.length}
            </span>
          </div>
        </div>

        <div className="container-fluid px-3">
          {isSuccessRedirect && (
            <div className="alert alert-success rounded-4 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-1">🎉 Reservation Confirmed!</h5>
              <p className="mb-0 small">
                Your payment was verified successfully and your gate pass tickets are listed below.
              </p>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="card-body p-4 p-md-5">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading bookings...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger rounded-4">{error}</div>
              ) : bookings.length > 0 ? (
                <div className="row g-4">
                  {bookings.map((b) => (
                    <div className="col-md-6 col-lg-4" key={b.bookingId}>
                      <div className="card h-100 border rounded-4 overflow-hidden shadow-sm hover-shadow transition">
                        <EventImageSlider
                          title={b.eventTitle}
                          images={
                            b.eventImageUrl
                              ? [{ imageUrl: b.eventImageUrl }]
                              : []
                          }
                        />

                        <div className="card-body d-flex flex-column p-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="fw-bold mb-0 text-primary">
                              {b.eventTitle || "Event unavailable"}
                            </h5>

                            <span className={`badge px-3 py-2 fw-semibold ${statusBadgeClass(b.status)}`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="text-muted small mb-2">
                            Seat / Tier No: <strong className="text-dark">{b.seatNumbers || "General Entry"}</strong>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                            <span className="text-muted small fw-bold">
                              Qty: {b.quantity} Ticket(s)
                            </span>

                            <span className="fw-bold fs-5 text-success">
                              ₹{b.totalAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <h5 className="fw-bold">No Bookings Yet</h5>
                  <p className="text-muted">
                    Once you book an event, it will show up here along with your confirmation receipt.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}