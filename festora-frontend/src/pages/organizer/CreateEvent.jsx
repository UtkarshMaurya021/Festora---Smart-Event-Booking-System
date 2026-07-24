import { useState, useEffect } from "react";

import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";

import { createEvent } from "../../services/eventService";

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

        console.log("Categories response:", c.data);
        console.log("Venues response:", v.data);

        setCategories(c.data);
        setVenues(v.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const save = async () => {
    await createEvent({
      title,

      description,

      price,

      totalSeats,

      eventStartDatetime: start,

      eventEndDatetime: end,

      categoryId,

      venueId,
    });

    alert("Event Created");
  };

  return (
    <>
      <Sidebar />

      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="card p-4">
          <h3>Create Event</h3>

          <input
            className="form-control mb-3"
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            placeholder="Description"
            rows="4"
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Price"
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Seats"
            onChange={(e) => setTotalSeats(e.target.value)}
          />

          <input
            type="datetime-local"
            className="form-control mb-3"
            onChange={(e) => setStart(e.target.value)}
          />

          <input
            type="datetime-local"
            className="form-control mb-3"
            onChange={(e) => setEnd(e.target.value)}
          />

          <select
            className="form-select mb-3"
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option>Select Category</option>

            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-3"
            onChange={(e) => setVenueId(e.target.value)}
          >
            <option>Select Venue</option>

            {venues.map((v) => (
              <option key={v.venueId} value={v.venueId}>
                {v.venueName}
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={save}>
            Create Event
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateEvent;
