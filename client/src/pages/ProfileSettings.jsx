import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [username, setUsername] = useState(storedUser?.username || '');
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('username', username);
    if (avatar) form.append('avatar', avatar);

    try {
      const res = await axios.patch(`http://localhost:5000/api/users/${storedUser._id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('user', JSON.stringify(res.data)); // ✅ FIXED THIS LINE
      alert('✅ Profile updated!');
      navigate('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('❌ Failed to update profile');
    }
  };

  return (
    <div style={{ padding: '2rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Avatar</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          style={{
            background: '#1c651b',
            color: '#fff',
            padding: '0.7rem 1.4rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
