import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import ImageDropzone from "../../components/ImageDropzone";
import axios from "axios";

function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [imageUrls, setImageUrls] = useState([""]);
  const navigate = useNavigate();

  const unwrapList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [c, v] = await Promise.all([
          axios.get("http://localhost:8080/api/categories", { headers }),
          axios.get("http://localhost:8080/api/venues", { headers }),
        ]);

        setCategories(unwrapList(c.data));
        setVenues(unwrapList(v.data));
      } catch (error) {
        console.error("Error loading categories or venues:", error);
      }
    };

    loadData();
  }, []);

  const handleImageUrlChange = (index, value) => {
    setImageUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  };

  const addImageUrl = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const removeImageUrl = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUploaded = (url) => {
    setImageUrls((prev) => {
      const emptyIndex = prev.findIndex((u) => u.trim() === "");
      if (emptyIndex !== -1) {
        return prev.map((u, i) => (i === emptyIndex ? url : u));
      }
      return [...prev, url];
    });
  };

  const save = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!start || !end) {
      setErrorMsg("Start and end date/time are required.");
      return;
    }
    if (!categoryId || !venueId) {
      setErrorMsg("Please select a Category and a Venue before saving.");
      return;
    }

    const filteredUrls = imageUrls.map((u) => u.trim()).filter((u) => u.length > 0);

    const payload = {
      title,
      description,
      price: Number(price) || 0,
      totalSeats: Number(totalSeats) || 100,
      eventStartDatetime: start,
      eventEndDatetime: end,
      categoryId: Number(categoryId),
      venueId: Number(venueId),
      imageUrls: filteredUrls,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8080/api/organizer/events",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMsg("🎉 Event created successfully! Status: PENDING (Awaiting Admin Approval). Email notifications sent!");

      setTimeout(() => {
        navigate("/organizer/events", {
          state: { message: "Event created successfully and is awaiting Admin approval." },
        });
      }, 1500);
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Check all required fields and try again.";
      setErrorMsg(`Failed to create event: ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div className="card p-4 shadow-sm border-0 rounded-4 m-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <div>
              <h3 className="fw-bold mb-1">Create New Event</h3>
              <p className="text-muted small mb-0">
                Created events will be marked as <strong className="text-warning">PENDING</strong> until reviewed and approved by the Admin.
              </p>
            </div>
            <span className="badge bg-warning text-dark px-3 py-2 fw-semibold">
              Requires Admin Approval
            </span>
          </div>

          {errorMsg && <div className="alert alert-danger rounded-3 mb-3">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success rounded-3 mb-3">{successMsg}</div>}

          <div className="mb-3">
            <label className="form-label fw-bold">Event Title</label>
            <input
              className="form-control"
              placeholder="e.g. National Music Fest 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Detailed description of the event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Ticket Base Price (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Total Capacity / Seats</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 200"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Start Date & Time</label>
              <input
                type="datetime-local"
                className="form-control"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">End Date & Time</label>
              <input
                type="datetime-local"
                className="form-control"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => {
                  const id = c.categoryId ?? c.category_id;
                  const name = c.categoryName ?? c.category_name ?? "Category";
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Venue</label>
              <select
                className="form-select"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
              >
                <option value="">Select Venue</option>
                {venues.map((v) => {
                  const id = v.venueId ?? v.venue_id;
                  const name = v.venueName ?? v.venue_name ?? "Venue";
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Event Banner / Images</label>
            <ImageDropzone onUploaded={handleImageUploaded} />

            <div className="mt-3">
              <label className="form-label fw-bold small text-muted">Or paste image web URLs:</label>
              {imageUrls.map((url, index) => (
                <div key={index} className="d-flex gap-2 mb-2 align-items-center">
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  />
                  {url.startsWith("http") && (
                    <img
                      src={url}
                      alt="preview"
                      style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6, border: "1px solid #cbd5e1" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeImageUrl(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={addImageUrl}
              >
                + Add another URL
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg fw-bold px-5 py-3 w-100" onClick={save} disabled={loading}>
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateEvent;
