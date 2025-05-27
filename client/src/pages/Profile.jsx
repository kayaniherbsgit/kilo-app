import React from 'react';
import BottomNav from '../components/BottomNav';
import DrawerMenu from '../components/DrawerMenu';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'User' };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '6rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <DrawerMenu />
      <ThemeSwitcher />

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img
          src={`http://localhost:5000/uploads/${user.avatar || 'default.png'}`}
          alt="avatar"
          style={{ width: 80, height: 80, borderRadius: '50%' }}
        />
        <h3 style={{ margin: '0.5rem 0 0' }}>{user.username}</h3>
        <p style={{ color: 'var(--subtext)', fontSize: '0.85rem' }}>@{user.username.toLowerCase()}</p>
      </div>

      <div className="card">
        <h4>🔥 Streak</h4>
        <p>You’ve completed lessons 4 days in a row.</p>
      </div>

      <div className="card">
        <h4>✅ Completed Lessons</h4>
        <p>8 of 10 lessons</p>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <button
          onClick={logout}
          style={{
            background: '#ff3d3d',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '10px',
            fontWeight: 600
          }}
        >
          Logout
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
