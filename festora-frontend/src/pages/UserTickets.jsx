import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getTickets } from "../services/Ticketservice.jS";

const API_HOST = "http://localhost:8080/";

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
          {/* Header Banner */}
          <div
            className="rounded-4 p-5 text-white shadow-lg mb-4"
            style={{
              background:
                "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#3b82f6 100%)",
            }}
          >
            <h2 className="fw-bold mb-2">Your Tickets 🎫</h2>

            <p className="mb-0 opacity-75">
              Scan the QR code at the venue to check in.
            </p>
          </div>

          <div className="card border-0 shadow rounded-4">
            <div className="card-header bg-white border-0 py-4">
              <h4 className="fw-bold mb-0">Issued Tickets</h4>
            </div>

            <div className="card-body">
              {tickets.length > 0 ? (
                <div className="row g-4">
                  {tickets.map((ticket) => {
                    const booking = ticket.booking;
                    const event = booking?.event;

                    return (
                      <div className="col-md-6 col-lg-4" key={ticket.ticketId}>
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                          <div className="card-body d-flex flex-column align-items-center text-center">
                            <img
                              src={API_HOST + ticket.qrCodePath}
                              alt={ticket.ticketNumber}
                              style={{
                                width: 150,
                                height: 150,
                                objectFit: "contain",
                              }}
                              className="mb-3"
                            />

                            <h5 className="fw-bold mb-1">
                              {event?.title || "N/A"}
                            </h5>

                            <p className="text-muted mb-2 small">
                              {event?.venue?.venueName || "N/A"}
                            </p>

                            <span className="badge bg-primary-subtle text-primary mb-2">
                              {ticket.ticketNumber}
                            </span>

                            <div className="w-100 d-flex justify-content-between small text-muted mt-2">
                              <span>Qty: {booking?.quantity ?? "N/A"}</span>

                              <span>
                                {ticket.issueDate
                                  ? new Date(
                                      ticket.issueDate
                                    ).toLocaleDateString()
                                  : "N/A"}
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
