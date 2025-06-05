// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { icon: '📊', title: 'Overview', path: '/admin/overview' },
    { icon: '👥', title: 'Users', path: '/admin/users' },
    { icon: '📤', title: 'Upload Lesson', path: '/admin/upload' },
    { icon: '🎧', title: 'All Lessons', path: '/admin/lessons' },
    { icon: '📋', title: 'Activity Logs', path: '/admin/logs' },
    { icon: '📣', title: 'Notifications', path: '/admin/notifications' },
    { icon: '✉️', title: 'Send Notification', path: '/admin/send-notification' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard-cards">
      <h2 style={{ color: '#b4ff39' }}>🛠 Admin Control Panel</h2>
      <div className="card-grid">
        {cards.map(({ icon, title, path }, i) => (
          <div key={i} className="admin-card" onClick={() => navigate(path)}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <span style={{ fontWeight: '600' }}>{title}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          className="neon-btn"
          style={{
            backgroundColor: '#ff3b30',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
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