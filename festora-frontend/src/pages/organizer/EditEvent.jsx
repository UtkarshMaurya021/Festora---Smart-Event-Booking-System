import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getEvent } from "../../services/eventService";
import api from "../../services/api";
import ImageDropzone from "../../components/ImageDropzone";
function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [imageUrls, setImageUrls] = useState([""]);

  useEffect(() => {
    const load = async () => {
      try {
        const e = await getEvent(id);
        const ev = e.data;

        setTitle(ev.title);
        setDescription(ev.description);
        setPrice(ev.price);
        setTotalSeats(ev.totalSeats);
        setStart(ev.eventStartDatetime.slice(0, 16));
        setEnd(ev.eventEndDatetime.slice(0, 16));
        setCategoryId(ev.category?.categoryId || "");
        setVenueId(ev.venue?.venueId || "");

        if (ev.images && ev.images.length > 0) {
          setImageUrls(ev.images.map((img) => img.imageUrl));
        } else {
          setImageUrls([""]);
        }

        const [c, v] = await Promise.all([
          api.get("/categories"),
          api.get("/venues"),
        ]);
        setCategories(c.data);
        setVenues(v.data);
      } catch (error) {
        console.error("Error loading event:", error);
      }
    };

    load();
  }, [id]);

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
    try {
      const token = localStorage.getItem("token");

      const filteredUrls = imageUrls
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      await api.put(
        `/organizer/events/${id}`,
        {
          title,
          description,
          price,
          totalSeats,
          eventStartDatetime: start,
          eventEndDatetime: end,
          categoryId,
          venueId,
          imageUrls: filteredUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/organizer/dashboard", {
        state: { message: "Event updated successfully." },
      });
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Check the console for details.");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main">
        <DashboardNavbar />
        <div className="card p-4 shadow-sm m-4">
          <h3 className="mb-4">Edit Event</h3>

          <label className="form-label fw-bold">Event Title</label>
          <input
            className="form-control mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
          />

          <label className="form-label fw-bold">Description</label>
          <textarea
            className="form-control mb-3"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event Description"
          />

          <label className="form-label fw-bold">Price</label>
          <input
            type="number"
            className="form-control mb-3"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />

          <label className="form-label fw-bold">Total Seats</label>
          <input
            type="number"
            className="form-control mb-3"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            placeholder="Total Seats"
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
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <label className="form-label fw-bold">Venue</label>
          <select
            className="form-select mb-4"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
          >
            <option value="">Select Venue</option>
            {venues.map((v) => (
              <option key={v.venueId} value={v.venueId}>
                {v.venueName}
              </option>
            ))}
          </select>

          <label className="form-label fw-bold">Event Images</label>
          <ImageDropzone onUploaded={handleImageUploaded} />

          <label className="form-label fw-bold mt-3">Or paste image URLs</label>
          {imageUrls.map((url, index) => (
            <div key={index} className="d-flex gap-2 mb-2 align-items-center">
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
              />

              {url.startsWith("http") && (
                <img
                  src={url}
                  alt="preview"
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #dee2e6",
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeImageUrl(index)}
                  style={{ flexShrink: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm mb-4"
            onClick={addImageUrl}
          >
            + Add another image URL
          </button>

          <button className="btn btn-success" onClick={save}>
            Update Event
          </button>
        </div>
      </div>
    </>
  );
}

export default EditEvent;
