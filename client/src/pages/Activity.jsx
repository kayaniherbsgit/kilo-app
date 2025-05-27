import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';
import ThemeSwitcher from '../components/ThemeSwitcher';

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

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '6rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <ThemeSwitcher />
      <h2 style={{ marginBottom: '1rem' }}>📊 Your Activity</h2>

      <div className="card">
        <h4>📦 Progress</h4>
        <p>Completed: <strong>{completedCount}</strong></p>
        <p>Total Lessons: <strong>{totalCount}</strong></p>
        <p>Remaining: <strong>{totalCount - completedCount}</strong></p>
      </div>

      <div className="card">
        <h4>📚 Lesson Breakdown</h4>
        <ul style={{ paddingLeft: '1rem' }}>
          {lessons.map(lesson => (
            <li key={lesson._id} style={{ margin: '6px 0', fontSize: '0.9rem' }}>
              {lesson.title}{' '}
              <span className={`badge ${completed.includes(lesson._id) ? 'completed' : 'progress'}`}>
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