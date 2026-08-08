import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { FaUserCircle } from "react-icons/fa";
import { getUserProfile } from "../services/userService";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
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

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

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
            <h2 className="fw-bold mb-2">Your Profile 👤</h2>

            <p className="mb-0 opacity-75">
              Account details on file with Festora.
            </p>
          </div>

          <div className="card border-0 shadow rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column flex-md-row align-items-center gap-4 mb-4">
                <FaUserCircle size={90} className="text-primary" />

                <div className="text-center text-md-start">
                  <h3 className="fw-bold mb-1">{profile?.name || "N/A"}</h3>
                  <span className="badge bg-success-subtle text-success">
                    {profile?.status || "N/A"}
                  </span>
                </div>
              </div>

              <hr className="mb-4" />

              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Email</h6>
                  <p className="fw-semibold">{profile?.email || "N/A"}</p>
                </div>

                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Phone</h6>
                  <p className="fw-semibold">{profile?.phone || "N/A"}</p>
                </div>

                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Role</h6>
                  <p className="fw-semibold">{profile?.role || "N/A"}</p>
                </div>

                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Member Since</h6>
                  <p className="fw-semibold">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
