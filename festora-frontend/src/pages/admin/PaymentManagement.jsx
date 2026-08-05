import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getPayments } from "../../services/adminService";
import { FiCreditCard, FiSearch, FiDollarSign } from "react-icons/fi";

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadPayments = () => {
    setLoading(true);
    getPayments()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setPayments(list);
        setFilteredPayments(list);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load payments", err);
        setError("Could not fetch platform payment transactions. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    let result = [...payments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
          (p.paymentId && String(p.paymentId).includes(q)) ||
          (p.booking?.bookingId && String(p.booking.bookingId).includes(q)) ||
          (p.booking?.user?.email && p.booking.user.email.toLowerCase().includes(q)) ||
          (p.paymentMode && p.paymentMode.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }

    setFilteredPayments(result);
  }, [searchQuery, statusFilter, payments]);

  const totalSuccessAmount = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successCount = payments.filter((p) => p.status === "SUCCESS").length;

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Header Banner */}
        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                💳 Financial Audit Control
              </span>
              <h2 className="fw-bold mb-1">Payment Transactions & Revenue Gateway</h2>
              <p className="mb-0 text-white-50 small">
                Audit every financial transaction, payment mode, and revenue settlement across Festora.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="row g-3 px-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Total Gross Revenue</h6>
              <h2 className="fw-bold mb-0 text-success">₹{totalSuccessAmount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Successful Transactions</h6>
              <h2 className="fw-bold mb-0 text-primary">{successCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <h6 className="text-muted small fw-bold">Total Payment Records</h6>
              <h2 className="fw-bold mb-0 text-dark">{payments.length}</h2>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="card border-0 shadow-sm rounded-4 mx-3 mb-5 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FiDollarSign className="text-success" /> Payment Audit Ledger ({filteredPayments.length})
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
                  placeholder="Search Txn ID, email, mode..."
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
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-danger rounded-4">{error}</div>}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>Booking ID</th>
                  <th>Attendee</th>
                  <th>Event Title</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.paymentId}>
                      <td className="fw-bold text-dark">{p.transactionId || `TXN-${p.paymentId}`}</td>
                      <td className="fw-bold text-primary">#{p.booking?.bookingId || "N/A"}</td>
                      <td>
                        <div className="fw-semibold">{p.booking?.user?.name || "Attendee"}</div>
                        <div className="text-muted small">{p.booking?.user?.email}</div>
                      </td>
                      <td className="fw-bold">{p.booking?.event?.title || "N/A"}</td>
                      <td className="fw-bold text-success fs-6">₹{p.amount}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          <FiCreditCard className="me-1" /> {p.paymentMode || p.paymentMethod || "ONLINE"}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === "SUCCESS"
                              ? "bg-success"
                              : p.status === "PENDING"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No matching payment records found.
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
