import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  FiTarget,
  FiEye,
  FiShield,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiMail,
  FiCreditCard,
  FiMapPin,
  FiGrid,
  FiAward,
} from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";
import "./styles/about.css";

function About() {
  const [realtimeStats, setRealtimeStats] = useState({
    activeEvents: 0,
    organizers: 0,
    venues: 0,
    totalBookings: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api.get("/public/stats")
      .then((res) => {
        if (res.data) {
          setRealtimeStats({
            activeEvents: res.data.activeEvents || 0,
            organizers: res.data.organizers || 0,
            venues: res.data.venues || 0,
            totalBookings: res.data.totalBookings || 0,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load realtime platform stats for About page:", err);
      })
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="about-hero">
        <div className="container text-center">
          <div className="about-logo">
            <MdConfirmationNumber />
          </div>

          <h1>About Festora</h1>

          <p>
            Festora is a Smart Event Booking Platform that helps users discover,
            book and manage events quickly while enabling organizers to create
            and manage successful events securely.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-section">
        <div className="container">
          <div className="row g-4">

            <div className="col-lg-6">
              <div className="about-card">
                <FiTarget className="about-icon" />

                <h3>Our Mission</h3>

                <p>
                  Our mission is to simplify event booking by providing a secure,
                  reliable and user-friendly platform where attendees can
                  discover events and organizers can manage them efficiently.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-card">
                <FiEye className="about-icon" />

                <h3>Our Vision</h3>

                <p>
                  To become one of the most trusted event booking platforms by
                  offering seamless booking, transparent organizer management
                  and excellent customer experience.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Real-time Platform Statistics */}
      <section className="about-stats">
        <div className="container">
          <div className="text-center text-white mb-4">
            <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
              ⚡ LIVE PLATFORM METRICS
            </span>
            <h2 className="fw-bold text-white mb-1">Real-Time Platform Performance</h2>
            <p className="text-white-50 small">
              Live statistics updated directly from our database servers.
            </p>
          </div>

          <div className="row text-center g-4 justify-content-center">
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-white text-dark shadow-sm h-100">
                <FiCalendar className="text-primary mb-2" size={36} />
                <h1 className="fw-bold text-primary mb-1">
                  {loadingStats ? "..." : realtimeStats.activeEvents}
                </h1>
                <p className="fw-bold mb-0 text-muted">Active Platform Events</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-white text-dark shadow-sm h-100">
                <FiUsers className="text-success mb-2" size={36} />
                <h1 className="fw-bold text-success mb-1">
                  {loadingStats ? "..." : realtimeStats.organizers}
                </h1>
                <p className="fw-bold mb-0 text-muted">Approved Event Hosts</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-white text-dark shadow-sm h-100">
                <FiMapPin className="text-info mb-2" size={36} />
                <h1 className="fw-bold text-info mb-1">
                  {loadingStats ? "..." : realtimeStats.venues}
                </h1>
                <p className="fw-bold mb-0 text-muted">Registered Hosting Venues</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="about-features">
        <div className="container">

          <div className="text-center mb-5">
            <h2>Why Choose Festora?</h2>
            <p>Everything you need for hassle-free event booking.</p>
          </div>

          <div className="row g-4">

            <div className="col-md-4">
              <div className="feature-box">
                <FiCalendar className="feature-icon" />
                <h5>Easy Event Discovery</h5>
                <p>
                  Browse music shows, workshops, sports events and college
                  festivals in one place.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-box">
                <FiShield className="feature-icon" />
                <h5>Verified Organizers</h5>
                <p>
                  Every organizer requires administrator approval before
                  publishing events.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-box">
                <FiCreditCard className="feature-icon" />
                <h5>Secure Payments</h5>
                <p>
                  Fast and secure online payment with instant booking
                  confirmation.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-box">
                <FiCheckCircle className="feature-icon" />
                <h5>Instant Booking</h5>
                <p>
                  Book tickets within seconds and receive immediate confirmation.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-box">
                <FiMail className="feature-icon" />
                <h5>Email Notifications</h5>
                <p>
                  Receive booking confirmations, organizer approvals and event
                  updates directly in your inbox.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-box">
                <FiUsers className="feature-icon" />
                <h5>Simple Management</h5>
                <p>
                  Easy dashboards for users, organizers and administrators.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section bg-light">
        <div className="container">

          <div className="text-center mb-5">
            <h2>How Festora Works</h2>
          </div>

          <div className="row text-center g-4">

            <div className="col-md-3">
              <div className="step-card">
                <div className="step-number">1</div>
                <h5>Browse Events</h5>
                <p>Explore upcoming events and choose your favourite.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="step-card">
                <div className="step-number">2</div>
                <h5>Book Ticket</h5>
                <p>Select seats and complete secure payment.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="step-card">
                <div className="step-number">3</div>
                <h5>Get Confirmation</h5>
                <p>Receive your booking confirmation by email.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="step-card">
                <div className="step-number">4</div>
                <h5>Enjoy Event</h5>
                <p>Show your ticket and enjoy the experience.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="about-section">
        <div className="container">

          <div className="text-center mb-5">
            <h2>Technology Stack</h2>
          </div>

          <div className="row g-4">

            <div className="col-md-4">
              <div className="tech-card">React.js</div>
            </div>

            <div className="col-md-4">
              <div className="tech-card">Spring Boot</div>
            </div>

            <div className="col-md-4">
              <div className="tech-card">MySQL</div>
            </div>

            <div className="col-md-4">
              <div className="tech-card">JWT Authentication</div>
            </div>

            <div className="col-md-4">
              <div className="tech-card">Bootstrap</div>
            </div>

            <div className="col-md-4">
              <div className="tech-card">Java Mail</div>
            </div>

          </div>

        </div>
      </section>

      {/* Contact */}
      <section className="about-contact">
        <div className="container text-center">

          <FiMapPin className="contact-icon" />

          <h2>Get In Touch</h2>

          <p>
            Have questions or suggestions? We'd love to hear from you.
          </p>

          <p>
            <strong>Email:</strong> support@festora.com
          </p>

        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;