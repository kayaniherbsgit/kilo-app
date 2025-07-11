import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/admin/AdminDashboard.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/admin/notifications/${id}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const cards = [
    { icon: '📊', title: 'Overview', path: '/admin/overview' },
    { icon: '👥', title: 'Users', path: '/admin/users' },
    { icon: '📤', title: 'Upload Lesson', path: '/admin/upload' },
    { icon: '🎧', title: 'All Lessons', path: '/admin/lessons' },
    { icon: '📋', title: 'Activity Logs', path: '/admin/logs' },
    { icon: '✉️', title: 'Send Notification', path: '/admin/send-notification' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="admin-dashboard-cards">
      <div className="admin-header">
        <h2 className="gradient-title">🛠 Admin Control Panel</h2>
        <div className="notification-bell-container">
          <FaBell
            className="notification-bell"
            onClick={() => setDropdownVisible(!dropdownVisible)}
          />
          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount}</span>
          )}

          {dropdownVisible && (
            <div className="notification-dropdown">
              <h4>Notifications</h4>
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications</p>
              ) : (
                notifications.map((note) => (
                  <div
                    key={note._id}
                    className={`notification-item ${note.read ? '' : 'unread'}`}
                    onClick={() => {
                      markAsRead(note._id);
                      navigate(`/admin/notifications/${note._id}`);
                      setDropdownVisible(false);
                    }}
                  >
                    <p className="note-message">{note.message}</p>
                    <span className="note-time">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

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
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;