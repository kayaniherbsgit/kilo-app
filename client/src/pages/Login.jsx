import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
      headers: { 'Content-Type': 'application/json' }
    });

    const fullUser = { ...res.data.user, token: res.data.token };
    localStorage.setItem('user', JSON.stringify(fullUser));
    localStorage.setItem('token', res.data.token);


    setTimeout(() => {
      if (res.data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }, 1000);
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
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
        {loading && <Loader />}
        <div style={boxStyle}>
          <h2 style={titleStyle}>Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>
              Login
            </button>
          </form>
          <div style={switchStyle}>
            Don’t have an account?{' '}
            <a href="/register" style={linkStyle}>
              Register here
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

// Styled objects
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