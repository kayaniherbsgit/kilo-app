import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Optional, for animation
import "../../styles/admin/EditLesson.css";

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
  const [showNewAudio, setShowNewAudio] = useState(false);
  const [showNewThumbnail, setShowNewThumbnail] = useState(false);

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
    setShowNewThumbnail(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    setAudio(file);
    setShowNewAudio(true);
  };

  const resetThumbnail = () => {
    setThumbnail(null);
    setPreviewURL(lesson.thumbnail);
    setShowNewThumbnail(false);
  };

  const resetAudio = () => {
    setAudio(null);
    setShowNewAudio(false);
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
        {!showNewAudio && audioURL && (
          <audio src={`https://kilo-app-backend.onrender.com${audioURL}`} controls style={{ marginBottom: '1rem' }} />
        )}

        <label>🎵 Replace Audio</label>
        <input type="file" accept="audio/*" onChange={handleAudioChange} />
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

        <label>🖼️ Current Thumbnail</label>
        {!showNewThumbnail && previewURL && (
          <img src={`https://kilo-app-backend.onrender.com${previewURL}`} alt="Current Thumbnail"
            style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', marginBottom: '1rem' }}
          />
        )}

        <label>🖼️ Replace Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
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
      </form>

      <button onClick={handleSubmit} className="floating-save-btn">
        💾 Update Lesson
      </button>
    </div>
  );
};

export default EditLesson;