// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { title: '📊 Overview', path: '/admin/overview' },
    { title: '👥 Users', path: '/admin/users' },
    { title: '📤 Upload Lesson', path: '/admin/upload' },
    { title: '🎧 All Lessons', path: '/admin/lessons' },
    { title: '📋 Activity Logs', path: '/admin/logs' },
    { title: '📣 Notifications', path: '/admin/notifications' },
    { title: '✉️ Send Notification', path: '/admin/send-notification' },
  ];

  return (
    <div className="admin-dashboard-cards">
      <h2 style={{ color: '#b4ff39' }}>🛠 Admin Control Panel</h2>
      <div className="card-grid">
        {cards.map(({ title, path }, i) => (
          <div key={i} className="admin-card" onClick={() => navigate(path)}>
            {title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;