import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import EventImageSlider from "../components/EventImageSlider";
import { getMyBookings, cancelBooking } from "../services/bookingService";

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
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [cancelErrorMsg, setCancelErrorMsg] = useState("");

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data || []))
      .catch((err) => {
        console.error("Failed to load user bookings:", err);
        setError("Could not load your bookings right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancelReservation = async (b) => {
    setCancellingId(b.bookingId);
    setCancelErrorMsg("");
    setSuccessMsg("");

    try {
      await cancelBooking(b.bookingId);
      setBookings((prev) =>
        prev.map((item) =>
          item.bookingId === b.bookingId ? { ...item, status: "CANCELLED" } : item
        )
      );
      setSuccessMsg(
        `🎉 Reservation for "${b.eventTitle}" cancelled successfully. Full refund of ₹${b.totalAmount} initiated!`
      );
      setConfirmingId(null);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setCancelErrorMsg(
        err.response?.data?.message || "Could not cancel booking. Event may have already started."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const isEventNotStarted = (startDtStr) => {
    if (!startDtStr) return true;
    return new Date(startDtStr) > new Date();
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

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
                Track active gate passes, ticket receipts, or cancel upcoming reservations for a full refund.
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

          {successMsg && (
            <div className="alert alert-success rounded-4 shadow-sm p-4 mb-4 fw-semibold d-flex justify-content-between align-items-center">
              <div>{successMsg}</div>
              <button className="btn-close" onClick={() => setSuccessMsg("")}></button>
            </div>
          )}

          {cancelErrorMsg && (
            <div className="alert alert-danger rounded-4 shadow-sm p-4 mb-4 fw-semibold d-flex justify-content-between align-items-center">
              <div>⚠️ {cancelErrorMsg}</div>
              <button className="btn-close" onClick={() => setCancelErrorMsg("")}></button>
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
                  {bookings.map((b) => {
                    const canCancel =
                      b.status !== "CANCELLED" &&
                      b.status !== "FAILED" &&
                      isEventNotStarted(b.eventStartDatetime);

                    const isConfirmingThis = confirmingId === b.bookingId;

                    return (
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

                            <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top mb-3">
                              <span className="text-muted small fw-bold">
                                Qty: {b.quantity} Ticket(s)
                              </span>

                              <span className="fw-bold fs-5 text-success">
                                ₹{b.totalAmount}
                              </span>
                            </div>

                            {canCancel && (
                              <>
                                {!isConfirmingThis ? (
                                  <button
                                    className="btn btn-outline-danger btn-sm rounded-pill py-2 fw-bold w-100 mt-2"
                                    onClick={() => setConfirmingId(b.bookingId)}
                                  >
                                    Cancel Reservation & Refund
                                  </button>
                                ) : (
                                  <div className="bg-light p-3 rounded-4 border text-center mt-2">
                                    <div className="small fw-bold text-dark mb-2">
                                      Confirm full refund of ₹{b.totalAmount}?
                                    </div>
                                    <div className="d-flex gap-2">
                                      <button
                                        className="btn btn-danger btn-sm rounded-pill fw-bold flex-grow-1"
                                        onClick={() => handleCancelReservation(b)}
                                        disabled={cancellingId === b.bookingId}
                                      >
                                        {cancellingId === b.bookingId ? "Processing..." : "Yes, Cancel"}
                                      </button>
                                      <button
                                        className="btn btn-outline-secondary btn-sm rounded-pill fw-bold"
                                        onClick={() => setConfirmingId(null)}
                                      >
                                        Keep
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {b.status === "CANCELLED" && (
                              <div className="badge bg-light text-danger border p-2 text-center rounded-3 fw-semibold">
                                Cancelled & Refund Processed
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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