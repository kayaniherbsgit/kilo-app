// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending'); // default to 'pending'
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
      fetchUsers();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete user.');
    }
  };

const approveUser = async (id, username) => {
  try {
    const res = await axios.put(
      `https://kilo-app-backend.onrender.com/api/users/${id}/approve`, 
      {}, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.data.message === 'User was already approved') {
      alert(`${username} was already approved.`);
    } else {
      alert(`${username} has been approved.`);
    }
    
    fetchUsers();
  } catch (err) {
    console.error('Approval failed', err);
    alert(err.response?.data?.message || 'Failed to approve user.');
  }
};
  const filtered = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase());
    const isPending = !user.isApproved && !user.isAdmin;
    return matchesSearch && (filter === 'all' || isPending);
  });

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

      <h2 style={{ color: '#b4ff39' }}>
        ⏳ Pending Approvals
      </h2>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'all' ? '#048547' : '#333',
            color: filter === 'all' ? '#000' : '#ccc',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          All Users
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'pending' ? '#048547' : '#333',
            color: filter === 'pending' ? '#000' : '#ccc',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Pending Only
        </button>
      </div>

      {/* Search */}
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
        <p style={{ color: '#bbb' }}>No users found.</p>
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
                <small>📍 {user.region || 'No region'} — {user.email}</small><br />
                <small>🔥 {user.streak || 0} streak — ✅ {user.completedLessons?.length || 0} lessons</small><br />
                <small>Status: {user.isApproved ? '✅ Approved' : '⏳ Pending'}</small>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {!user.isApproved ? (
                  <button
                    onClick={() => approveUser(user._id, user.username)}
                    style={{
                      background: '#048547',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem 1rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Approve
                  </button>
                ) : (
                  <span style={{
                    background: '#1f1f1f',
                    color: '#b4ff39',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>✅ Approved</span>
                )}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminUsers;