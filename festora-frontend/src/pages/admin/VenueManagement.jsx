import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import {
  getVenues,
  createVenue,
  deleteVenue,
} from "../../services/adminService";
import { FiMapPin, FiPlusCircle, FiTrash2, FiSearch } from "react-icons/fi";

export default function VenueManagement() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadVenues = () => {
    setLoading(true);
    getVenues()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        if (Array.isArray(rawData)) {
          const sortedData = [...rawData].sort((a, b) => (a.venueId || 0) - (b.venueId || 0));
          setVenues(sortedData);
          setFilteredVenues(sortedData);
          setError("");
        }
      })
      .catch((err) => {
        console.error("Failed to load venues", err);
        setError("Could not load venues. Please try again.");
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
        venues.filter((v) => {
          const nameMatch = (v.venueName || "").toLowerCase().includes(q);
          const addrMatch = (v.address || "").toLowerCase().includes(q);
          const cityMatch = (v.city || "").toLowerCase().includes(q);
          return nameMatch || addrMatch || cityMatch;
        })
      );
    }
  }, [searchQuery, venues]);

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!venueName.trim() || !address.trim() || !capacity) {
      setError("Venue Name, Street Address, and Seating Capacity are required.");
      return;
    }

    const venueData = {
      venueName: venueName,
      address: address,
      city: city,
      state: state,
      postalCode: postalCode,
      capacity: parseInt(capacity),
    };

    setSubmitting(true);
    createVenue(venueData)
      .then(() => {
        setVenueName("");
        setAddress("");
        setCity("");
        setState("");
        setPostalCode("");
        setCapacity("");
        setSuccessMsg("Hosting venue registered successfully!");
        loadVenues();
      })
      .catch((err) => {
        console.error("Error creating venue:", err);
        setError(err.response?.data?.message || "Failed to create venue.");
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!id) return;
    setError("");
    setSuccessMsg("");

    deleteVenue(id)
      .then(() => {
        setSuccessMsg(`Venue #${id} deleted successfully.`);
        loadVenues();
      })
      .catch((err) => {
        console.error("Error deleting venue:", err);
        setError(err.response?.data?.message || "Failed to delete venue.");
      });
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        {/* Hero Header Banner */}
        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                📍 Location & Infrastructure
              </span>
              <h2 className="fw-bold mb-1">Hosting Venues Directory</h2>
              <p className="mb-0 text-white-50 small">
                Manage physical event locations, seating capacities, and address records.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-3 mb-5">
          {error && <div className="alert alert-danger rounded-4">{error}</div>}
          {successMsg && <div className="alert alert-success rounded-4">{successMsg}</div>}

          {/* Add Venue Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiPlusCircle className="text-warning" /> Add New Hosting Venue
            </h5>
            <form onSubmit={handleCreate} className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Venue Name *</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g., Grand Convention Center"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Seating Capacity *</label>
                <input
                  type="number"
                  className="form-control bg-light"
                  placeholder="e.g., 1000"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Street Address *</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g., 123 Event Boulevard"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">City</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">State</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Postal Code</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <div className="col-12 text-end mt-3">
                <button
                  type="submit"
                  className="btn btn-warning px-4 rounded-3 fw-bold text-dark"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Venue Record"}
                </button>
              </div>
            </form>
          </div>

          {/* Venues Table View Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
              <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiMapPin className="text-warning" /> Registered Venues ({filteredVenues.length})
              </h4>

              <div className="input-group" style={{ maxWidth: 280 }}>
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search venue, city, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Venue Name</th>
                    <th>Location / Full Address</th>
                    <th>Capacity</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div className="spinner-border text-warning" role="status">
                          <span className="visually-hidden">Loading venues...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVenues.length > 0 ? (
                    filteredVenues.map((v) => {
                      const displayId = v.venueId;
                      const displayName = v.venueName || <em className="text-muted">No Name Provided</em>;
                      const displayPostal = v.postalCode ? ` ${v.postalCode}` : "";

                      return (
                        <tr key={displayId}>
                          <td className="fw-bold text-warning">#{displayId}</td>
                          <td>
                            <strong className="fs-6">{displayName}</strong>
                          </td>
                          <td className="small text-muted">
                            {v.address}, {v.city || "N/A"}, {v.state || "N/A"}{displayPostal}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border fw-bold">
                              {v.capacity ? v.capacity.toLocaleString() : 0} seats
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDelete(displayId)}
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            >
                              <FiTrash2 className="me-1" /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No registered venues found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
