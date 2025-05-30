import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/AdminNotifications.css';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
  const audioRef = useRef(null);
  const token = localStorage.getItem('token');
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

  const groupByDate = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const isToday = now.toDateString() === date.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    return isToday ? 'Today' : isYesterday ? 'Yesterday' : 'Earlier';
  };

  const groupByType = () => {
    const groups = {};
    const sorted = [...notifications].sort((a, b) => {
      return sortOrder === 'desc'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });

    sorted.forEach(note => {
      let type = groupByDate(note.createdAt);
      if (!groups[type]) groups[type] = [];
      if (!search || note.message.toLowerCase().includes(search.toLowerCase())) {
        groups[type].push(note);
      }
    });
    return Object.entries(groups);
  };

  const isUnread = (note) => !note.readBy || !note.readBy.includes(localStorage.getItem('userId'));

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="admin-notifications-page">
      <audio ref={audioRef} src="/adminnotification.mp3" preload="auto" />

      <div className="top-bar">
        <h2>🔔 Admin Notifications</h2>
        <div className="notif-controls">
          <input
            type="text"
            className="notif-search"
            placeholder="🔎 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={toggleSortOrder} className="sort-btn">
            {sortOrder === 'desc' ? '⬇️ Newest First' : '⬆️ Oldest First'}
          </button>
          <button onClick={handleMarkAllAsRead} className="mark-all-btn">✔️ Mark all as read</button>
          <button onClick={handleDeleteAll} className="delete-all-btn">🗑️ Delete All</button>
          <button onClick={() => navigate('/admin')} className="back-btn">⬅ Back</button>
        </div>
      </div>

      {groupByType().length === 0 ? (
        <p className="no-notifications">No notifications found.</p>
      ) : (
        groupByType().map(([section, items], i) => (
          <div key={i} className="notification-group-block">
            <h3>{section} <span className="notif-count">({items.length})</span></h3>
{items.map((note, idx) => (
  <div key={idx} className={`notification-card ${isUnread(note) ? 'unread pulse' : ''}`}>
    
    {/* 🧑 Avatar box */}
    <div className="notif-avatar">
      <img
        src={note.avatar ? `/uploads/${note.avatar}` : '/default-avatar.png'}
        alt="avatar"
        className="avatar-img"
      />
    </div>

    {/* 💬 Message + Time */}
    <div className="notif-body">
      <div className="notif-message">
        {note.message.includes('registered') && '🧑‍💻 '}
        {note.message.includes('completed') && '✅ '}
        {note.message.includes('uploaded') && '📤 '}
        {note.message.includes('deleted') && '🗑️ '}
        {note.message.includes('updated') && '✏️ '}
        {note.message}
      </div>
      <div className="notif-date">{new Date(note.createdAt).toLocaleString()}</div>
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
