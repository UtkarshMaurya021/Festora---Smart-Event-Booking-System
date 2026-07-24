import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";

import { getEvent, updateEvent } from "../../services/eventService";
import api from "../../services/api";

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

  const load = async () => {
    try {
      const e = await getEvent(id);

      setTitle(e.data.title);
      setDescription(e.data.description);
      setPrice(e.data.price);
      setTotalSeats(e.data.totalSeats);
      setStart(e.data.eventStartDatetime.slice(0, 16));
      setEnd(e.data.eventEndDatetime.slice(0, 16));
      setCategoryId(e.data.category?.categoryId || "");
      setVenueId(e.data.venue?.venueId || "");

      const [c, v] = await Promise.all([api.get("/categories"), api.get("/venues")]);
      setCategories(c.data);
      setVenues(v.data);
    } catch (error) {
      console.error("Error loading event:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await load();
    };
    fetchData();
  }, [id]);

  const save = async () => {
    try {
      await updateEvent(id, {
        title,
        description,
        price,
        totalSeats,
        eventStartDatetime: start,
        eventEndDatetime: end,
        categoryId,
        venueId,
      });

      alert("Event Updated");
      navigate("/organizer/events");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="card p-4">
          <h3>Edit Event</h3>

          <input
            className="form-control mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            className="form-control mb-3"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="number"
            className="form-control mb-3"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
          />

          <input
            type="datetime-local"
            className="form-control mb-3"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          <input
            type="datetime-local"
            className="form-control mb-3"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <select
            className="form-select mb-3"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-4"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
          >
            {venues.map((v) => (
              <option key={v.venueId} value={v.venueId}>
                {v.venueName}
              </option>
            ))}
          </select>

          <button className="btn btn-success" onClick={save}>
            Update Event
          </button>
        </div>
      </div>
    </>
  );
}

export default EditEvent;
