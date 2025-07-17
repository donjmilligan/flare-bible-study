import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    session: '',
    comments: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSessionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      session: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Example: send data to backend
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          // You can add session/comments/profile if needed
        })
      });
      if (response.ok) {
        alert('Thank you for registering for Bible Study! Please sign in.');
        navigate('/signin');
      } else {
        const data = await response.json();
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <h1 className='signup-title'>Bible Study Registration Form</h1>
      <p className='signup-description'>Please fill out the form below to register for our Bible study sessions</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-section">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
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
        {/* Other form sections remain the same */}
        <div className="form-section">
          <h2>Bio</h2>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
          />
        </div>

        <div className="form-footer">
          <button type="submit" className="submit-btn">
            Submit
          </button>
          <div className="already-registered">
            Already registered? <a href="/signin">Sign in</a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signup;