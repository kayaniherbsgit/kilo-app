// components/UserManager.jsx
import React from 'react';

const UserManager = ({ users, searchQuery, setSearchQuery, sortByStreak, setSortByStreak, exportCSV, setSelectedUser }) => {
  const filteredUsers = users
    .filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (sortByStreak ? (b.streak || 0) - (a.streak || 0) : 0));

  return (
    <div className="user-management">
      <div className="user-actions">
        <input
          type="text"
          placeholder="Search username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => setSortByStreak(!sortByStreak)}>
          {sortByStreak ? '🔽 Unsort' : '🔼 Sort by Streak'}
        </button>
        <button onClick={exportCSV}>📁 Export CSV</button>
      </div>
      <ul className="user-list">
        {filteredUsers.map((user, i) => (
          <li key={i} onClick={() => setSelectedUser(user)}>
            <img
              src={`http://localhost:5000${user.avatar && user.avatar !== '' ? user.avatar : '/uploads/default.png'}`}
              alt="avatar"
              className="avatar-img"
            />
            <div>
              <strong>{user.username}</strong>
              <div>🔥 {user.streak || 0} days</div>
              <div>✅ {user.completedLessons?.length || 0} lessons</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManager;
