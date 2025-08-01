import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css"; // ✅ Use the same style file as Login

const BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Full Tanzania region list for the dropdown
const tanzaniaRegions = [
  "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi",
  "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Morogoro",
  "Mtwara", "Mwanza", "Njombe", "Pwani", "Rukwa", "Ruvuma", "Shinyanga",
  "Simiyu", "Singida", "Tabora", "Tanga"
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
    region: "",
    password: "",
    avatar: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isAdmin = formData.username.trim().toLowerCase() === "kayaniadmin";
    const data = new FormData();

    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      await axios.post(`${BASE_URL}/api/auth/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(isAdmin ? "Admin registered! You can now login." : "Registration successful! Wait for admin approval.");
      navigate("/login");
    } catch (error) {
      console.error("❌ FULL REGISTER ERROR:", error);
      alert(error.response?.data?.message || error.message || "Registration failed (unknown error)");
    }
  };

  return (
    <div className="auth-container">
      {/* ✅ Left Image Section */}
      <div className="auth-image">
        <h1 className="brand-text">Kayani Learn</h1>
      </div>

      {/* ✅ Right Form Section */}
      <div className="auth-form-container">
        <div className="auth-box">
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="whatsappNumber"
              placeholder="WhatsApp Number"
              onChange={handleChange}
              required
            />

            <select name="region" onChange={handleChange} required>
              <option value="">Select Region</option>
              {tanzaniaRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              required
            />

            <button type="submit">REGISTER</button>
          </form>

          <p className="switch-text">
            Already have an account? <a href="/login">Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
