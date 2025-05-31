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
  const [timeline, setTimeline] = useState({});
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
        console.error('Error fetching lessons or progress:', err);
      }
    };

    fetchData();
  }, []);

  const groupTimeline = (logs) => {
    const now = new Date();
    const grouped = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };

    logs.forEach(log => {
      const time = new Date(log.timestamp);
      const diff = (now - time) / (1000 * 60 * 60 * 24);

      if (diff < 1) grouped.Today.push(log);
      else if (diff < 2) grouped.Yesterday.push(log);
      else if (diff < 7) grouped['Last 7 Days'].push(log);
      else grouped.Older.push(log);
    });

    return grouped;
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser?.username) return;

    const fetchTimeline = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/activity/${storedUser.username}`);
        const grouped = groupTimeline(res.data || []);
        setTimeline(grouped);
      } catch (err) {
        console.error('Timeline fetch error', err);
      }
    };

    fetchTimeline();
    const interval = setInterval(fetchTimeline, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Only count lessons that actually exist
  const validCompleted = completed.filter(id => lessons.some(l => l._id === id));
  const completedCount = validCompleted.length;
  const totalCount = lessons.length;
  const percent = totalCount === 0 ? 0 : Math.min(Math.round((completedCount / totalCount) * 100), 100);

  const getRank = () => {
    if (percent === 100) return '👑 Master';
    if (percent >= 70) return '🔥 Pro';
    if (percent >= 30) return '⚡ Intermediate';
    return '🌱 Beginner';
  };

  const getTodayCompletions = () => {
    const today = new Date().toISOString().slice(0, 10);
    return lessons.filter(
      l => validCompleted.includes(l._id) && l.updatedAt?.slice(0, 10) === today
    ).length;
  };

  const topListened = [...lessons]
    .filter(l => validCompleted.includes(l._id))
    .sort((a, b) => parseInt(b.duration) - parseInt(a.duration))[0];

  const filterLessons = () => {
    if (filter === 'completed') return lessons.filter(l => validCompleted.includes(l._id));
    if (filter === 'pending') return lessons.filter(l => !validCompleted.includes(l._id));
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
        <p>Remaining: <strong>{Math.max(totalCount - completedCount, 0)}</strong></p>
        <p>📅 Today: <strong>{getTodayCompletions()}</strong> lessons</p>
        <p>🏅 Rank: <strong>{getRank()}</strong></p>
        {topListened && (
          <p>🎧 Top Lesson: <strong>{topListened.title}</strong></p>
        )}
      </div>

      {/* Timeline */}
      <div className="card scrollable-timeline fade-in">
        <h4>📜 Your Timeline</h4>
        {Object.keys(timeline).map(label => (
          timeline[label].length > 0 && (
            <div key={label}>
              <h5 style={{ marginTop: '1rem', color: 'var(--subtext)' }}>{label}</h5>
              <ul style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>
                {timeline[label].map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        background: item.message.includes('Finished') ? '#b4ff39'
                          : item.message.includes('Commented') ? '#39d9ff'
                          : item.message.includes('Logged in') ? '#ffd639'
                          : '#ccc',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        display: 'inline-block',
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      {item.message.includes('Finished') && '✅ '}
                      {item.message.includes('Commented') && '💬 '}
                      {item.message.includes('Logged in') && '🔑 '}
                      {item.message.includes('Started') && '▶️ '}
                      {item.message}
                    </div>
                    <br />
                    <small style={{ color: 'var(--subtext)', marginLeft: '0.5rem' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
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
            const isDone = validCompleted.map(String).includes(lesson._id.toString());
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
