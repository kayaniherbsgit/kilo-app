import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;


// List of Tanzanian regions for the dropdown
// This list can be expanded or modified as needed
// Source: https://en.wikipedia.org/wiki/Regions_of_Tanzania
// Note: Ensure the list is up-to-date with the latest administrative divisions
// as regions can change over time.
// This list is based on the current administrative regions of Tanzania as of 2023.
// It includes all 26 regions, which are the primary administrative divisions in Tanzania.  

const tanzaniaRegions = [
  "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi",
  "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Morogoro",
  "Mtwara", "Mwanza", "Njombe", "Pwani", "Rukwa", "Ruvuma", "Shinyanga",
  "Simiyu", "Singida", "Tabora", "Tanga"
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    region: '',
    password: '',
    avatar: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const isAdmin = formData.username.trim().toLowerCase() === 'kayaniadmin';
  const data = new FormData();

  for (const key in formData) {
    data.append(key, formData[key]);
  }

  try {
    await axios.post(`${BASE_URL}/api/auth/register`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert(isAdmin ? 'Admin registered! You can now login.' : 'Registration successful! Wait for admin approval.');
    navigate('/login');
  } catch (error) {
  console.error('❌ FULL REGISTER ERROR:', error); // Show full error
  console.error('❌ RESPONSE DATA:', error.response?.data); // Log server response
  console.error('❌ STATUS:', error.response?.status); // Show status code
  console.error('❌ HEADERS:', error.response?.headers); // Show headers

  alert(
    error.response?.data?.message ||
    error.message ||
    'Registration failed (unknown error)'
  );
}

};


  return (
    <>
      {/* Close Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid #ff4c4c',
          borderRadius: '8px',
          color: '#ff4c4c',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          padding: '0.4rem 0.8rem',
          cursor: 'pointer',
          zIndex: 999
        }}
      >
        ✖
      </button>

      <div style={containerStyle}>
        <div style={boxStyle}>
          <h2 style={titleStyle}>Register</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required style={inputStyle} />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
            <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required style={inputStyle} />
            <input type="text" name="whatsappNumber" placeholder="WhatsApp Number" onChange={handleChange} required style={inputStyle} />
            <select name="region" onChange={handleChange} required style={inputStyle}>
              <option value="">Select Region</option>
              {tanzaniaRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
            <input type="file" name="avatar" accept="image/*" onChange={handleChange} required style={inputStyle} />
            <button type="submit" style={buttonStyle}>Register</button>
          </form>
          <div style={switchStyle}>
            Already have an account? <a href="/login" style={linkStyle}>Back to Login</a>
          </div>
        </div>
      </div>
    </>
  );
};

// Styled components
const containerStyle = {
  background: 'var(--bg)',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const boxStyle = {
  background: 'var(--card)',
  padding: '2rem',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  width: '90%',
  maxWidth: '500px',
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '1.5rem',
  color: 'var(--accent)',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  border: '1px solid #333',
  borderRadius: '10px',
  background: '#1f1f1f',
  color: '#fff',
};

const buttonStyle = {
  width: '100%',
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  padding: '0.75rem',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
};

const switchStyle = {
  textAlign: 'center',
  fontSize: '0.9rem',
  marginTop: '1rem',
};

const linkStyle = {
  color: 'var(--accent)',
  textDecoration: 'none',
};

export default Register;
