import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ThemeSwitcher from '../components/ThemeSwitcher';
import '../styles/Activity.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import LessonCard from '../components/LessonCard';

const Activity = () => {
  const [completed, setCompleted] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    const fetchData = async () => {
      try {
          const lessonsRes = await axios.get('http://localhost:5000/api/lessons');
          const sortedLessons = lessonsRes.data.sort((a, b) => a.day - b.day);
          setLessons(sortedLessons);

        if (storedUser?.username) {
          const progressRes = await axios.get(`http://localhost:5000/api/users/state/${storedUser.username}`);
          setCompleted(progressRes.data.completedLessons || []);
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
      }
    };

    fetchData();
  }, []);

  const completedCount = completed.length;
  const totalCount = lessons.length;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getRank = () => {
    if (percent === 100) return '👑 Master';
    if (percent >= 70) return '🔥 Pro';
    if (percent >= 30) return '⚡ Intermediate';
    return '🌱 Beginner';
  };

  const getTodayCompletions = () => {
    const today = new Date().toISOString().slice(0, 10);
    return lessons.filter(
      l => completed.includes(l._id) && l.updatedAt?.slice(0, 10) === today
    ).length;
  };

  const topListened = [...lessons]
    .filter(l => completed.includes(l._id))
    .sort((a, b) => parseInt(b.duration) - parseInt(a.duration))[0];

  const filterLessons = () => {
    if (filter === 'completed') {
      return lessons.filter(l => completed.includes(l._id));
    }
    if (filter === 'pending') {
      return lessons.filter(l => !completed.includes(l._id));
    }
    return lessons;
  };

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '6rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <ThemeSwitcher />
      <h2 style={{ marginBottom: '1.5rem' }}>📊 Your Activity</h2>

      <div style={{ maxWidth: '180px', margin: '0 auto 1.5rem' }}>
        <CircularProgressbar
          value={percent}
          text={`${percent}%`}
          styles={buildStyles({
            textColor: '#fff',
            pathColor: 'limegreen',
            trailColor: '#333',
          })}
        />
        <p style={{ textAlign: 'center', color: 'var(--subtext)', marginTop: '0.5rem' }}>
          Overall Progress
        </p>
      </div>

      <div className="card">
        <h4>📦 Summary</h4>
        <p>Completed: <strong>{completedCount}</strong></p>
        <p>Total Lessons: <strong>{totalCount}</strong></p>
        <p>Remaining: <strong>{totalCount - completedCount}</strong></p>
        <p>📅 Today: <strong>{getTodayCompletions()}</strong> lessons</p>
        <p>🏅 Rank: <strong>{getRank()}</strong></p>
        {topListened && (
          <p>🎧 Top Lesson: <strong>{topListened.title}</strong></p>
        )}
      </div>

      <div className="card">
        <h4>🌓 Filter</h4>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="neon-btn" onClick={() => setFilter('all')}>All</button>
          <button className="neon-btn" onClick={() => setFilter('completed')}>✅ Completed</button>
          <button className="neon-btn" onClick={() => setFilter('pending')}>⏳ Pending</button>
        </div>
      </div>

      <div className="card">
        <h4>📚 Lesson Breakdown</h4>
        <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
          {filterLessons().map((lesson) => {
            const isDone = completed.map(String).includes(lesson._id.toString());
            return (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                isDone={isDone}
                onClick={() => {
                  localStorage.setItem('lastPlayedLessonId', lesson._id);
                  navigate('/home');
                }}
              />
            );
          })}
        </ul>
      </div>

      <BottomNav />
    </div>
  );
};

export default Activity;
