import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import EventImageSlider from "../components/EventImageSlider";
import { getMyBookings } from "../services/bookingService";

function statusBadgeClass(status) {
  switch (status) {
    case "SUCCESS":
    case "COMPLETED":
      return "bg-success-subtle text-success";
    case "PENDING":
      return "bg-warning-subtle text-warning";
    case "FAILED":
    case "INACTIVE":
      return "bg-danger-subtle text-danger";
    default:
      return "bg-secondary-subtle text-secondary";
  }
}

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
          <span className="visually-hidden">Loading...</span>
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
            className="rounded-4 p-5 text-white shadow-lg mb-4"
            style={{
              background:
                "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#3b82f6 100%)",
            }}
          >
            <h2 className="fw-bold mb-2">My Bookings 📖</h2>

            <p className="mb-0 opacity-75">
              Track every booking you've made, and finish paying for any
              that are still pending.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card border-0 shadow rounded-4">
            <div className="card-header bg-white border-0 py-4">
              <h4 className="fw-bold mb-0">Booking History</h4>
            </div>

            <div className="card-body">
              {bookings.length > 0 ? (
                <div className="row g-4">
                  {bookings.map((b) => (
                    <div className="col-md-6 col-lg-4" key={b.bookingId}>
                      <div className="card border-0 shadow-sm rounded-4 h-100">
                        <EventImageSlider
                          images={
                            b.eventImageUrl
                              ? [{ imageUrl: b.eventImageUrl }]
                              : []
                          }
                        />

                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="fw-bold mb-0">
                              {b.eventTitle || "Event unavailable"}
                            </h5>

                            <span
                              className={`badge ${statusBadgeClass(
                                b.status
                              )}`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <p className="text-muted small mb-3">
                            {b.bookingDate}
                          </p>

                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small">
                              Qty: {b.quantity}
                            </span>

                            <span className="fw-semibold">
                              ₹ {b.totalAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <h5>No Bookings Yet</h5>

                  <p className="text-muted">
                    Once you book an event, it'll show up here.
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