import React from 'react';

const LessonCard = ({ lesson, isDone, onClick }) => {
  return (
    <li
      onClick={onClick}
      style={{
        margin: '10px 0',
        fontSize: '0.95rem',
        padding: '1rem',
        borderRadius: '12px',
        background: isDone ? '#00ff6a10' : '#ffea0010',
        border: `1px solid ${isDone ? '#00ff6a' : '#ffc107'}`,
        color: isDone ? '#00ff6a' : '#ffc107',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: '0.3s ease',
      }}
    >
      <div>
        <strong>{lesson.title}</strong>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          {isDone ? '✅ Completed' : '⏳ Pending'}
        </div>
      </div>
      <span style={{ fontSize: '1.2rem' }}>🎧</span>
    </li>
  );
};

export default LessonCard;