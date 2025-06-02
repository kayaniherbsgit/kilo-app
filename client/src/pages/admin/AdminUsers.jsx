// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://kilo-app-backend.onrender.com/api/users/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const deleteUser = async (id, username) => {
    if (!window.confirm(`⚠️ Delete ${username}? This cannot be undone.`)) return;

    try {
      await axios.delete(`https://kilo-app-backend.onrender.com/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`${username} deleted successfully.`);
      fetchUsers(); // refresh list
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete user.');
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card" style={{ padding: '2rem', background: '#202020', margin: '2rem' }}>
      <button
        onClick={() => navigate('/admin')}
        style={{
          marginBottom: '1rem',
          background: '#b4ff39',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        🔙 Back to Dashboard
      </button>

      <h2 style={{ color: '#b4ff39' }}>👥 Manage Users</h2>
      <input
        type="text"
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '10px',
          border: '1px solid #444',
          background: '#111',
          color: '#fff'
        }}
      />

      {filtered.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filtered.map((user) => (
            <li
              key={user._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                borderBottom: '1px solid #333'
              }}
            >
              <div>
                <strong>{user.username}</strong> <br />
                <small>🔥 {user.streak || 0} streak — ✅ {user.completedLessons?.length || 0} lessons</small>
              </div>
              <button
                onClick={() => deleteUser(user._id, user.username)}
                style={{
                  background: '#ff3d3d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.4rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminUsers;