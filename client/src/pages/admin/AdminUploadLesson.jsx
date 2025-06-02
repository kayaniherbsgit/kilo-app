import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/AdminUpload.css';
import { useNavigate } from 'react-router-dom';

const AdminUploadLesson  = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audio, setAudio] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [day, setDay] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !audio || !day) return alert('Title, Day, and Audio are required');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('audio', audio);
    if (thumbnail) formData.append('thumbnail', thumbnail);
    formData.append('day', day);
    formData.append('duration', duration);
    formData.append('level', level);

    try {
      setLoading(true);
      await axios.post('https://kilo-app-backend.onrender.com/api/lessons', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('✅ Lesson uploaded!');
      setTitle('');
      setDescription('');
      setAudio(null);
      setThumbnail(null);
      setDay('');
      setDuration('');
      setLevel('');
      setLoading(false);
      navigate('/admin/lessons');
    } catch (err) {
      console.error('Upload failed', err);
      alert('❌ Upload failed');
      setLoading(false);
    }
  };

  return (
        <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/admin')} className="neon-btn" style={{ marginBottom: '1rem' }}>
        🔙 Back to Dashboard
      </button>

    
    <div className="upload-container">
      <h2>📤 Upload New Lesson</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input type="text" placeholder="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="number" placeholder="Day Number" value={day} onChange={(e) => setDay(e.target.value)} required />
        <input type="text" placeholder="Duration (e.g. 5 mins)" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <input type="text" placeholder="Level (Beginner/Advanced)" value={level} onChange={(e) => setLevel(e.target.value)} />
        <textarea placeholder="Lesson Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <label>
          🎵 Audio File:
          <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} required />
        </label>
        <label>
          🖼️ Thumbnail (optional):
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Lesson'}
        </button>
      </form>
    </div>
    </div>

  );
};

export default AdminUploadLesson;