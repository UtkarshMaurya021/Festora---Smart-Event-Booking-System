import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import EventImageSlider from "../components/EventImageSlider";
import { getMyBookings } from "../services/bookingService";

function statusBadgeClass(status) {
  switch (status) {
    case "SUCCESS":
    case "ACTIVE":
    case "COMPLETED":
      return "bg-success text-white";
    case "PENDING":
      return "bg-warning text-dark";
    case "FAILED":
    case "INACTIVE":
      return "bg-danger text-white";
    default:
      return "bg-secondary text-white";
  }
}

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const showSuccessBanner = searchParams.get("status") === "success";

  useEffect(() => {
    const load = () => {
      setLoading(true);
      setError("");
      getMyBookings()
        .then((res) => {
          setBookings(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
          console.error("Error loading bookings:", err);
          setError("Could not load your bookings. Please try again.");
        })
        .finally(() => setLoading(false));
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading your bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />

      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div className="container-fluid px-4 py-4">
          <div
            className="rounded-4 p-4 text-white shadow-lg mb-4"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)",
            }}
          >
            <h2 className="fw-bold mb-2">My Bookings 📖</h2>
            <p className="mb-0 opacity-75">
              Track every booking you've made, view ticket seats, and check confirmation status.
            </p>
          </div>

          {/* Success Confirmation Banner when redirected from payment */}
          {showSuccessBanner && (
            <div className="alert alert-success border-0 shadow-sm rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
              <span className="fs-3">🎉</span>
              <div>
                <h5 className="fw-bold mb-1 text-success">Ticket Booking Confirmed Successfully!</h5>
                <p className="mb-0 small text-dark opacity-75">
                  Your payment has been processed, tickets have been issued, and a confirmation receipt email has been sent to your registered inbox.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger rounded-4 mb-4" role="alert">
              {error}
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 py-4">
              <h4 className="fw-bold mb-0">Booking History ({bookings.length})</h4>
            </div>

            <div className="card-body">
              {bookings.length > 0 ? (
                <div className="row g-4">
                  {bookings.map((b) => (
                    <div className="col-md-6 col-lg-4" key={b.bookingId}>
                      <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <EventImageSlider
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
                            Booking ID: <strong>#{b.bookingId}</strong>
                          </div>

                          <div className="text-dark small mb-3 fw-semibold">
                            Seats: <span className="badge bg-dark text-white ms-1">{b.seatNumbers || "General Entry"}</span>
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

export default UserBookings;