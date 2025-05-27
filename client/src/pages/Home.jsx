import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import BottomNav from '../components/BottomNav';
import ThemeSwitcher from '../components/ThemeSwitcher';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import notificationSound from '../assets/notification.mp3';

const Home = () => {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [audioProgress, setAudioProgress] = useState(0);
  const [canMark, setCanMark] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [topUsers, setTopUsers] = useState([]);
  const audioRef = useRef();
  const bellRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      const res = await axios.get('http://localhost:5000/api/lessons');
      setLessons(res.data.reverse());
    };

    fetchLessons();

    if (user?.username) {
      axios.get(`http://localhost:5000/api/users/${user.username}`)
        .then(res => setCompleted(res.data.completedLessons || []));

      axios.get(`http://localhost:5000/api/users/streak/${user.username}`)
        .then(res => {
          setStreak(res.data.streak || 0);
          if (res.data.streak === 7) {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          }
        });

      axios.get(`http://localhost:5000/api/notifications/unread/${user.username}`)
        .then(res => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => setUnreadCount(0));

      axios.get(`http://localhost:5000/api/community/leaderboard`)
        .then(res => setTopUsers(res.data || []));
    }

    const once = localStorage.getItem('showStreakOnce');
    if (!once) {
      setShowStreak(true);
      localStorage.setItem('showStreakOnce', 'true');
    } else if (Math.random() < 0.3) {
      setShowStreak(true);
    }
  }, [user]);

  useEffect(() => {
    setCanMark(false);
    setAudioProgress(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleAudioProgress = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const percentage = (audio.currentTime / audio.duration) * 100;
    setAudioProgress(percentage);
    if (percentage >= 70 && !canMark) setCanMark(true);
  };

  const markCompleted = async () => {
    const id = lessons[currentIndex]?._id;
    if (!completed.includes(id)) {
      const updated = [...completed, id];
      setCompleted(updated);
      localStorage.setItem('completed', JSON.stringify(updated));
      await axios.post('http://localhost:5000/api/auth/progress', {
        username: user.username,
        lessonId: id
      });

      axios.get(`http://localhost:5000/api/users/streak/${user.username}`)
        .then(res => {
          setStreak(res.data.streak || 0);
          if (res.data.streak === 7) {
            confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
          }
        });
    }
  };

  const nextLesson = () => {
    if (!completed.includes(lessons[currentIndex]?._id)) {
      alert("Complete this lesson first.");
      return;
    }
    if (currentIndex < lessons.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevLesson = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.pause() : audio.play();
    setIsPlaying(!isPlaying);
  };

  const swipe = useSwipeable({
    onSwipedLeft: nextLesson,
    onSwipedRight: prevLesson,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleBellClick = () => {
    bellRef.current?.play();
    navigate('/notifications');
  };

  const currentLesson = lessons[currentIndex];
  const totalCompletedPercent = lessons.length
    ? Math.round((completed.length / lessons.length) * 100)
    : 0;

  return (
    <div {...swipe} style={{ padding: '1.5rem', paddingBottom: '6rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <ThemeSwitcher />
      <audio ref={bellRef} src={notificationSound} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: '600',
            background: 'linear-gradient(to right, #00FFA3, #DC1FFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Hi, {user?.username || 'Guest'}
          </h2>
          <p style={{ color: 'var(--subtext)', fontSize: '0.9rem' }}>
            Completed {totalCompletedPercent}% 🎯
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleBellClick}>
            <FiBell style={{ fontSize: '1.6rem', color: 'var(--accent)' }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 10,
                height: 10,
                background: 'red',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite'
              }}></span>
            )}
          </div>

          <div style={{ width: 50, height: 50 }}>
            <CircularProgressbarWithChildren
              value={totalCompletedPercent}
              styles={buildStyles({
                pathColor: 'var(--accent)',
                trailColor: '#2e2e2e',
                strokeLinecap: 'round',
              })}
            >
              <img
                src={`http://localhost:5000/uploads/${user?.avatar || 'default.png'}`}
                alt="avatar"
                style={{ width: 34, height: 34, borderRadius: '50%' }}
              />
            </CircularProgressbarWithChildren>
          </div>
        </div>
      </div>

      {/* ✅ Streak Banner */}
      {showStreak && (
        <div className="card" style={{
          background: '#1c1c1c',
          border: '1px dashed var(--accent)',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h4>🔥 Keep it up!</h4>
          <p style={{ color: 'var(--subtext)' }}>
            You're on a {streak}-day streak. Don't break it today! 💪
          </p>
        </div>
      )}

      {/* ✅ Lesson Card */}
      {currentLesson && (
        <div className="card">
          <h4>{currentLesson.title}</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--subtext)' }}>
            {completed.includes(currentLesson._id) ? '✅ Completed' : '⏳ In progress'}
          </p>

          <audio
            ref={audioRef}
            onTimeUpdate={handleAudioProgress}
            onEnded={nextLesson}
            style={{ display: 'none' }}
          >
            <source src={`http://localhost:5000/uploads/${currentLesson.audio}`} type="audio/mpeg" />
          </audio>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <input
              type="range"
              min={0}
              max={audioRef.current?.duration || 1}
              value={audioRef.current?.currentTime || 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                audioRef.current.currentTime = val;
                setAudioProgress((val / audioRef.current.duration) * 100);
              }}
              style={{ flex: 1, margin: '0 10px', accentColor: 'var(--accent)' }}
            />
            <span>{formatTime(audioRef.current?.duration || 0)}</span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={toggleAudio}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontWeight: 600,
                marginRight: '1rem'
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶️ Play'}
            </button>
            <button
              onClick={markCompleted}
              disabled={completed.includes(currentLesson._id) || !canMark}
              style={{
                background: completed.includes(currentLesson._id) ? '#444' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontWeight: 600
              }}
            >
              {completed.includes(currentLesson._id) ? '✅ Completed' : 'Mark as Completed'}
            </button>
          </div>
        </div>
      )}

      {/* ✅ Community Card */}
      <div className="card" style={{
        background: '#141414',
        padding: '1.5rem',
        marginTop: '1.5rem'
      }}>
        <h4>🌍 Community Activity</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--subtext)' }}>Check top streaks across the app 🚀</p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {topUsers.slice(0, 3).map((_, i) => (
            <li key={i}>🏅 User #{i + 1}</li>  // No names
          ))}
        </ul>
        <button onClick={() => navigate('/community')} style={{
          marginTop: '1rem',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          fontWeight: 600
        }}>
          Open Community
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
