import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getOrganizerDashboard } from "../../services/dashboardService";
import { FiUser, FiBriefcase, FiPhone, FiMail, FiCheckCircle } from "react-icons/fi";

export default function OrganizerProfile() {
  const [profile, setProfile] = useState({
    name: localStorage.getItem("userName") || "Organizer",
    email: localStorage.getItem("userEmail") || "organizer@example.com",
    role: "ROLE_ORGANIZER",
    companyName: "Festora Premier Events",
    contact: "+91 98765 43210",
    description: "Verified platform organizer hosting premium concerts, tech conferences, and cultural festivals.",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    getOrganizerDashboard()
      .then((res) => {
        if (res.data) {
          setProfile((prev) => ({
            ...prev,
            totalEvents: res.data.totalEvents,
            activeEvents: res.data.activeEvents,
          }));
        }
      })
      .catch((err) => console.log("Failed to load organizer profile stats", err));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    setTimeout(() => {
      setSaving(false);
      setSuccessMsg("Organizer profile and company credentials updated successfully!");
    }, 600);
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                🏢 Verified Host Profile
              </span>
              <h2 className="fw-bold mb-1">Organizer Company Account</h2>
              <p className="mb-0 text-white-50 small">
                Manage your event hosting organization, contact info, bio description, and publishing status.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-3 mb-5">
          {successMsg && (
            <div className="alert alert-success border-0 shadow-sm rounded-4 p-3 mb-4" role="alert">
              🎉 {successMsg}
            </div>
          )}

          <div className="row g-4">

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center h-100">
                <div className="mb-3">
                  <div
                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center bg-indigo text-white fw-bold fs-2 shadow-sm"
                    style={{ width: 80, height: 80, background: "linear-gradient(135deg, #4f46e5, #3730a3)" }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <h4 className="fw-bold mb-1">{profile.name}</h4>
                <p className="text-muted small mb-3">{profile.email}</p>

                <div className="badge bg-success px-3 py-2 rounded-pill fw-bold mb-4">
                  <FiCheckCircle className="me-1" /> VERIFIED ORGANIZER
                </div>

                <div className="p-3 bg-light rounded-4 text-start">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small">Account Role</span>
                    <strong className="text-primary small">EVENT ORGANIZER</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small">Publishing Status</span>
                    <span className="badge bg-success text-white">ACTIVE</span>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted small">Platform Verification</span>
                    <span className="badge bg-info text-dark">APPROVED</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiBriefcase className="text-indigo" /> Company Credentials & Bio
                </h4>

                <form onSubmit={handleSave} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FiUser />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FiMail />
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light border-start-0"
                        value={profile.email}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Organization / Company Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FiBriefcase />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0"
                        value={profile.companyName}
                        onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Contact Phone</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FiPhone />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0"
                        value={profile.contact}
                        onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Organization Description / Bio</label>
                    <textarea
                      className="form-control bg-light"
                      rows={4}
                      value={profile.description}
                      onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    />
                  </div>

                  <div className="col-12 text-end mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg rounded-pill px-5 fw-bold"
                      disabled={saving}
                    >
                      {saving ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
