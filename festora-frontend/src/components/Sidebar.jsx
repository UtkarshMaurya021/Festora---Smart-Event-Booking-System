import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h3 className="text-center py-4">Festora</h3>
      <hr className="text-light" />

      {/* USER SIDEBAR LINKS */}
      {role === "ROLE_USER" && (
        <>
          <Link to="/user/dashboard">Dashboard</Link>
          <Link to="/user/events">Events</Link>
          <Link to="/my-bookings">My Bookings</Link>
          <Link to="/user/tickets">Tickets</Link>
          <Link to="/user/profile">Profile</Link>
        </>
      )}

      {/* ORGANIZER SIDEBAR LINKS */}
      {role === "ROLE_ORGANIZER" && (
        <>
          <Link to="/organizer/dashboard">Dashboard</Link>
          <Link to="/organizer/events">All Events</Link>
          <Link to="/organizer/events/create">Create Event</Link>
        </>
      )}

      {/* ADMIN SIDEBAR LINKS */}
      {role === "ROLE_ADMIN" && (
        <>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/organizers">Organizers</Link>
          <Link to="/admin/events">Events</Link>
          <Link to="/admin/categories">Categories</Link>
          <Link to="/admin/venues">Venues</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/payments">Payments</Link>
        </>
      )}

      <button className="btn btn-danger w-75 mt-5 ms-4" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
