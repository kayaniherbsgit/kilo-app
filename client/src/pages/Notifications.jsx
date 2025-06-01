import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.username) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/${user.username}`)
        .then(res => setNotifications(res.data));
    }
  }, [user]);

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '5rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <ThemeSwitcher />
      <h2>🔔 Notifications</h2>
      {notifications.map((n, i) => (
        <div key={i} className="card" style={{ marginBottom: '1rem' }}>
          <p>{n.message}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--subtext)' }}>
            {new Date(n.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
      <BottomNav />
    </div>
  );
};

export default Notifications;
