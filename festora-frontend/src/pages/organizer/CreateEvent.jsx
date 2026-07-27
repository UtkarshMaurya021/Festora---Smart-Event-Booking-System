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

  const navigate = useNavigate();

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
    try {
      const token = localStorage.getItem("token");
      
      // Direct axios POST request handling authorization as per Step 102
      await axios.post(
        "http://localhost:8080/api/organizer/events",
        {
          title,
          description,
          price,
          totalSeats,
          eventStartDatetime: start,
          eventEndDatetime: end,
          categoryId,
          venueId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Smooth state redirection omitting default browser alert popups
      navigate("/organizer/dashboard", {
        state: { message: "Event created successfully." },
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            placeholder="Description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Seats"
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
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-3"
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

          <button className="btn btn-primary" onClick={save}>
            Create Event
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateEvent;
