import { Link } from "react-router-dom";

function Sidebar() {
  const role = localStorage.getItem("role");

  return (
    <div className="sidebar">
      <h3 className="text-center py-4">Festora</h3>

      <hr className="text-light" />

      {role === "ROLE_USER" && (
        <>
          <Link to="/user/dashboard">Dashboard</Link>

          <Link>Events</Link>

          <Link>My Bookings</Link>

          <Link>Tickets</Link>

          <Link>Profile</Link>
        </>
      )}

      {role === "ROLE_ORGANIZER" && (
        <>
          <Link to="/organizer/dashboard">Dashboard</Link>

          <Link to="/organizer/dashboard">Dashboard</Link>

          <Link to="/organizer/events">My Events</Link>

          <Link to="/organizer/events/create">Create Event</Link>
          <Link to="/organizer/dashboard">Dashboard</Link>

          <Link to="/organizer/events">My Events</Link>

          <Link to="/organizer/events/create">Create Event</Link>
        </>
      )}

      {role === "ROLE_ADMIN" && (
        <>
          <Link to="/admin/dashboard">Dashboard</Link>

          <Link>Users</Link>

          <Link>Organizers</Link>

          <Link>Events</Link>

          <Link>Categories</Link>

          <Link>Venues</Link>

          <Link>Bookings</Link>

          <Link>Payments</Link>
        </>
      )}

      <button
        className="btn btn-danger w-75 mt-5 ms-4"
        onClick={() => {
          localStorage.clear();

          window.location = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
