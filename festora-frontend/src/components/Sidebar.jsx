import { Link } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiBook,
  FiCreditCard,
  FiUser,
  FiUsers,
  FiMapPin,
  FiGrid,
  FiLogOut,
  FiCheckSquare,
} from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";

import "../pages/styles/sidebar.css";
import { logout } from "../services/authService";

function Sidebar() {
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    logout().finally(() => (window.location.href = "/login"));
  };

  return (
    <aside className="festora-sidebar">

      <div className="sidebar-logo">
        <MdConfirmationNumber className="sidebar-logo-icon" />
        <span>Festora</span>
      </div>

      <hr className="sidebar-divider" />

      {/* USER */}

      {role === "ROLE_USER" && (
        <nav className="sidebar-menu">

          <Link to="/user/dashboard">
            <FiHome />
            Dashboard
          </Link>

          <Link to="/user/events">
            <FiCalendar />
            Events
          </Link>

          <Link to="/userbookings">
            <FiBook />
            My Bookings
          </Link>

          <Link to="/user/tickets">
            <MdConfirmationNumber />
            Tickets
          </Link>

          <Link to="/user/profile">
            <FiUser />
            Profile
          </Link>

        </nav>
      )}

      {/* ORGANIZER */}

      {role === "ROLE_ORGANIZER" && (
        <nav className="sidebar-menu">

          <Link to="/organizer/dashboard">
            <FiHome />
            Dashboard
          </Link>

          <Link to="/organizer/events">
            <FiCalendar />
            All Events
          </Link>

          <Link to="/organizer/events/create">
            <FiGrid />
            Create Event
          </Link>

          <Link to="/organizer/verify-ticket">
            <FiCheckSquare />
            Verify Ticket
          </Link>

          <Link to="/organizer/bookings">
            <FiBook />
            Attendee Bookings
          </Link>

          <Link to="/organizer/venues">
            <FiMapPin />
            Venue Directory
          </Link>

          <Link to="/organizer/profile">
            <FiUser />
            Profile & Company
          </Link>

        </nav>
      )}

      {/* ADMIN */}

      {role === "ROLE_ADMIN" && (
        <nav className="sidebar-menu">

          <Link to="/admin/dashboard">
            <FiHome />
            Dashboard
          </Link>

          <Link to="/admin/verify-ticket">
            <FiCheckSquare />
            Verify Ticket
          </Link>

          <Link to="/admin/users">
            <FiUsers />
            Users
          </Link>

          <Link to="/admin/organizers">
            <FiUsers />
            Organizers
          </Link>

          <Link to="/admin/events">
            <FiCalendar />
            Events
          </Link>

          <Link to="/admin/categories">
            <FiGrid />
            Categories
          </Link>

          <Link to="/admin/venues">
            <FiMapPin />
            Venues
          </Link>

          <Link to="/admin/bookings">
            <FiBook />
            Bookings
          </Link>

          <Link to="/admin/payments">
            <FiCreditCard />
            Payments
          </Link>

        </nav>
      )}

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          <FiLogOut />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;