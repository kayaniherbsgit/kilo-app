// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import BottomNav from '../components/BottomNav';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import notificationSound from '../assets/notification.mp3';
import '../styles/Home.css';
import AudioCard from '../components/AudioCard';
import { toast } from 'react-toastify';

const Home = () => {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    // If there’s a saved lesson ID, initialize to null so we restore after fetch:
    const savedId = localStorage.getItem('lastPlayedLessonId');
    return savedId ? null : 0;
  });
  const [completed, setCompleted] = useState([]);
  const [audioProgress, setAudioProgress] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [topUsers, setTopUsers] = useState([]);
  const bellRef = useRef();
  const navigate = useNavigate();

  // 1) On mount, read user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  // 2) Fetch lessons ONCE when user is known
  useEffect(() => {
    if (!user?.username) return;

    const fetchLessons = async () => {
      try {
        const res = await axios.get('https://kilo-app-backend.onrender.com/api/lessons');
        const sorted = res.data.sort((a, b) => a.day - b.day);
        setLessons(sorted);

        // Restore currentIndex if it was null
        if (currentIndex === null) {
          const lastLessonId = localStorage.getItem('lastPlayedLessonId');
          if (lastLessonId) {
            const idx = sorted.findIndex((l) => l._id === lastLessonId);
            setCurrentIndex(idx !== -1 ? idx : 0);
          } else {
            setCurrentIndex(0);
          }
        }

        // Auto-unlock toast for next lesson
        const nextLesson = sorted.find(
          (lesson, idx) =>
            !completed.includes(lesson._id) &&
            (idx === 0 || completed.includes(sorted[idx - 1]?._id))
        );
        if (nextLesson) {
          toast.success(`🎉 Day ${nextLesson.day} is unlocked!`);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      }
    };

    fetchLessons();
  }, [user]);

  // 3) Fetch completed state, streak, unread, and leaderboard
  useEffect(() => {
    if (!user?.username) return;

    // User state (completed lessons + audio progress)
    axios
      .get(`https://kilo-app-backend.onrender.com/api/users/state/${user.username}`)
      .then((res) => {
        setCompleted(res.data.completedLessons || []);
        setAudioProgress(res.data.audioProgress || {});
      })
      .catch((err) => console.error('Error fetching user state:', err));

    // Streak
    axios
      .get(`https://kilo-app-backend.onrender.com/api/users/streak/${user.username}`)
      .then((res) => {
        setStreak(res.data.streak || 0);
        if (res.data.streak === 7) {
          confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
        }
      })
      .catch((err) => console.error('Error fetching streak:', err));

    // Unread notifications
    axios
      .get(`https://kilo-app-backend.onrender.com/api/notifications/unread/${user.username}`)
      .then((res) => {
        setUnreadCount(res.data.unreadCount || 0);
      })
      .catch((err) => console.error('Error fetching unread count:', err));

    // Community leaderboard
    axios
      .get(`https://kilo-app-backend.onrender.com/api/community/leaderboard`)
      .then((res) => {
        setTopUsers(res.data || []);
      })
      .catch((err) => console.error('Error fetching leaderboard:', err));

    // Show streak card once (or 30% of the time after)
    const once = localStorage.getItem('showStreakOnce');
    if (!once) {
      setShowStreak(true);
      localStorage.setItem('showStreakOnce', 'true');
    } else if (Math.random() < 0.3) {
      setShowStreak(true);
    }
  }, [user, completed]);

  // Persist currentIndex whenever it changes
  const saveIndex = async (newIndex) => {
    setCurrentIndex(newIndex);
    const lessonId = lessons[newIndex]?._id;
    if (lessonId) {
      localStorage.setItem('lastPlayedLessonId', lessonId);
      try {
        await axios.post(
          'https://kilo-app-backend.onrender.com/api/users/current-lesson',
          { lessonId },
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
      } catch (err) {
        console.error('Failed to save current lesson index:', err.message);
      }
    }
  };

  const nextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      saveIndex(currentIndex + 1);
    }
  };

  const prevLesson = () => {
    if (currentIndex > 0) {
      saveIndex(currentIndex - 1);
    }
  };

  // Mark lesson complete
  const markCompleted = async (lessonId) => {
    if (!completed.includes(lessonId)) {
      const updated = [...completed, lessonId];
      setCompleted(updated);
      try {
        await axios.post(
          'https://kilo-app-backend.onrender.com/api/users/mark-complete',
          { lessonId },
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
      } catch (err) {
        console.error('Error saving completion:', err.message);
      }
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      toast.success('✅ Lesson Completed!', {
        position: 'bottom-center',
        autoClose: 1800,
        hideProgressBar: false,
        theme: 'dark',
      });
    }
  };

  // Swipe handlers
  const swipe = useSwipeable({
    onSwipedLeft: nextLesson,
    onSwipedRight: prevLesson,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Bell click
  const handleBellClick = () => {
    bellRef.current?.play();
    navigate('/notifications');
  };

  const totalCompletedPercent = lessons.length
    ? Math.round((completed.length / lessons.length) * 100)
    : 0;

  // If lessons aren’t loaded yet, show loading
  if (lessons.length === 0 || currentIndex === null) {
    return <p>Loading lessons…</p>;
  }

  const currentLesson = lessons[currentIndex];

  return (
    <div
      {...swipe}
      style={{
        padding: '1.5rem',
        paddingBottom: '7rem',
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      <audio ref={bellRef} src={notificationSound} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.2rem',
        }}
      >
        <div>
          <h2 className="gradient-title">Hi, {user?.username || 'Guest'}</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--subtext)' }}>
            🎯 Completed {totalCompletedPercent}%
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            onClick={handleBellClick}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
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
                    : `https://kilo-app-backend.onrender.com${
                        user?.avatar || '/uploads/default.png'
                      }`
                }
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
          const isUnlocked =
            index === 0 || completed.includes(lessons[index - 1]?._id);
          const isActive = index === currentIndex;

          const triggerShake = (idx) => {
            const tab = document.getElementById(`day-tab-${idx}`);
            if (tab) {
              tab.classList.add('shake');
              setTimeout(() => tab.classList.remove('shake'), 500);
            }

            const lockedDay = lessons[idx];
            const requiredDay = lessons[idx - 1];

            if (lockedDay && requiredDay) {
              toast.info(`⛔ You must complete Day ${requiredDay.day} first!`, {
                position: 'bottom-center',
                autoClose: 2000,
                theme: 'dark',
              });
            } else {
              toast.info(`⛔ This lesson is locked.`, {
                position: 'bottom-center',
                autoClose: 2000,
                theme: 'dark',
              });
            }
          };

          return (
            <button
              id={`day-tab-${index}`}
              key={lesson._id}
              className={`day-tab
                ${isActive ? 'active-day' : ''}
                ${completed.includes(lesson._id) ? 'completed-day' : ''}
                ${!isUnlocked ? 'locked-day' : ''}`}
              onClick={() => {
                if (isUnlocked) {
                  saveIndex(index);
                } else {
                  triggerShake(index);
                }
              }}
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
          onNext={nextLesson}
          onPrev={prevLesson}
          onMarkComplete={markCompleted}
        />
      )}

      {/* ——— Re-inserted Community Activity Card ——— */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h4>🌍 Community Activity</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--subtext)' }}>
          Check top streaks across the app 🚀
        </p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {topUsers.slice(0, 3).map((u, i) => (
            <li key={i}>
              🏅 {u.username} — 🔥 {u.streak} days
            </li>
          ))}
        </ul>
        <button
          onClick={() => navigate('/community')}
          className="neon-btn"
          style={{ marginTop: '1rem' }}
        >
          Open Community
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
