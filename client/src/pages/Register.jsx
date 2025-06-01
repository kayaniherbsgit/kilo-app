import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', avatar: null });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', formData.username);
    data.append('password', formData.password);
    data.append('avatar', formData.avatar);

    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/auth/register', data);
      alert('Registration successful!');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>Register</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required style={inputStyle} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
          <input type="file" name="avatar" accept="image/*" onChange={handleChange} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>Register</button>
        </form>
        <div style={switchStyle}>
          Already have an account? <a href="/login" style={linkStyle}>Back to Login</a>
        </div>
      </div>
    </div>
  );
};

// Reuse same styles from Login
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
  maxWidth: '400px',
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
