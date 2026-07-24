import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";

import { getMyEvents, deleteEvent } from "../../services/eventService";

function MyEvents() {
  const [events, setEvents] = useState([]);

 
  const loadEvents = async () => {
    try {
      const res = await getMyEvents();
      setEvents(res.data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadEvents();
    };
    fetchData();
  }, []);

  const remove = async (id) => {
    if (window.confirm("Delete this event?")) {
      try {
        await deleteEvent(id);
        loadEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center">
            <h3>My Events</h3>
            <Link className="btn btn-primary" to="/organizer/events/create">
              Create Event
            </Link>
          </div>

          <table className="table mt-4">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Venue</th>
                <th>Price</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Events Found
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.eventId}>
                    <td>{event.title}</td>
                    <td>{event.category?.categoryName}</td>
                    <td>{event.venue?.venueName}</td>
                    <td>₹{event.price}</td>
                    <td>
                      {event.availableSeats}/{event.totalSeats}
                    </td>
                    <td>{event.status}</td>
                    <td>
                      <Link
                        to={`/organizer/events/edit/${event.eventId}`}
                        className="btn btn-warning btn-sm me-2"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(event.eventId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MyEvents;
