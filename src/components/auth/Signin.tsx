import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signin.css';

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      if (response.ok) {
        const data = await response.json();
        // Store token
        if (rememberMe) {
          localStorage.setItem('token', data.token);
        } else {
          sessionStorage.setItem('token', data.token);
        }
        // Redirect to homepage
        navigate('/WorldEmpires');
      } else {
        const data = await response.json();
        alert(data.error || 'Signin failed');
      }
    } catch (err) {
      alert('Signin failed');
    }
  };

  return (
    <div className="signin-container">
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-section">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-section">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMe}
            />
            Remember me
          </label>
        </div>
        <div className="form-footer">
          <button type="submit" className="submit-btn">
            Sign In
          </button>
          <div className="already-registered">
            New user? <a href="/registration">Register here</a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signin; 