import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("user", JSON.stringify({ ...res.data.user, token: res.data.token }));
      localStorage.setItem("token", res.data.token);
      navigate(res.data.user.isAdmin ? "/admin" : "/home");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left image side */}
      <div className="auth-image">
        <h1 className="brand-text">Kayani Men Program</h1>
      </div>

      {/* Right form side */}
      <div className="auth-form-container">
        {loading && <Loader />}
        <div className="auth-box">
          <h2>Log In</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Your Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit">LOG IN</button>
          </form>

          <a href="#" className="forgot-link">Forgot your password?</a>
          <p className="switch-text">
            Don’t have an account? <a href="/register">Create one now</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
