import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("ROLE_USER");

  const signup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");

      return;
    }

    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
      });

      alert("Registration Successful");

      navigate("/login");
    } catch (error) {
      alert(error.response?.data || "Registration Failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card auth-card">
              <h2 className="mb-4 text-center">Create Account</h2>

              <input
                className="form-control mb-3"
                placeholder="Full Name"
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="form-control mb-3"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="form-control mb-3"
                placeholder="Phone"
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <label className="form-label">Register As</label>

              <select
                className="form-select mb-4"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ROLE_USER">User</option>

                <option value="ROLE_ORGANIZER">Organizer</option>
              </select>

              <button className="btn btn-primary w-100" onClick={signup}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Signup;
