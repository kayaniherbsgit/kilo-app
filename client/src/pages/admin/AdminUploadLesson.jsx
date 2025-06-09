import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/AdminUpload.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/admin/EditLesson.css';

const AdminUpload = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('');
  const [audio, setAudio] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [showNewAudio, setShowNewAudio] = useState(false);
  const [showNewThumbnail, setShowNewThumbnail] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!day || isNaN(day)) newErrors.day = 'Valid day number required';
    if (!audio) newErrors.audio = 'Audio file is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('day', day);
    formData.append('duration', duration);
    formData.append('level', level);
    if (audio) formData.append('audio', audio);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    try {
      await axios.post('https://kilo-app-backend.onrender.com/api/lessons', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('✅ Lesson uploaded!');
      navigate('/admin/lessons');
    } catch (err) {
      alert('❌ Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    setAudio(file);
    setShowNewAudio(true);
    setErrors({ ...errors, audio: null });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    setShowNewThumbnail(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetAudio = () => {
    setAudio(null);
    setShowNewAudio(false);
  };

  const resetThumbnail = () => {
    setThumbnail(null);
    setShowNewThumbnail(false);
    setPreviewURL('');
  };

  return (
    <div className="edit-lesson-container">
      <button onClick={() => navigate('/admin')} className="neon-btn" style={{ marginBottom: '1.5rem' }}>
        🔙 Back to Dashboard
      </button>

      <h2 className="edit-title">📤 Upload New Lesson</h2>

      <form onSubmit={handleSubmit} className="edit-lesson-form">
        <label>📝 Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: null }); }}
          required
          placeholder="Enter lesson title"
        />
        {errors.title && <span className="error-text">{errors.title}</span>}

        <label>📄 Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Briefly describe what this lesson covers"
        />

        <label>📅 Day</label>
        <input
          type="number"
          value={day}
          onChange={(e) => { setDay(e.target.value); setErrors({ ...errors, day: null }); }}
          required
          placeholder="e.g. 1 for Day 1"
        />
        {errors.day && <span className="error-text">{errors.day}</span>}

        <label>⏱ Duration</label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 8 minutes"
        />

        <label>🎧 Level</label>
        <input
          type="text"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="e.g. Beginner, Intermediate, Advanced"
        />

        <label>🎵 Upload Audio</label>
        <input type="file" accept="audio/*" onChange={handleAudioChange} title="Choose audio file" />
        {errors.audio && <span className="error-text">{errors.audio}</span>}

        <AnimatePresence>
          {showNewAudio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>New Audio: {audio?.name}</span>
              <button type="button" onClick={resetAudio} className="neon-btn">❌ Remove</button>
            </motion.div>
          )}
        </AnimatePresence>

        <label>🖼️ Upload Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} title="Choose image" />

        <AnimatePresence>
          {showNewThumbnail && previewURL && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: '1rem', textAlign: 'center' }}
            >
              <img src={previewURL} alt="Preview" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px' }} />
              <button type="button" onClick={resetThumbnail} className="neon-btn" style={{ marginTop: '0.5rem' }}>
                ❌ Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" className="floating-save-btn" disabled={uploading}>
          {uploading ? '⏳ Uploading...' : '💾 Save Lesson'}
        </button>
      </form>
    </div>
  );
};

export default AdminUpload;