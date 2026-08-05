import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey, FiCheckCircle, FiX } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout";
import { forgotPassword, resetPassword } from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.message;

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Reset
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      if (res.data.role === "ROLE_ADMIN") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "ROLE_ORGANIZER") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");
    setForgotLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      setForgotMsg(res.data.message || `OTP sent to ${forgotEmail}. (OTP: ${res.data.otp})`);
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send reset OTP. Check email.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");

    if (!newPassword || newPassword.length < 8) {
      setForgotError("New password must contain at least 8 characters.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await resetPassword({
        email: forgotEmail,
        token: otpToken,
        newPassword: newPassword,
      });
      setForgotMsg("Password reset successfully! You can now log in.");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail("");
        setOtpToken("");
        setNewPassword("");
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Password reset failed. Invalid OTP or expired.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleLogin}>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-desc">Log in to book tickets or manage your events.</p>

        {infoMessage && <div className="auth-server-info">{infoMessage}</div>}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="login-password">Password</label>
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotEmail(email);
              }}
              style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
            >
              Forgot password?
            </button>
          </div>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 28,
            maxWidth: 420,
            width: "100%",
            position: "relative",
            color: "#fff"
          }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer"
              }}
            >
              <FiX size={20} />
            </button>

            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <FiKey color="#38bdf8" /> Reset Password
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 20 }}>
              {forgotStep === 1
                ? "Enter your registered email address to receive a security OTP."
                : "Enter the OTP sent to your email and your new password."}
            </p>

            {forgotMsg && (
              <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: 10, color: "#34d399", fontSize: "0.85rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <FiCheckCircle size={16} /> {forgotMsg}
              </div>
            )}

            {forgotError && (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 10, color: "#fca5a5", fontSize: "0.85rem", marginBottom: 16 }}>
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: 6, color: "#cbd5e1" }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#fff", outline: "none" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "linear-gradient(135deg, #38bdf8, #0284c7)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  {forgotLoading ? "Sending OTP..." : "Send Reset OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: 6, color: "#cbd5e1" }}>OTP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#fff", outline: "none" }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: 6, color: "#cbd5e1" }}>New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#fff", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #475569", background: "none", color: "#cbd5e1", fontWeight: 600, cursor: "pointer" }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{ flex: 2, padding: 12, borderRadius: 8, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                  >
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;
