import { Link } from "react-router-dom";
import { BsTicketPerforated } from "react-icons/bs";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-glow" />
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">
            <BsTicketPerforated className="auth-brand-icon" />
            <span>Festora</span>
          </Link>

          <h1 className="auth-headline">
            Every great night
            <br />
            starts with a booking.
          </h1>

          <p className="auth-subtext">
            Discover concerts, festivals, and meetups near you – and walk in
            with a ticket that scans in seconds.
          </p>
        </div>

        <p className="auth-copyright">
          © 2026 Festora. Smart Event Booking.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-right-inner">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
