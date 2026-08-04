import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { getAdminDashboard } from "../services/dashboardService";
import {
  approveOrganizer,
  rejectOrganizer,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  updateEventStatus,
  getEmailLogs,
  getEvents,
  getBookings,
  getPayments
} from "../services/adminService";
import { FiMail, FiCheckCircle, FiXCircle, FiPlay, FiCheck, FiCreditCard, FiBookmark } from "react-icons/fi";

const emptyStats = {
  users: 0,
  organizers: 0,
  eventsCount: 0,
  revenue: 0,
};

function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("ORGANIZER_REQUESTS");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      const data = res.data || {};

      setStats({
        users: data.users ?? 0,
        organizers: data.organizers ?? 0,
        eventsCount: data.eventsCount ?? 0,
        revenue: data.revenue ?? 0,
      });
      setOrganizerRequests(data.organizerRequests || []);

      const pendingEvtRes = await getPendingEvents();
      setPendingEvents(pendingEvtRes.data || []);

      const allEvtRes = await getEvents();
      setAllEvents(allEvtRes.data || []);

      const bkRes = await getBookings();
      setBookings(bkRes.data || []);

      const pmRes = await getPayments();
      setPayments(pmRes.data || []);

      const logsRes = await getEmailLogs();
      setEmailLogs(logsRes.data || []);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
      setFeedback({ type: "danger", message: "Failed to load dashboard data. Please refresh." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApproveOrganizer = (id) => {
    setFeedback(null);
    setActingId(id);
    approveOrganizer(id)
      .then(() => {
        setFeedback({ type: "success", message: "Organizer request approved successfully! Confirmation email sent." });
        loadDashboardData();
      })
      .catch((err) => {
        console.error("Error approving organizer:", err);
        setFeedback({ type: "danger", message: "Failed to approve organizer request." });
      })
      .finally(() => setActingId(null));
  };

  const handleRejectOrganizer = (id) => {
    setFeedback(null);
    setActingId(id);
    rejectOrganizer(id)
      .then(() => {
        setFeedback({ type: "success", message: "Organizer request rejected." });
        loadDashboardData();
      })
      .catch((err) => {
        console.error("Error rejecting organizer:", err);
        setFeedback({ type: "danger", message: "Failed to reject organizer request." });
      })
      .finally(() => setActingId(null));
  };

  const handleApproveEvent = (id) => {
    setFeedback(null);
    setActingId(id);
    approveEvent(id)
      .then(() => {
        setFeedback({ type: "success", message: "Event approved & published live! Success notification email sent." });
        loadDashboardData();
      })
      .catch((err) => {
        console.error("Error approving event:", err);
        setFeedback({ type: "danger", message: "Failed to approve event request." });
      })
      .finally(() => setActingId(null));
  };

  const handleRejectEvent = (id) => {
    setFeedback(null);
    setActingId(id);
    rejectEvent(id)
      .then(() => {
        setFeedback({ type: "success", message: "Event request rejected. Rejection notification email sent." });
        loadDashboardData();
      })
      .catch((err) => {
        console.error("Error rejecting event:", err);
        setFeedback({ type: "danger", message: "Failed to reject event request." });
      })
      .finally(() => setActingId(null));
  };

  const handleTriggerEventStatus = (id, newStatus) => {
    setFeedback(null);
    setActingId(id);
    updateEventStatus(id, newStatus)
      .then(() => {
        setFeedback({ type: "success", message: `Event status updated to ${newStatus} and attendee notifications sent!` });
        loadDashboardData();
      })
      .catch((err) => {
        console.error("Error updating event status:", err);
        setFeedback({ type: "danger", message: `Failed to update event status to ${newStatus}.` });
      })
      .finally(() => setActingId(null));
  };

  return (
    <>
      <Sidebar />

      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Admin Header Banner */}
        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-info text-dark px-3 py-2 fw-bold mb-2">
                ⚡ Festora Administration Operations
              </span>
              <h2 className="fw-bold mb-1">System Control & Operations Center</h2>
              <p className="mb-0 text-white-50 small">
                Full governance of organizers, events, bookings, payments, and automated email audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* Inline Feedback Banner */}
        {feedback && (
          <div className={`alert alert-${feedback.type} alert-dismissible fade show mx-3 rounded-4 shadow-sm mb-4`} role="alert">
            {feedback.message}
            <button type="button" className="btn-close" onClick={() => setFeedback(null)}></button>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="row g-3 px-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Active Attendees</h6>
              <h2 className="fw-bold mb-0 text-primary">{stats.users}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Approved Organizers</h6>
              <h2 className="fw-bold mb-0 text-success">{stats.organizers}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Total Platform Events</h6>
              <h2 className="fw-bold mb-0 text-info">{stats.eventsCount}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Gross Platform Revenue</h6>
              <h2 className="fw-bold mb-0 text-warning">₹{stats.revenue}</h2>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-3 mb-4">
          <div className="btn-group w-100 shadow-sm rounded-4 overflow-hidden bg-white p-1 flex-wrap">
            <button
              className={`btn py-3 fw-bold ${activeTab === "ORGANIZER_REQUESTS" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("ORGANIZER_REQUESTS")}
            >
              Organizers ({organizerRequests.length})
            </button>
            <button
              className={`btn py-3 fw-bold ${activeTab === "EVENT_REQUESTS" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("EVENT_REQUESTS")}
            >
              Pending Events ({pendingEvents.length})
            </button>
            <button
              className={`btn py-3 fw-bold ${activeTab === "EVENT_ACTIONS" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("EVENT_ACTIONS")}
            >
              Lifecycle Triggers
            </button>
            <button
              className={`btn py-3 fw-bold ${activeTab === "BOOKING_HISTORY" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("BOOKING_HISTORY")}
            >
              <FiBookmark className="me-1" /> Booking History ({bookings.length})
            </button>
            <button
              className={`btn py-3 fw-bold ${activeTab === "PAYMENT_HISTORY" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("PAYMENT_HISTORY")}
            >
              <FiCreditCard className="me-1" /> Payment History ({payments.length})
            </button>
            <button
              className={`btn py-3 fw-bold ${activeTab === "EMAIL_LOGS" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("EMAIL_LOGS")}
            >
              <FiMail className="me-1" /> Email Logs ({emailLogs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Organizer Requests */}
        {activeTab === "ORGANIZER_REQUESTS" && (
          <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              Organizer Approval Requests
              {organizerRequests.length > 0 && (
                <span className="badge bg-warning text-dark fs-6">{organizerRequests.length} Pending</span>
              )}
            </h4>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Requested At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">Loading requests...</td>
                    </tr>
                  ) : organizerRequests.length > 0 ? (
                    organizerRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="fw-bold">{req.name}</td>
                        <td>{req.email}</td>
                        <td>{req.phone || "N/A"}</td>
                        <td>{req.createdAt ? new Date(req.createdAt).toLocaleString() : "Recently"}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2 fw-bold"
                            disabled={actingId === req.id}
                            onClick={() => handleApproveOrganizer(req.id)}
                          >
                            <FiCheckCircle /> Approve Request
                          </button>
                          <button
                            className="btn btn-danger btn-sm fw-bold"
                            disabled={actingId === req.id}
                            onClick={() => handleRejectOrganizer(req.id)}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        ✨ No pending organizer requests requiring approval.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Event Requests */}
        {activeTab === "EVENT_REQUESTS" && (
          <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              New Event Approval Requests
              {pendingEvents.length > 0 && (
                <span className="badge bg-warning text-dark fs-6">{pendingEvents.length} Pending</span>
              )}
            </h4>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Event Title</th>
                    <th>Organizer</th>
                    <th>Venue</th>
                    <th>Start Date</th>
                    <th>Ticket Price</th>
                    <th>Total Seats</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.length > 0 ? (
                    pendingEvents.map((evt) => (
                      <tr key={evt.eventId}>
                        <td className="fw-bold text-primary">{evt.title}</td>
                        <td>{evt.organizer?.user?.name || "Organizer"}</td>
                        <td>{evt.venue?.venueName || "Venue TBD"}</td>
                        <td>{evt.eventStartDatetime ? new Date(evt.eventStartDatetime).toLocaleString() : "N/A"}</td>
                        <td className="fw-bold text-success">₹{evt.price}</td>
                        <td>{evt.totalSeats}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2 fw-bold"
                            disabled={actingId === evt.eventId}
                            onClick={() => handleApproveEvent(evt.eventId)}
                          >
                            <FiCheckCircle /> Approve & Publish
                          </button>
                          <button
                            className="btn btn-danger btn-sm fw-bold"
                            disabled={actingId === evt.eventId}
                            onClick={() => handleRejectEvent(evt.eventId)}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        ✨ No pending event requests requiring approval.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Event Lifecycle Controls */}
        {activeTab === "EVENT_ACTIONS" && (
          <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
            <h4 className="fw-bold mb-3">Event Status & Lifecycle Email Triggers</h4>
            <p className="text-muted small mb-4">
              Update event status to trigger automated <strong>Event Started</strong> or <strong>Event Completed</strong> email notifications to all booked attendees.
            </p>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Event</th>
                    <th>Current Status</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>Trigger Lifecycle Email Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allEvents.map((evt) => (
                    <tr key={evt.eventId}>
                      <td className="fw-bold">{evt.title}</td>
                      <td>
                        <span className={`badge ${evt.status === "ACTIVE" ? "bg-success" : evt.status === "STARTED" ? "bg-primary" : evt.status === "COMPLETED" ? "bg-secondary" : "bg-warning text-dark"}`}>
                          {evt.status}
                        </span>
                      </td>
                      <td>{evt.venue?.venueName || "N/A"}</td>
                      <td className="small">{evt.eventStartDatetime ? new Date(evt.eventStartDatetime).toLocaleString() : "N/A"}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2 fw-bold"
                          disabled={actingId === evt.eventId || evt.status === "STARTED"}
                          onClick={() => handleTriggerEventStatus(evt.eventId, "STARTED")}
                        >
                          <FiPlay /> Mark Started & Email
                        </button>

                        <button
                          className="btn btn-secondary btn-sm fw-bold"
                          disabled={actingId === evt.eventId || evt.status === "COMPLETED"}
                          onClick={() => handleTriggerEventStatus(evt.eventId, "COMPLETED")}
                        >
                          <FiCheck /> Mark Completed & Email
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: All Platform Bookings History */}
        {activeTab === "BOOKING_HISTORY" && (
          <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiBookmark className="text-primary" /> All Platform Booking History ({bookings.length})
            </h4>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Booking ID</th>
                    <th>Attendee</th>
                    <th>Event Title</th>
                    <th>Seats</th>
                    <th>Qty</th>
                    <th>Total Paid</th>
                    <th>Booking Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b.bookingId}>
                        <td className="fw-bold">#{b.bookingId}</td>
                        <td>
                          <div className="fw-semibold">{b.user?.name || "User"}</div>
                          <div className="text-muted small">{b.user?.email}</div>
                        </td>
                        <td className="fw-bold text-primary">{b.event?.title}</td>
                        <td>
                          <span className="badge bg-dark">{b.seatNumbers || "General"}</span>
                        </td>
                        <td>{b.quantity}</td>
                        <td className="fw-bold text-success">₹{b.totalAmount}</td>
                        <td className="small">{b.bookingDate ? new Date(b.bookingDate).toLocaleString() : "N/A"}</td>
                        <td>
                          <span className={`badge ${b.status === "CONFIRMED" ? "bg-success" : "bg-warning text-dark"}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No bookings made on the platform yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: All Platform Payment History */}
        {activeTab === "PAYMENT_HISTORY" && (
          <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiCreditCard className="text-success" /> All Platform Payment History ({payments.length})
            </h4>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Txn ID</th>
                    <th>Booking ID</th>
                    <th>Attendee</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.paymentId}>
                        <td className="fw-bold text-primary">{p.transactionId}</td>
                        <td>#{p.booking?.bookingId}</td>
                        <td>{p.booking?.user?.name || "Attendee"}</td>
                        <td className="fw-bold text-success">₹{p.amount}</td>
                        <td><span className="badge bg-secondary">{p.paymentMode || "CARD"}</span></td>
                        <td className="small">{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : "N/A"}</td>
                        <td>
                          <span className={`badge ${p.status === "SUCCESS" ? "bg-success" : "bg-danger"}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Email Logs */}
        {activeTab === "EMAIL_LOGS" && (
          <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiMail className="text-primary" /> Email Notification Audit Logs
              </h4>
              <button className="btn btn-outline-primary btn-sm" onClick={loadDashboardData}>
                🔄 Refresh Logs
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Recipient</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Sent Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.length > 0 ? (
                    emailLogs.map((log) => (
                      <tr key={log.logId}>
                        <td className="fw-bold">{log.recipient}</td>
                        <td>
                          <span className="badge bg-dark px-3 py-2">{log.notificationType}</span>
                        </td>
                        <td className="small">{log.subject}</td>
                        <td>
                          <span className={`badge ${log.status === "SENT" ? "bg-success" : "bg-info text-dark"}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {log.sentAt ? new Date(log.sentAt).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No email logs generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;