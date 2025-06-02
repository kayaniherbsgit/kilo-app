// src/pages/admin/EditLesson.jsx
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
  const [audio, setAudio] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    axios.get(`https://kilo-app-backend.onrender.com/api/lessons/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setLesson(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description);
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
    if (audio) formData.append('audio', audio);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    try {
      await axios.put(`https://kilo-app-backend.onrender.com/api/lessons/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('✅ Lesson updated!');
      navigate('/admin/lessons');
    } catch (err) {
      alert('❌ Update failed');
      console.error(err);
    }
  };

  if (!lesson) return <p>Loading lesson...</p>;

  return (
    <div className="edit-lesson">
      <h2>✏️ Edit Lesson</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />

        <label>
          Replace Audio:
          <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />
        </label>

        <label>
          Replace Thumbnail:
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
        </label>

        <button type="submit">Update Lesson</button>
      </form>
    </div>
  );
};

export default EditLesson;
