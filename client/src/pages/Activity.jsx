import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';
import ThemeSwitcher from '../components/ThemeSwitcher';
import '../styles/Activity.css'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Activity = () => {
  const [completed, setCompleted] = useState([]);
  const [lessons, setLessons] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetch = async () => {
      const res1 = await axios.get('http://localhost:5000/api/lessons');
      setLessons(res1.data.reverse());
      setCompleted(user.lessonProgress || []);
    };
    fetch();
  }, [user]);

  const completedCount = completed.length;
  const totalCount = lessons.length;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '6rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <ThemeSwitcher />
      <h2 style={{ marginBottom: '1.5rem' }}>📊 Your Activity</h2>

      {/* Progress Ring */}
      <div style={{ maxWidth: '180px', margin: '0 auto 2rem' }}>
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

      {/* Progress Card */}
      <div className="card">
        <h4>📦 Summary</h4>
        <p>Completed: <strong>{completedCount}</strong></p>
        <p>Total Lessons: <strong>{totalCount}</strong></p>
        <p>Remaining: <strong>{totalCount - completedCount}</strong></p>
      </div>

      {/* Lesson Breakdown */}
      <div className="card">
        <h4>📚 Lesson Breakdown</h4>
        <ul style={{ paddingLeft: '1rem', listStyle: 'none' }}>
          {lessons.map(lesson => (
            <li
              key={lesson._id}
              style={{
                margin: '10px 0',
                fontSize: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px dashed #333',
                paddingBottom: '6px',
              }}
            >
              <span>{lesson.title}</span>
              <span
                className={`badge ${completed.includes(lesson._id) ? 'completed' : 'progress'}`}
              >
                {completed.includes(lesson._id) ? '✅ Completed' : '⏳ Pending'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </div>
  );
};

export default Activity;