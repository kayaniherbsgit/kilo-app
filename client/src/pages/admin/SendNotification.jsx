import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BackToDashboard from '../../components/admin/BackToDashboard';

const SendNotification = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', target: 'all' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('https://kilo-app-backend.onrender.com/api/users/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message) return alert('Write something first.');

    try {
      await axios.post(
        'https://kilo-app-backend.onrender.com/api/admin/notifications',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Notification sent!');
      setForm({ title: '', message: '', target: 'all' });
    } catch (err) {
      console.error(err);
      alert('❌ Failed to send notification.');
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', margin: '2rem', background: '#202020' }}>
      <BackToDashboard />
      <h2 style={{ color: '#b4ff39' }}>📣 Send Custom Notification</h2>
      <form onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Optional Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={inputStyle}
        />
        <textarea
          placeholder="Your message here..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ ...inputStyle, minHeight: '100px' }}
        />
        <select
          value={form.target}
          onChange={(e) => setForm({ ...form, target: e.target.value })}
          style={inputStyle}
        >
          <option value="all">📢 Send to All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select>
        <button type="submit" className="neon-btn" style={{ marginTop: '1rem' }}>
          🚀 Send
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '8px',
  border: '1px solid #444',
  background: '#111',
  color: '#fff',
};

export default SendNotification;