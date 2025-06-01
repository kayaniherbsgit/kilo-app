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
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      const res = await axios.get('${import.meta.env.VITE_API_URL}/api/lessons');
      const sorted = res.data.sort((a, b) => a.day - b.day);
      setLessons(sorted);

      // ✅ Remember last played lesson
      const lastLessonId = localStorage.getItem('lastPlayedLessonId');
if (lastLessonId) {
  const index = sorted.findIndex(l => l._id === lastLessonId);
  if (index !== -1) {
    setCurrentIndex(index);
    toast.info(`📍 Jumped to Day ${sorted[index].day}: ${sorted[index].title}`);
  }
  localStorage.removeItem('lastPlayedLessonId');
}

    };
    fetchLessons();

    if (user?.username) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/users/state/${user.username}`).then(res => {
        setCompleted(res.data.completedLessons || []);
        setAudioProgress(res.data.audioProgress || {});
      });

      axios.get(`${import.meta.env.VITE_API_URL}/api/users/streak/${user.username}`).then(res => {
        setStreak(res.data.streak || 0);
        if (res.data.streak === 7) {
          confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
        }
      });

      axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/unread/${user.username}`).then(res => {
        setUnreadCount(res.data.unreadCount || 0);
      });

      axios.get(`${import.meta.env.VITE_API_URL}/api/community/leaderboard`).then(res => {
        setTopUsers(res.data || []);
      });
    }

    const once = localStorage.getItem('showStreakOnce');
    if (!once) {
      setShowStreak(true);
      localStorage.setItem('showStreakOnce', 'true');
    } else if (Math.random() < 0.3) {
      setShowStreak(true);
    }
  }, [user]);

const saveIndex = async (newIndex) => {
  setCurrentIndex(newIndex);
  const lessonId = lessons[newIndex]?._id;
  if (lessonId) {
    localStorage.setItem('lastPlayedLessonId', lessonId);
    await axios.post('${import.meta.env.VITE_API_URL}/api/users/current-lesson', {
      lessonId,
    }, {
      headers: { Authorization: `Bearer ${user?.token}` }
    });
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

 const markCompleted = async (lessonId) => {
  if (!completed.includes(lessonId)) {
    const updated = [...completed, lessonId];
    setCompleted(updated);
    await axios.post('${import.meta.env.VITE_API_URL}/api/users/mark-complete', {
      lessonId,
    }, {
      headers: { Authorization: `Bearer ${user?.token}` }
    });
  }
};


  const swipe = useSwipeable({
    onSwipedLeft: nextLesson,
    onSwipedRight: prevLesson,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleBellClick = () => {
    bellRef.current?.play();
    navigate('/notifications');
  };

  const totalCompletedPercent = lessons.length
    ? Math.round((completed.length / lessons.length) * 100)
    : 0;

  const currentLesson = lessons[currentIndex];

  return (
    <div {...swipe} style={{ padding: '1.5rem', paddingBottom: '7rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <audio ref={bellRef} src={notificationSound} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h2 className="gradient-title">Hi, {user?.username || 'Guest'}</h2>
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
                src={`${import.meta.env.VITE_API_URL}${user?.avatar || '/uploads/default.png'}`}
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

    return (
      <button
        key={lesson._id}
        className={`day-tab ${isActive ? 'active-day' : ''}`}
        disabled={!isUnlocked}
        onClick={() => {
          if (isUnlocked) {
            saveIndex(index);
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