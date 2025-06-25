import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import BottomNav from '../components/BottomNav';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import notificationSound from '../assets/notification.mp3';
import '../styles/Home.css';
import AudioCard from '../components/AudioCard';

const Home = () => {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [audioProgress, setAudioProgress] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [topUsers, setTopUsers] = useState([]);
  const bellRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) return navigate('/login');
    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (!user?.username) return;

    const fetchData = async () => {
      try {
        const [lessonsRes, stateRes, streakRes, notifRes, leaderboardRes] = await Promise.all([
          axios.get('http://localhost:5000/api/lessons'),
          axios.get(`http://localhost:5000/api/users/state/${user.username}`),
          axios.get(`http://localhost:5000/api/users/streak/${user.username}`),
          axios.get(`http://localhost:5000/api/notifications/unread/${user.username}`),
          axios.get('http://localhost:5000/api/community/leaderboard')
        ]);

        const sortedLessons = lessonsRes.data.sort((a, b) => a.day - b.day);
        setLessons(sortedLessons);

        const savedUser = JSON.parse(localStorage.getItem('user'));
        const storedLessonMap = JSON.parse(localStorage.getItem('userLessonMap')) || {};

        let startIndex = 0;
        if (savedUser?.username && storedLessonMap[savedUser.username]) {
          const savedLessonId = storedLessonMap[savedUser.username];
          const idx = sortedLessons.findIndex(l => l._id === savedLessonId);
          if (idx !== -1) startIndex = idx;
        }
        setCurrentIndex(startIndex);

        setCompleted(stateRes.data.completedLessons || []);
        setAudioProgress(stateRes.data.audioProgress || {});
        setStreak(streakRes.data.streak || 0);
        setUnreadCount(notifRes.data.unreadCount || 0);
        setTopUsers(leaderboardRes.data || []);

        if (streakRes.data.streak === 7) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }

        const once = localStorage.getItem('showStreakOnce');
        if (!once) {
          setShowStreak(true);
          localStorage.setItem('showStreakOnce', 'true');
        } else if (Math.random() < 0.3) {
          setShowStreak(true);
        }
      } catch (err) {
        console.error('🔥 Failed to fetch:', err);
      }
    };

    fetchData();
  }, [user]);

  const saveIndex = async (newIndex) => {
    setCurrentIndex(newIndex);
    const lessonId = lessons[newIndex]?._id;
    if (lessonId) {
      const lessonMap = JSON.parse(localStorage.getItem('userLessonMap')) || {};
      lessonMap[user.username] = lessonId;
      localStorage.setItem('userLessonMap', JSON.stringify(lessonMap));
      await axios.post('http://localhost:5000/api/users/current-lesson', {
        lessonId
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
    }
  };

  const markCompleted = async (lessonId) => {
    if (!completed.includes(lessonId)) {
      const updated = [...completed, lessonId];
      setCompleted(updated);
      await axios.post('http://localhost:5000/api/users/mark-complete', {
        lessonId
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
    }
  };

  const swipe = useSwipeable({
    onSwipedLeft: () => currentIndex < lessons.length - 1 && saveIndex(currentIndex + 1),
    onSwipedRight: () => currentIndex > 0 && saveIndex(currentIndex - 1),
    preventScrollOnSwipe: true,
    trackMouse: true,
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
    <div {...swipe} style={{ padding: '1.5rem', paddingBottom: '7rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <audio ref={bellRef} src={notificationSound} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h2 className="gradient-title">Hi, {user?.username}</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--subtext)' }}>🎯 Completed {totalCompletedPercent}%</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div onClick={handleBellClick} style={{ position: 'relative', cursor: 'pointer' }}>
            <FiBell style={{ fontSize: '1.6rem', color: 'var(--accent)' }} />
            {unreadCount > 0 && <span className="pulse-dot"></span>}
          </div>
          <div style={{ width: 48, height: 48 }}>
            <CircularProgressbarWithChildren
              value={totalCompletedPercent}
              styles={buildStyles({
                pathColor: 'var(--accent)',
                trailColor: '#2e2e2e',
                strokeLinecap: 'round',
              })}
            >
              <img
                src={
                  user?.avatar?.startsWith('http')
                    ? user.avatar
                    : `http://localhost:5000${user?.avatar || '/uploads/default.png'}`
                }
                onError={(e) => {
                  e.target.src = 'http://localhost:5000/uploads/default.png';
                }}
                alt="avatar"
                style={{ width: 30, height: 30, borderRadius: '50%' }}
              />
            </CircularProgressbarWithChildren>
          </div>
        </div>
      </div>

      {showStreak && (
        <div className="card streak-card">
          <h4>🔥 Keep going!</h4>
          <p>You're on a {streak}-day streak. Stay consistent!</p>
        </div>
      )}

      <div className="day-tabs-scroll">
        {lessons.map((lesson, index) => {
          const isUnlocked = index === 0 || completed.includes(lessons[index - 1]._id);
          const isActive = index === currentIndex;
          const isCompleted = completed.includes(lesson._id);

          let tabClass = 'day-tab';
          if (isActive) tabClass += ' active-day';
          else if (isCompleted) tabClass += ' completed-day';
          else if (!isUnlocked) tabClass += ' locked-day';

          return (
            <button
              key={lesson._id}
              className={tabClass}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && saveIndex(index)}
            >
              Day {lesson.day}
            </button>
          );
        })}
      </div>

      {currentLesson && (
        <AudioCard
          lesson={currentLesson}
          currentIndex={currentIndex}
          totalLessons={lessons.length}
          completed={completed}
          audioProgress={audioProgress}
          username={user?.username}
          onNext={() => currentIndex < lessons.length - 1 && saveIndex(currentIndex + 1)}
          onPrev={() => currentIndex > 0 && saveIndex(currentIndex - 1)}
          onMarkComplete={markCompleted}
        />
      )}

      <div className="card" style={{ marginTop: '1.5rem', background: '#151515' }}>
        <h4>🌍 Community Activity</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--subtext)' }}>Check top streaks across the app 🚀</p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {topUsers.slice(0, 3).map((_, i) => (
            <li key={i}>🏅 User #{i + 1}</li>
          ))}
        </ul>
        <button onClick={() => navigate('/community')} className="neon-btn" style={{ marginTop: '1rem' }}>
          Open Community
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;