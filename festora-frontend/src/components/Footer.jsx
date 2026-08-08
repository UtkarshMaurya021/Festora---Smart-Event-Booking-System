import { FiMail, FiShield, FiMapPin } from "react-icons/fi";

function Footer() {
  return (
    <footer className="footer bg-dark text-white py-5 border-top border-secondary-subtle">
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <h3 className="fw-bold text-white mb-2 tracking-wide">
              Festora
            </h3>
            <p className="text-white-50 small mb-3">
              Discover, book, and manage amazing events around you with instant gate QR tickets and secure payments.
            </p>
            <div className="d-flex align-items-center gap-2 text-white-50 small">
              <FiShield className="text-primary" /> Powered by Festora Engine & Gate QR Validation
            </div>
          </div>

          {/* Support & Contact Us Section */}
          <div className="col-lg-5 col-md-6">
            <h5 className="fw-bold text-white mb-3">Support & Contact Us</h5>
            <ul className="list-unstyled text-white-50 small mb-0">
              <li className="mb-2 d-flex align-items-center gap-2">
                <FiMail className="text-warning" size={18} />
                <span>Admin & Support Email: </span>
                <a href="mailto:kalashsatypal4@gmail.com" className="text-white text-decoration-none fw-semibold">
                  kalashsatypal4@gmail.com
                </a>
              </li>
              <li className="d-flex align-items-center gap-2">
                <FiMapPin className="text-danger" size={18} />
                <span>Festora Event Support & Ticketing Desk</span>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="col-lg-3 col-md-12 text-lg-end">
            <h5 className="fw-bold text-white mb-3">Festora Platform</h5>
            <p className="text-white-50 small mb-2">
              © {new Date().getFullYear()} Festora. All rights reserved.
            </p>
            <p className="text-white-50 small mb-0">
              Smart event booking and QR ticket verification.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;