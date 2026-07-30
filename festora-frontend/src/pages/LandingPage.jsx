
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiZap,
  FiLock,
  FiCheckCircle,
  FiBell,
  FiDollarSign,
  FiHeadphones,
  FiSearch,
  FiShoppingCart,
  FiLogIn,
  FiCalendar,
  FiStar,
} from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";
import "../pages/styles/landing.css";

function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-texture" />

        <div className="container position-relative d-flex flex-column h-100">
          <div className="row flex-grow-1 align-items-center">
            <div className="col-lg-7">
              <div className="landing-hero-logo">
                <MdConfirmationNumber className="landing-hero-logo-icon" />
                <span>Festora</span>
              </div>

              <span className="landing-eyebrow">
                <FiZap className="landing-eyebrow-icon" /> Live events, real
                seats
              </span>

              <h1 className="landing-headline">
                Find events
                <br />
                worth clearing
                <br />
                your calendar for.
              </h1>

              <p className="landing-subtext">
                Music festivals, workshops, hackathons, sports and college
                fests — discovered in minutes, booked in seconds.
              </p>
            </div>
          </div>

          <p className="landing-hero-caption">
            <MdConfirmationNumber className="landing-hero-caption-icon" />
            Festora — Smart Event Booking
          </p>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="landing-stats-strip">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-6 col-md-3">
              <span className="landing-stat-icon">
                <FiCalendar />
              </span>
              <p className="landing-stat-label">Live Events</p>
            </div>

            <div className="col-6 col-md-3">
              <span className="landing-stat-icon">
                <FiZap />
              </span>
              <p className="landing-stat-label">Instant Tickets</p>
            </div>

            <div className="col-6 col-md-3">
              <span className="landing-stat-icon">
                <FiCheckCircle />
              </span>
              <p className="landing-stat-label">Verified Organizers</p>
            </div>

            <div className="col-6 col-md-3">
              <span className="landing-stat-icon">
                <FiStar />
              </span>
              <p className="landing-stat-label">Highly Rated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Festora */}
      <section className="landing-why-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="landing-eyebrow landing-eyebrow-dark">
              Why Festora
            </span>

            <h2 className="landing-section-title mt-2">
              Built for people who don't want to miss out
            </h2>

            <p className="landing-why-subtext">
              From instant QR check-ins to verified organizers, every part of
              Festora is designed to get you from discovery to the front row,
              without the hassle.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon">
                  <FiZap />
                </div>
                <h4>Instant Booking</h4>
                <p>
                  Reserve your seat in just a few taps and get a ticket that
                  scans instantly at the gate.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon">
                  <FiLock />
                </div>
                <h4>Secure Payments</h4>
                <p>
                  Every transaction is encrypted end-to-end, so your money and
                  details stay protected.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon">
                  <FiCheckCircle />
                </div>
                <h4>Verified Organizers</h4>
                <p>
                  We vet every organizer on the platform, so you always know who
                  you're buying from.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon">
                  <FiBell />
                </div>
                <h4>Smart Alerts</h4>
                <p>
                  Get notified the moment events matching your interests go live
                  near you.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon">
                  <FiDollarSign />
                </div>
                <h4>No Hidden Fees</h4>
                <p>
                  The price you see at checkout is the price you pay. No
                  last-minute surprises.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-feature-card">
                <div className="landing-feature-icon">
                  <FiHeadphones />
                </div>
                <h4>Always-On Support</h4>
                <p>
                  Questions about a booking or an event? Our support team is
                  always a message away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="landing-eyebrow landing-eyebrow-dark">
              How it works
            </span>

            <h2 className="landing-section-title mt-2">
              From browsing to the front row in three steps
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="landing-step-card">
                <span className="landing-step-icon">
                  <FiSearch />
                </span>
                <h4>Discover</h4>
                <p>
                  Browse festivals, workshops, and meetups curated for you.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-step-card">
                <span className="landing-step-icon">
                  <FiShoppingCart />
                </span>
                <h4>Book</h4>
                <p>
                  Pick your seats and check out securely, right from your phone.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-step-card">
                <span className="landing-step-icon">
                  <FiLogIn />
                </span>
                <h4>Walk In</h4>
                <p>Show your QR ticket at the gate and you're straight in.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonial-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="landing-eyebrow landing-eyebrow-dark">
              Testimonials
            </span>

            <h2 className="landing-section-title mt-2">
              Loved by event-goers
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="landing-testimonial-card">
                <p className="landing-testimonial-quote">
                  "Booked my festival pass in no time and the QR check-in at the
                  gate was instant. No queues, no stress."
                </p>
                <p className="landing-testimonial-author">
                  — Ananya R., Music Festival Attendee
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-testimonial-card">
                <p className="landing-testimonial-quote">
                  "As an organizer, the verification process gave our event
                  instant credibility with attendees."
                </p>
                <p className="landing-testimonial-author">
                  — Rohan K., Hackathon Organizer
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="landing-testimonial-card">
                <p className="landing-testimonial-quote">
                  "Found a college fest happening in my city that I would've
                  completely missed otherwise. Great alerts."
                </p>
                <p className="landing-testimonial-author">
                  — Priya S., Student
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default LandingPage;
