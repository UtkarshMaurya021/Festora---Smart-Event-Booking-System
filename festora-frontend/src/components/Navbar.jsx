import { Link, NavLink } from "react-router-dom";
import { MdConfirmationNumber } from "react-icons/md";

import "../pages/styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg festora-navbar">
      <div className="container">

        <Link className="navbar-brand festora-logo" to="/">
          <MdConfirmationNumber className="me-2" />
          Festora
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
              {/* Linked dynamically to PublicEvents page */}
              <NavLink className="nav-link festora-link" to="/events">
                Events
              </NavLink>
            </li>

            <li className="nav-item">
              {/* Linked dynamically to About page */}
              <NavLink className="nav-link festora-link" to="/about">
                About
              </NavLink>
            </li>

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

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
