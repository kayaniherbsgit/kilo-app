import React from 'react';
import '../styles/UserModal.css';

const UserModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <img
          src={`${import.meta.env.VITE_API_URL}/uploads/${user.avatar || 'default.png'}`}
          alt="avatar"
          className="user-avatar"
        />
        <h3>{user.username}</h3>
        <p>🔥 {user.streak || 0} day streak</p>
        <p>✅ {user.completedLessons?.length || 0} lessons completed</p>

        <div className="lesson-list">
          <strong>Completed Lessons:</strong>
          <ul>
            {(user.completedLessons || []).map((l, i) => (
              <li key={i}>✔️ {l.title || `Lesson ${i + 1}`}</li>
            ))}
          </ul>
        </div>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default UserModal;