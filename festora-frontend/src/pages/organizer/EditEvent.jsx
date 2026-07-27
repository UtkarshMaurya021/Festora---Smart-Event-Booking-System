import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getEvent } from "../../services/eventService";
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
useEffect(() => {
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

      const [c, v] = await Promise.all([
        api.get("/categories"),
        api.get("/venues")
      ]);
      setCategories(c.data);
      setVenues(v.data);
    } catch (error) {
      console.error("Error loading event:", error);
    }
  };

  
    load();
  }, [id]);

  const save = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Axios configuration matching your Step 102 specifications
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirects to dashboard and passes the success message state
      navigate("/organizer/dashboard", {
        state: { message: "Event updated successfully." }
      });
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
            placeholder="Event Title"
          />
          <textarea 
            className="form-control mb-3" 
            rows="4" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Event Description"
          />
          <input 
            type="number" 
            className="form-control mb-3" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="Price"
          />
          <input 
            type="number" 
            className="form-control mb-3" 
            value={totalSeats} 
            onChange={(e) => setTotalSeats(e.target.value)} 
            placeholder="Total Seats"
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
          <button className="btn btn-success" onClick={save}> 
            Update Event 
          </button>
        </div>
      </div>
    </>
  );
}

export default EditEvent;
