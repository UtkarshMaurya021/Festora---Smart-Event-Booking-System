import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import api from "../../services/api";
import { FiMapPin, FiSearch, FiCheckCircle } from "react-icons/fi";

export default function OrganizerVenues() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadVenues = () => {
    setLoading(true);
    api.get("/venues")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setVenues(list);
        setFilteredVenues(list);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load venues", err);
        setError("Could not fetch platform venues. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVenues(venues);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredVenues(
        venues.filter(
          (v) =>
            (v.venueName && v.venueName.toLowerCase().includes(q)) ||
            (v.address && v.address.toLowerCase().includes(q)) ||
            (v.city && v.city.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, venues]);

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Hero Header Banner */}
        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                📍 Platform Venue Directory
              </span>
              <h2 className="fw-bold mb-1">Available Event Hosting Venues</h2>
              <p className="mb-0 text-white-50 small">
                Explore registered convention halls, auditoriums, and stadiums with total capacity and 5-tier seat breakdowns.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-3 mb-5">
          {/* Search bar */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiMapPin className="text-primary" /> Registered Hosting Locations ({filteredVenues.length})
              </h5>

              <div className="input-group" style={{ maxWidth: 320 }}>
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search venue name, city, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger rounded-4 mb-4">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading hosting venues...</span>
              </div>
            </div>
          ) : filteredVenues.length > 0 ? (
            <div className="row g-4">
              {filteredVenues.map((v) => {
                const cap = v.capacity || 500;
                return (
                  <div className="col-md-6 col-lg-4" key={v.venueId}>
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-bold mb-0 text-primary">{v.venueName}</h5>
                          <span className="badge bg-success-subtle text-success px-3 py-2 fw-bold">
                            #{v.venueId}
                          </span>
                        </div>

                        <p className="text-muted small mb-3">
                          📍 {v.address}, {v.city || "N/A"}, {v.state || "N/A"} {v.postalCode || ""}
                        </p>

                        <div className="p-3 bg-light rounded-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small fw-bold">TOTAL SEATING CAPACITY</span>
                            <span className="fw-bold text-dark fs-5">{cap.toLocaleString()} Seats</span>
                          </div>

                          <hr className="my-2" />

                          <div className="small text-muted">
                            <div className="d-flex justify-content-between py-1">
                              <span>⭐ VVIP Tier (10%)</span>
                              <strong className="text-dark">{Math.round(cap * 0.1)} seats</strong>
                            </div>
                            <div className="d-flex justify-content-between py-1">
                              <span>🌟 VIP Tier (15%)</span>
                              <strong className="text-dark">{Math.round(cap * 0.15)} seats</strong>
                            </div>
                            <div className="d-flex justify-content-between py-1">
                              <span>💎 Premium Tier (25%)</span>
                              <strong className="text-dark">{Math.round(cap * 0.25)} seats</strong>
                            </div>
                            <div className="d-flex justify-content-between py-1">
                              <span>💼 Executive Tier (25%)</span>
                              <strong className="text-dark">{Math.round(cap * 0.25)} seats</strong>
                            </div>
                            <div className="d-flex justify-content-between py-1">
                              <span>🎟️ Standard Tier (25%)</span>
                              <strong className="text-dark">{Math.round(cap * 0.25)} seats</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-1 text-success small fw-semibold">
                        <FiCheckCircle /> Verified Venue Available for Event Hosting
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5 card border-0 shadow-sm rounded-4 bg-white">
              <h5 className="fw-bold">No Venues Found</h5>
              <p className="text-muted">No hosting venues matched your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
