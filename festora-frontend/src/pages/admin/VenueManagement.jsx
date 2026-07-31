import { useEffect, useState } from "react";
import Navbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import {
  getVenues,
  createVenue,
  deleteVenue,
} from "../../services/adminService";

export default function VenueManagement() {
  const [venues, setVenues] = useState([]);
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [capacity, setCapacity] = useState("");

  const loadVenues = () => {
    getVenues()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        
        if (Array.isArray(rawData)) {
          // Sort venues numerically by venueId
          const sortedData = [...rawData].sort((a, b) => {
            return (a.venueId || 0) - (b.venueId || 0);
          });
          setVenues(sortedData);
        } else {
          console.error("API did not return an array. Received:", rawData);
        }
      })
      .catch((err) => console.error("Failed to load venues", err));
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!venueName.trim() || !address.trim() || !capacity) {
      return alert("Venue Name, Address, and Capacity are required fields.");
    }

    // FIXED: Form keys updated to camelCase to perfectly match backend requirements
    const venueData = {
      venueName: venueName,
      address: address,
      city: city,
      state: state,
      postalCode: postalCode,
      capacity: parseInt(capacity),
    };

    createVenue(venueData)
      .then(() => {
        setVenueName("");
        setAddress("");
        setCity("");
        setState("");
        setPostalCode("");
        setCapacity("");
        loadVenues();
      })
      .catch((err) => {
        console.error("Error creating venue:", err);
        alert("Error creating venue");
      });
  };

  const handleDelete = (id) => {
    if (!id) {
      alert("Error: Cannot delete venue without a valid ID.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this venue?")) {
      deleteVenue(id)
        .then(() => loadVenues())
        .catch((err) => {
          console.error("Error deleting venue:", err);
          alert("Error deleting venue");
        });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Venue Management</h2>

        {/* Create Venue Form */}
        <div className="card p-4 mb-5 shadow-sm">
          <h4>Add New Hosting Venue</h4>
          <form onSubmit={handleCreate} className="row g-3 mt-2">
            <div className="col-md-6">
              <label className="form-label">Venue Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Central Convention Hall"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Seating Capacity</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g., 500"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)} // FIXED: correctly targets setCity state setter loop
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div className="col-12 text-end mt-4">
              <button type="submit" className="btn btn-primary px-4">
                Save Venue
              </button>
            </div>
          </form>
        </div>

        {/* Venues Table View */}
        <div className="card p-4 shadow-sm">
          <h4>Registered Venues</h4>
          <div className="table-responsive mt-3">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Venue Name</th>
                  <th>Location / Address</th>
                  <th>Capacity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {venues.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      No registered venues found.
                    </td>
                  </tr>
                ) : (
                  venues.map((v) => {
                    const displayId = v.venueId;
                    const displayName = v.venueName || <em className="text-muted">No Name Provided</em>;
                    const displayPostal = v.postalCode ? ` ${v.postalCode}` : "";

                    return (
                      <tr key={displayId}>
                        <td>{displayId}</td>
                        <td>
                          <strong>{displayName}</strong>
                        </td>
                        <td>
                          {v.address}, {v.city || "N/A"}, {v.state || "N/A"}{displayPostal}
                        </td>
                        <td>
                          {v.capacity ? v.capacity.toLocaleString() : 0} seats
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(displayId)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
