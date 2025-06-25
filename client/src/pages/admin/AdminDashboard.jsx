// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const cards = [
    { icon: '📊', title: 'Overview', path: '/admin/overview' },
    { icon: '👥', title: 'Users', path: '/admin/users' },
    { icon: '📤', title: 'Upload Lesson', path: '/admin/upload' },
    { icon: '🎧', title: 'All Lessons', path: '/admin/lessons' },
    { icon: '📋', title: 'Activity Logs', path: '/admin/logs' },
    { icon: '✉️', title: 'Send Notification', path: '/admin/send-notification' },
  ];

  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotifications(res.data);
        setHasUnread(res.data.some((n) => !n.read));
      })
      .catch((err) => console.error("Failed to fetch notifications", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard-cards">
      <div className="admin-dashboard-header">
        <h2 className="gradient-title">🛠 Admin Control Panel</h2>

        <div className="notification-bell-container">
          <FaBell
            className="notification-bell"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {hasUnread && <span className="notification-dot" />}
          {showDropdown && (
            <div className="notification-dropdown">
              <h4>📥 Recent Notifications</h4>
              {notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                notifications.slice(0, 5).map((note, i) => (
                  <div key={i} className="notification-item">
                    <div className="note-message">{note.message}</div>
                    <div className="note-time">
                      {new Date(note.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card-grid">
        {cards.map(({ icon, title, path }, i) => (
          <div
            key={i}
            className="admin-card"
            onClick={() => navigate(path)}
          >
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span style={{ fontWeight: "600" }}>{title}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          className="neon-btn"
          style={{
            backgroundColor: "#ff3b30",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
