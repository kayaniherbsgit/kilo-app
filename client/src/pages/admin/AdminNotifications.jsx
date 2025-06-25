import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import "../../styles/admin/AdminNotifications.css";
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filter, setFilter] = useState('all');
  const audioRef = useRef(null);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    socket.on('notificationsUpdated', () => {
      fetchNotifications();
      audioRef.current?.play();
      document.title = '🔔 New Notification!';
    });
    return () => socket.off('notificationsUpdated');
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/notifications/${id}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/admin/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Mark all as read failed', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    try {
      await axios.delete('http://localhost:5000/api/admin/notifications/delete-all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notifications', err);
    }
  };

  const isUnread = (note) => !note.readBy || !note.readBy.includes(userId);

  const groupByDate = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const isToday = now.toDateString() === date.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    return isToday ? 'Today' : isYesterday ? 'Yesterday' : 'Earlier';
  };

  const filteredAndGrouped = () => {
    const groups = {};
    const sorted = [...notifications].sort((a, b) =>
      sortOrder === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
    );

    sorted.forEach(note => {
      const msg = note.message.toLowerCase();
      const matchesSearch = !search || msg.includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && msg.includes('completed')) ||
        (filter === 'uploaded' && msg.includes('uploaded')) ||
        (filter === 'registered' && msg.includes('registered'));

      if (matchesSearch && matchesFilter) {
        const group = groupByDate(note.createdAt);
        if (!groups[group]) groups[group] = [];
        groups[group].push(note);
      }
    });
    return Object.entries(groups);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="admin-notifications-page">
      <audio ref={audioRef} src="/adminnotification.mp3" preload="auto" />

      <div className="admin-header">
        <h2 className="admin-title">🔔 Admin Notifications</h2>
        <div className="admin-actions">
          <input
            type="text"
            className="notif-input"
            placeholder="🔎 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="notif-input">
            <option value="all">All</option>
            <option value="completed">✅ Completed</option>
            <option value="uploaded">📤 Uploaded</option>
            <option value="registered">🧑‍💻 Registered</option>
          </select>
          <button onClick={toggleSortOrder} className="notif-btn">
            {sortOrder === 'desc' ? '⬇️ Newest First' : '⬆️ Oldest First'}
          </button>
          <button onClick={handleMarkAllAsRead} className="notif-btn green">✔️ Mark all as read</button>
          <button onClick={handleDeleteAll} className="notif-btn red">🗑️ Delete All</button>
          <button onClick={() => navigate('/admin')} className="notif-btn">⬅ Back</button>
        </div>
      </div>

      {filteredAndGrouped().length === 0 ? (
        <p className="no-notifications">No notifications found.</p>
      ) : (
        filteredAndGrouped().map(([section, items], i) => (
          <div key={i} className="notification-group">
            <h3>{section} <span className="notif-count">({items.length})</span></h3>
            {items.map((note, idx) => (
              <div
                key={idx}
                className={`notification-card ${isUnread(note) ? 'unread' : ''}`}
                onClick={() => navigate(`/admin/notifications/${note._id}`)}
              >
                <div className="notif-body">
                  <div className="notif-message">
                    {note.message}
                  </div>
                  <div className="notif-footer">
                    <span className="notif-date">{new Date(note.createdAt).toLocaleString()}</span>
                    {isUnread(note) && (
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(note._id);
                      }} className="read-btn">✔ Mark as read</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminNotifications;
