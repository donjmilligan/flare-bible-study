import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

const SignUp = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { bio, ...rest } = form;
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, profile: bio ? { bio } : undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Registration successful! Please log in.");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <textarea
          name="bio"
          placeholder="Bio (optional)"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontFamily: "inherit",
            fontSize: "1rem",
          }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Sign Up"}
        </button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
      <button className="switch-link" onClick={() => navigate("/login")}>
        Already have an account?
      </button>
    </div>
  );
};

export default SignUp;
