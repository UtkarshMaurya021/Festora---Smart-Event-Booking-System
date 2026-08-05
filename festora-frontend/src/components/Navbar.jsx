import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { MdConfirmationNumber } from "react-icons/md";
import { FiLogOut, FiUser, FiGrid, FiBookmark, FiPlusCircle } from "react-icons/fi";
import "../pages/styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [name, setName] = useState(() => localStorage.getItem("name"));

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
    setName(localStorage.getItem("name"));
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setName(null);
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (role === "ROLE_ADMIN") return "/admin/dashboard";
    if (role === "ROLE_ORGANIZER") return "/organizer/dashboard";
    return "/user/dashboard";
  };

  return (
    <nav className="navbar navbar-expand-lg festora-navbar">
      <div className="container">

        <Link className="navbar-brand festora-logo d-flex align-items-center gap-2" to="/">
          <MdConfirmationNumber style={{ fontSize: "2.2rem", color: "#6366f1", filter: "drop-shadow(0 2px 8px rgba(99, 102, 241, 0.6))" }} />
          <span className="fw-extrabold text-white fs-3" style={{ letterSpacing: "-0.5px" }}>Festora</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav ms-auto align-items-lg-center">

            <li className="nav-item">
              <NavLink className="nav-link festora-link" to="/">
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link festora-link" to="/events">
                Events
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link festora-link" to="/about">
                About
              </NavLink>
            </li>

            {token ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link festora-link d-flex align-items-center gap-1" to={getDashboardPath()}>
                    <FiGrid className="me-1 text-info" /> Dashboard
                  </NavLink>
                </li>

                {role === "ROLE_USER" && (
                  <li className="nav-item">
                    <NavLink className="nav-link festora-link d-flex align-items-center gap-1" to="/userbookings">
                      <FiBookmark className="me-1 text-warning" /> My Bookings
                    </NavLink>
                  </li>
                )}

                {role === "ROLE_ORGANIZER" && (
                  <li className="nav-item">
                    <NavLink className="nav-link festora-link d-flex align-items-center gap-1" to="/organizer/events/create">
                      <FiPlusCircle className="me-1 text-success" /> Create Event
                    </NavLink>
                  </li>
                )}

                <li className="nav-item ms-lg-3 d-flex align-items-center gap-2 mt-2 mt-lg-0">
                  <span className="badge bg-white text-dark fw-bold px-3 py-2 rounded-pill shadow-sm d-none d-lg-inline-flex align-items-center gap-1">
                    <FiUser className="text-primary" /> {name || "Account"}
                  </span>
                  <button
                    className="btn btn-outline-light festora-logout-btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-lg-3">
                  <Link className="btn festora-login-btn" to="/login">
                    Login
                  </Link>
                </li>

                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <Link className="btn festora-signup-btn" to="/signup">
                    Signup
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
