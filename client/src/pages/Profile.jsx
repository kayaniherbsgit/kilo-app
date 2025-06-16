import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const fonts = [
  { label: 'Classic Serif', className: 'font-serif' },
  { label: 'Modern Sans', className: 'font-sans' },
  { label: 'Playful Handwritten', className: 'font-hand' },
];

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem('user')) || { username: 'User', avatar: '' }
  );
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(10);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [lastLessonId, setLastLessonId] = useState(null);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [selectedFont, setSelectedFont] = useState(() => localStorage.getItem('selectedFont') || 'font-sans');

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    document.body.classList.remove('font-serif', 'font-sans', 'font-hand');
    document.body.classList.add(selectedFont);
  }, [selectedFont]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.username) {
      localStorage.clear();
      window.location.href = '/login';
    } else {
      setUserData(storedUser);
    }

    const fetchProgress = async () => {
      try {
        const res = await axios.get(
          `https://kilo-app-backend.onrender.com/api/users/state/${storedUser.username}`
        );
        setCompletedCount(res.data.completedLessons.length);
        setXp(res.data.xp || 0);
        setBadges(res.data.badges || []);
        setLastLessonId(res.data.lastPlayedLesson);

        const current = JSON.parse(localStorage.getItem('user')) || {};
        const updated = { ...current, ...res.data };
        localStorage.setItem('user', JSON.stringify(updated));
        setUserData(updated);
      } catch (err) {
        console.error('❌ Failed to fetch user state:', err);
      }

      try {
        const res = await axios.get(
          `https://kilo-app-backend.onrender.com/api/users/streak/${storedUser.username}`
        );
        setStreak(res.data.streak || 0);
      } catch (err) {
        console.error('❌ Failed to fetch streak:', err);
      }

      try {
        const res = await axios.get(
          `https://kilo-app-backend.onrender.com/api/lessons/count`
        );
        setTotalLessons(res.data.total);
      } catch (err) {
        console.error('❌ Failed to fetch total lessons:', err);
      }
    };

    fetchProgress();
  }, []);

  const handleFontChange = (fontClass) => {
    setSelectedFont(fontClass);
    localStorage.setItem('selectedFont', fontClass);
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        paddingBottom: '6rem',
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {/* Header with Settings Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>👤 My Profile</h2>
        <button
  onClick={() => navigate('/settings')}
  style={{
    background: '#238314',
    color: '#fff',
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    marginTop: '0.5rem',
    border: 'none',
  }}
>
  ⚙️
</button>

      </div>

      {/* Avatar + Username */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img
          src={`https://kilo-app-backend.onrender.com${userData?.avatar || '/uploads/default.png'}`}
          onError={(e) => {
            e.target.src = 'https://kilo-app-backend.onrender.com/uploads/default.png';
          }}
          alt="avatar"
          style={{ width: 50, height: 50, borderRadius: '50%' }}
        />
        <h3 style={{ margin: '0.5rem 0 0' }}>{userData.username}</h3>
        <p style={{ color: 'var(--subtext)', fontSize: '0.85rem' }}>
          @{userData.username?.toLowerCase()}
        </p>

        <button
          onClick={() => navigate('/profile-settings')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.2rem',
            borderRadius: '8px',
            background: '#1c651b',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Font Panel */}
      {showFontPanel && (
        <div className="card">
          <h4>📝 Font Style</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
            {fonts.map((f) => (
              <button
                key={f.className}
                onClick={() => handleFontChange(f.className)}
                className={`font-select-btn ${selectedFont === f.className ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h4>🔥 Streak</h4>
        <p>You’ve completed lessons {streak} days in a row.</p>
      </div>

      <div className="card">
        <h4>✅ Completed Lessons</h4>
        <p>{completedCount} of {totalLessons} lessons</p>
      </div>

      <div className="card">
        <h4>🧠 XP Points</h4>
        <p>{xp} XP earned</p>
      </div>

      {badges.length > 0 && (
        <div className="card">
          <h4>🎖️ Badges</h4>
          <div style={{ fontSize: '1.4rem' }}>
            {badges.map((badge, i) => (
              <span key={i} style={{ marginRight: '0.5rem' }}>{badge}</span>
            ))}
          </div>
        </div>
      )}

      {lastLessonId && (
        <div className="card" style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate(`/lesson/${lastLessonId}`)}
            style={{
              background: '#0a85ff',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            ▶️ Resume Last Lesson
          </button>
        </div>
      )}

      <div className="card" style={{ textAlign: 'center' }}>
        <button
          onClick={logout}
          style={{
            background: '#ff3d3d',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '10px',
            fontWeight: 600,
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
