import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUpload.css';

const AdminUpload = () => {
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    audio: null
  });
  const [lessons, setLessons] = useState([]);

  // Redirect if not kayaniadmin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.username !== 'kayaniadmin') {
      alert('Access denied');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/lessons');
        setLessons(res.data);
      } catch (err) {
        console.error('Failed to load lessons', err);
      }
    };
    fetchLessons();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setLessonData({ ...lessonData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('title', lessonData.title);
    form.append('description', lessonData.description);
    form.append('audio', lessonData.audio);

    try {
      await axios.post('http://localhost:5000/api/lessons/upload', form);
      alert('Lesson uploaded!');
      setLessonData({ title: '', description: '', audio: null });

      // Refresh list
      const res = await axios.get('http://localhost:5000/api/lessons');
      setLessons(res.data);
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-upload-container">
      <div className="admin-upload-box">
        <h2>Upload a Lesson</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            name="title"
            placeholder="Lesson Title"
            value={lessonData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Lesson Description"
            value={lessonData.description}
            onChange={handleChange}
            rows="4"
            required
          />
          <input type="file" name="audio" accept="audio/*" onChange={handleChange} required />
          <button type="submit">Upload Lesson</button>
        </form>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '1.5rem',
            backgroundColor: '#336235',
            width: '200px',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'block'
          }}
        >
          Logout
        </button>
      </div>

      {/* Lesson List */}
      <div style={{ marginTop: '2rem', maxWidth: '600px', marginInline: 'auto' }}>
        <h3>Uploaded Lessons</h3>
        {lessons.length === 0 ? (
          <p>No lessons uploaded yet.</p>
        ) : (
          lessons.map((lesson) => (
            <div
              key={lesson._id}
              style={{
                background: '#f1f1f1',
                marginBottom: '1rem',
                padding: '1rem',
                borderRadius: '10px'
              }}
            >
              <h4>{lesson.title}</h4>
              <p>{lesson.description}</p>
              {lesson.audio && (
                <audio controls style={{ width: '100%' }}>
                  <source src={`http://localhost:5000/uploads/${lesson.audio}`} type="audio/mpeg" />
                </audio>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUpload;
