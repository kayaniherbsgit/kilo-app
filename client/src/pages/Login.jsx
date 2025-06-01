import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
const res = await axios.post(`http://localhost:5000/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Login successful!');
      if (res.data.user.username === 'kayaniadmin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required style={inputStyle} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
        <div style={switchStyle}>
          Don’t have an account? <a href="/register" style={linkStyle}>Register here</a>
        </div>
      </div>
    </div>
  );
};

// Reusable styles
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

export default Login;