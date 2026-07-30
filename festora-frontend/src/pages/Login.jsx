import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      // Save token, role, and name in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      // Navigate based on role
      if (res.data.role === "ROLE_ADMIN") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "ROLE_ORGANIZER") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleLogin}>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-desc">Log in to book tickets or manage your events.</p>

        {error && <div className="auth-server-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <div className="auth-input-wrap">
            <FiMail className="auth-input-icon" />
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <FiLock className="auth-input-icon" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
        </div>

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
