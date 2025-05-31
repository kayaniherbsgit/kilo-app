import React from 'react';
import BottomNav from '../components/BottomNav';
import DrawerMenu from '../components/DrawerMenu';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';


const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'User', avatar: '' };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

const [streak, setStreak] = useState(0);
const [completedCount, setCompletedCount] = useState(0);
const [totalLessons, setTotalLessons] = useState(10); // Optional: You can fetch this too dynamically

useEffect(() => {
  const fetchProgress = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/state/${user.username}`);
      setCompletedCount(res.data.completedLessons.length);
    } catch (err) {
      console.error('Failed to fetch completed lessons');
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/users/streak/${user.username}`);
      setStreak(res.data.streak || 0);
    } catch (err) {
      console.error('Failed to fetch streak');
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/lessons/count`);
      setTotalLessons(res.data.total);
    } catch (err) {
      console.error('Failed to fetch total lessons');
    }
  };

  fetchProgress();
}, []);



  return (
    <div style={{ padding: '1.5rem', paddingBottom: '6rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <DrawerMenu />
      <ThemeSwitcher />

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img
          src={`http://localhost:5000${user.avatar || '/uploads/default.png'}`}
          alt="avatar"
          style={{ width: 80, height: 80, borderRadius: '50%' }}
        />
        <h3 style={{ margin: '0.5rem 0 0' }}>{user.username}</h3>
        <p style={{ color: 'var(--subtext)', fontSize: '0.85rem' }}>@{user.username?.toLowerCase()}</p>

        {/* ✅ EDIT PROFILE BUTTON */}
        <button
          onClick={() => navigate('/profile-settings')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.2rem',
            borderRadius: '8px',
            background: '#1c651b',
            color: 'white',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>

      <div className="card">
        <h4>🔥 Streak</h4>
        <p>You’ve completed lessons {streak} days in a row.</p>
      </div>

      <div className="card">
        <h4>✅ Completed Lessons</h4>
<p>{completedCount} of {totalLessons} lessons</p>
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
