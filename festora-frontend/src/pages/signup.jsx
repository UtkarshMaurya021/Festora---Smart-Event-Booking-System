import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { BsTicketPerforated, BsBuilding } from "react-icons/bs";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("ROLE_USER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    let err = {};

    if (!name.trim()) {
      err.name = "Full name is required";
    } else if (name.trim().length < 3) {
      err.name = "Name must be at least 3 characters";
    }

    if (!email.trim()) {
      err.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      err.email = "Enter a valid email";
    }

    // Phone is optional, but if provided it must be valid
    if (phone.trim() && !/^[0-9]{10}$/.test(phone)) {
      err.phone = "Phone number must contain exactly 10 digits";
    }

    if (!password) {
      err.password = "Password is required";
    } else if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      err.password = "At least 8 characters, with a letter and a number";
    }

    if (!confirmPassword) {
      err.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const signup = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
      });

      if (role === "ROLE_ORGANIZER") {
        navigate("/login", {
          state: {
            message:
              "Your organizer account has been created and is awaiting admin approval. You'll be able to log in once approved.",
          },
        });
      } else {
        navigate("/login");
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          error.response?.data ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={signup} noValidate>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-desc">
          Book tickets in seconds, or start organizing your own events.
        </p>

        {serverError && <div className="auth-server-error">{serverError}</div>}

        <div className="auth-role-toggle">
          <button
            type="button"
            className={`auth-role-btn ${role === "ROLE_USER" ? "active" : ""}`}
            onClick={() => setRole("ROLE_USER")}
          >
            <BsTicketPerforated />
            Attend events
          </button>
          <button
            type="button"
            className={`auth-role-btn ${
              role === "ROLE_ORGANIZER" ? "active" : ""
            }`}
            onClick={() => setRole("ROLE_ORGANIZER")}
          >
            <BsBuilding />
            Organize events
          </button>
        </div>

        <div className="auth-field">
          <label htmlFor="signup-name">Full name</label>
          <div className={`auth-input-wrap ${errors.name ? "has-error" : ""}`}>
            <FiUser className="auth-input-icon" />
            <input
              id="signup-name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {errors.name && <small className="auth-error">{errors.name}</small>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email">Email</label>
          <div className={`auth-input-wrap ${errors.email ? "has-error" : ""}`}>
            <FiMail className="auth-input-icon" />
            <input
              id="signup-email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <small className="auth-error">{errors.email}</small>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-phone">Phone (optional)</label>
          <div className={`auth-input-wrap ${errors.phone ? "has-error" : ""}`}>
            <FiPhone className="auth-input-icon" />
            <input
              id="signup-phone"
              placeholder="10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {errors.phone && <small className="auth-error">{errors.phone}</small>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password">Password</label>
          <div
            className={`auth-input-wrap ${errors.password ? "has-error" : ""}`}
          >
            <FiLock className="auth-input-icon" />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password ? (
            <small className="auth-error">{errors.password}</small>
          ) : (
            <small className="auth-hint">
              At least 8 characters, with a letter and a number
            </small>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-confirm-password">Confirm password</label>
          <div
            className={`auth-input-wrap ${
              errors.confirmPassword ? "has-error" : ""
            }`}
          >
            <FiLock className="auth-input-icon" />
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowConfirmPassword((s) => !s)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <small className="auth-error">{errors.confirmPassword}</small>
          )}
        </div>

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signup;
