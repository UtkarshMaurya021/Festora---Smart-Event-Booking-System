import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
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

  const navigate = useNavigate();

  // Helper: unwraps either a bare array or a Spring Page object ({ content: [...] })
  const unwrapList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [c, v] = await Promise.all([
          axios.get("http://localhost:8080/api/categories", { headers }),
          axios.get("http://localhost:8080/api/venues", { headers }),
        ]);

        console.log("Categories API Data Received:", c.data);
        console.log("Venues API Data Received:", v.data);

        setCategories(unwrapList(c.data));
        setVenues(unwrapList(v.data));
      } catch (error) {
        console.error("Error loading structural dropdown data:", error.response?.data || error);
      }
    };

    loadData();
  }, []);

  const save = async () => {
    if (!title.trim()) return alert("Title is required.");
    if (!start || !end) return alert("Start and end date/time are required.");
    if (!categoryId || !venueId) {
      alert("Please select a Category and a Venue before saving.");
      return;
    }
    const payload = {
      title,
      description,
      price: Number(price),
      totalSeats: Number(totalSeats),
      eventStartDatetime: start,
      eventEndDatetime: end,
      categoryId: Number(categoryId),
      venueId: Number(venueId),
    };

    console.log("Submitting Create Event Payload:", payload);

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

      navigate("/organizer/dashboard", {
        state: { message: "Event created successfully." },
      });
    } catch (error) {
      // Log the real backend error instead of a generic alert -
      // this is what you need to read to fix the next mismatch, if any.
      console.error("Error response received during creation:", error.response?.data || error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Check browser console for details.";
      alert(`Failed to create event: ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="card p-4 shadow-sm m-4">
          <h3 className="mb-4">Create Event</h3>

          <label className="form-label fw-bold">Event Title</label>
          <input
            className="form-control mb-3"
            placeholder="Enter Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="form-label fw-bold">Description</label>
          <textarea
            className="form-control mb-3"
            placeholder="Enter Description..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="form-label fw-bold">Ticket Price (₹)</label>
          <input
            type="number"
            className="form-control mb-3"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <label className="form-label fw-bold">Total Available Seats</label>
          <input
            type="number"
            className="form-control mb-3"
            placeholder="100"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
          />

          <label className="form-label fw-bold">Start Date & Time</label>
          <input
            type="datetime-local"
            className="form-control mb-3"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          <label className="form-label fw-bold">End Date & Time</label>
          <input
            type="datetime-local"
            className="form-control mb-3"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <label className="form-label fw-bold">Category</label>
          <select
            className="form-select mb-3"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => {
              const id = c.categoryId ?? c.category_id;
              const name = c.categoryName ?? c.category_name ?? "Unknown";
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>

          <label className="form-label fw-bold">Venue</label>
          <select
            className="form-select mb-3"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
          >
            <option value="">Select Venue</option>
            {venues.map((v) => {
              const id = v.venueId ?? v.venue_id;
              const name = v.venueName ?? v.venue_name ?? "Unknown";
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>

          <button className="btn btn-primary mt-2" onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Create Event"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateEvent;
