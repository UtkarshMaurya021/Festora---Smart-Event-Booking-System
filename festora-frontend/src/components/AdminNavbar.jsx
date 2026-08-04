import { Link, useNavigate } from "react-router-dom";
import { logout as logoutRequest } from "../services/authService";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    logoutRequest().finally(() => navigate("/login"));
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">

        <Link
          className="navbar-brand fw-bold fs-3"
          to="/admin/dashboard"
        >
          Festora Admin
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="adminNavbar"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/dashboard"
              >
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/users"
              >
                Users
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/events"
              >
                Events
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/categories"
              >
                Categories
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/venues"
              >
                Venues
              </Link>
            </li>

            <li className="nav-item ms-lg-3">
              <button
                className="btn btn-danger rounded-pill px-4"
                onClick={logout}
              >
                Logout
              </button>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
}