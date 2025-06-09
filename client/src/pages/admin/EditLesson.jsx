import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminLessons.css';

const EditLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [lesson, setLesson] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('');
  const [audio, setAudio] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [audioURL, setAudioURL] = useState('');

  useEffect(() => {
    axios.get(`https://kilo-app-backend.onrender.com/api/lessons/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setLesson(res.data);
      setTitle(res.data.title || '');
      setDescription(res.data.description || '');
      setDay(res.data.day || '');
      setDuration(res.data.duration || '');
      setLevel(res.data.level || '');
      setPreviewURL(res.data.thumbnail);
      setAudioURL(res.data.audio);
    }).catch(err => {
      alert('Failed to fetch lesson');
      console.error(err);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('day', day);
    formData.append('duration', duration);
    formData.append('level', level);
    if (audio) formData.append('audio', audio);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    try {
      await axios.put(`https://kilo-app-backend.onrender.com/api/lessons/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('✅ Lesson updated!');
      navigate('/admin/lessons');
    } catch (err) {
      alert('❌ Update failed');
      console.error(err);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!lesson) return <p style={{ color: '#ccc', textAlign: 'center' }}>Loading lesson...</p>;

  return (
    <div className="edit-lesson-container">
      <button onClick={() => navigate('/admin')} className="neon-btn" style={{ marginBottom: '1.5rem' }}>
        🔙 Back to Dashboard
      </button>

      <h2 className="edit-title">✏️ Edit Lesson</h2>

      <form onSubmit={handleSubmit} className="edit-lesson-form">
        <label>📝 Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>📄 Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />

        <label>📅 Day</label>
        <input type="number" value={day} onChange={(e) => setDay(e.target.value)} required />

        <label>⏱ Duration</label>
        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} />

        <label>🎧 Level</label>
        <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} />

        <label>🔁 Current Audio</label>
        {audioURL && <audio src={`https://kilo-app-backend.onrender.com${audioURL}`} controls style={{ marginBottom: '1rem' }} />}

        <label>🎵 Replace Audio</label>
        <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />

        <label>🖼️ Current Thumbnail</label>
        {previewURL && <img src={`https://kilo-app-backend.onrender.com${previewURL}`} alt="Preview" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', marginBottom: '1rem' }} />}

        <label>🖼️ Replace Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
      </form>

      {/* Floating Save Button */}
      <button onClick={handleSubmit} className="floating-save-btn">
        💾 Update Lesson
      </button>
    </div>
  );
};

export default EditLesson;