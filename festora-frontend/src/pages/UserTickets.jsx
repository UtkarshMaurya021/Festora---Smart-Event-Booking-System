import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getTickets } from "../services/Ticketservice.jS";

const API_HOST = "http://localhost:8080/";

function formatDateTime(dt) {
  if (!dt) return "N/A";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function UserTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await getTickets();
        setTickets(response.data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading issued tickets...</span>
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
            <h2 className="fw-bold mb-2">Your Digital Tickets 🎫</h2>
            <p className="mb-0 opacity-75">
              Scan the QR code at the venue gate for fast check-in.
            </p>
          </div>

          <div className="card border-0 shadow rounded-4">
            <div className="card-header bg-white border-0 py-4">
              <h4 className="fw-bold mb-0">Issued Digital Tickets</h4>
            </div>

            <div className="card-body">
              {tickets.length > 0 ? (
                <div className="row g-4">
                  {tickets.map((ticket) => {
                    const booking = ticket.booking;
                    const event = booking?.event;

                    return (
                      <div className="col-md-6 col-lg-4" key={ticket.ticketId}>
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                          <div className="card-body d-flex flex-column align-items-center text-center p-4">
                            <div className="bg-light p-3 rounded-4 mb-3 border">
                              <img
                                src={API_HOST + ticket.qrCodePath}
                                alt={ticket.ticketNumber}
                                style={{
                                  width: 160,
                                  height: 160,
                                  objectFit: "contain",
                                }}
                              />
                            </div>

                            <h5 className="fw-bold mb-1 text-dark">
                              {event?.title || "N/A"}
                            </h5>

                            <p className="text-muted mb-2 small">
                              📍 {event?.venue?.venueName || "N/A"}
                              {event?.venue?.address ? `, ${event.venue.address}` : ""}
                            </p>

                            <div className="w-100 bg-light p-3 rounded-3 text-start small mb-3">
                              <div className="mb-1">
                                <strong>📅 Starts:</strong> {formatDateTime(event?.eventStartDatetime)}
                              </div>
                              <div>
                                <strong>🏁 Ends:</strong> {formatDateTime(event?.eventEndDatetime)}
                              </div>
                            </div>

                            <div className="d-flex gap-2 mb-2 flex-wrap justify-content-center">
                              <span className="badge bg-primary fs-6 px-3 py-2">
                                {ticket.ticketNumber}
                              </span>
                              <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                                Seat: {ticket.seatNumber || "General"}
                              </span>
                            </div>

                            <div className="w-100 d-flex justify-content-between small text-muted mt-2 border-top pt-2">
                              <span>Total Qty: {booking?.quantity ?? 1}</span>
                              <span>
                                Issued: {ticket.issueDate ? new Date(ticket.issueDate).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5">
                  <h5>No Tickets Yet</h5>
                  <p className="text-muted">
                    Tickets appear here once a booking is paid for.
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

export default UserTickets;
