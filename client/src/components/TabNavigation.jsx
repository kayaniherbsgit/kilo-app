// components/AdminTabNavigation.jsx
import React from 'react';

const AdminTabNavigation = ({ tab, setTab, handleLogout, editLesson }) => {
  const tabItems = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'upload', label: editLesson ? '✏️ Edit Lesson' : '📤 Upload Lesson' },
    { key: 'lessons', label: '🎧 All Lessons' },
    { key: 'users', label: '👥 Users' },
    { key: 'logs', label: '📋 Logs' },
    { key: 'notifications', label: '🔔 Notifications' },
  ];

  return (
    <div className="admin-tab-cards">
      {tabItems.map(({ key, label }) => (
        <div key={key} className={`tab-card ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
          {label}
        </div>
      ))}
      <div className="tab-card logout" onClick={handleLogout}>🚪 Logout</div>
    </div>
  );
};

export default AdminTabNavigation;
