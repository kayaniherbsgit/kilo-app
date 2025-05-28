// Updated AdminDashboard.jsx with Circular Thumbnail & Drag-Drop Support
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import io from 'socket.io-client';
import DropZone from '../components/DropZone';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [lessons, setLessons] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editLesson, setEditLesson] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lessonData, setLessonData] = useState({
    title: '', description: '', day: '', duration: '', level: '', audio: null, thumbnail: null
  });

  const [stats, setStats] = useState({
    totalUsers: 0, totalLessons: 0, averageStreak: 0, usersByDay: [], lessonsByDay: []
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.username !== 'kayaniadmin') {
      alert('Access denied');
      navigate('/login');
      return;
    }

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    fetchAllData();

    newSocket.on('statsUpdated', fetchStats);
    newSocket.on('notificationsUpdated', fetchNotifications);
    newSocket.on('logsUpdated', fetchLogs);
    newSocket.on('lessonUploaded', ({ title }) => {
      fetchAllData();
      alert(`📢 New lesson uploaded: ${title}`);
    });

    const interval = setInterval(fetchAllData, 30000);
    return () => {
      newSocket.disconnect();
      clearInterval(interval);
    };
  }, [navigate]);

  const fetchAllData = () => {
    fetchLessons();
    fetchUsers();
    fetchLogs();
    fetchNotifications();
    fetchStats();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(lessonData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      await axios.post('http://localhost:5000/api/lessons', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      alert('Lesson uploaded!');
      setLessonData({ title: '', description: '', day: '', duration: '', level: '', audio: null, thumbnail: null });
      setPreview(null);
      fetchAllData();
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditLesson(lesson);
    setLessonData({
      title: lesson.title, description: lesson.description, day: lesson.day, duration: lesson.duration,
      level: lesson.level, audio: null, thumbnail: null
    });
    setPreview(null);
    setTab('upload');
  };

  const handleUpdateLesson = async () => {
    const formData = new FormData();
    Object.entries(lessonData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      await axios.put(`http://localhost:5000/api/lessons/${editLesson._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      alert('Lesson updated!');
      setEditLesson(null);
      setLessonData({ title: '', description: '', day: '', duration: '', level: '', audio: null, thumbnail: null });
      setPreview(null);
      fetchLessons();
    } catch (err) {
      alert('Update failed');
      console.error(err);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) {
      await axios.delete(`http://localhost:5000/api/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLessons();
    }
  };

  const handleDrop = (field) => (file) => {
    setLessonData(prev => ({ ...prev, [field]: file }));
    if (field === 'thumbnail') setPreview(URL.createObjectURL(file));
  };

  const fetchLessons = async () => {
    const res = await axios.get('http://localhost:5000/api/lessons');
    setLessons(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/users/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/activity-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const tabItems = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'upload', label: editLesson ? '✏️ Edit Lesson' : '📤 Upload Lesson' },
    { key: 'lessons', label: '🎧 All Lessons' },
    { key: 'users', label: '👥 Users' },
    { key: 'logs', label: '📋 Logs' },
    { key: 'notifications', label: '🔔 Notifications' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <h2 style={{ color: '#fff' }}>Admin Dashboard</h2>

      <div className="admin-tab-cards">
        {tabItems.map(({ key, label }) => (
          <div key={key} className={`tab-card ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </div>
        ))}
        <div className="tab-card logout" onClick={handleLogout}>🚪 Logout</div>
      </div>

      {tab === 'upload' && (
        <form className="upload-form" onSubmit={(e) => {
          e.preventDefault();
          editLesson ? handleUpdateLesson() : handleSubmit(e);
        }}>
          <input type="text" name="title" placeholder="Lesson Title" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} required />
          <textarea name="description" placeholder="Lesson Description" value={lessonData.description} onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })} required />
          <input type="number" name="day" placeholder="Day (e.g., 1)" value={lessonData.day} onChange={(e) => setLessonData({ ...lessonData, day: e.target.value })} required />
          <input type="text" name="duration" placeholder="Duration (e.g., 5 min)" value={lessonData.duration} onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })} required />
          <input type="text" name="level" placeholder="Level (e.g., Beginner)" value={lessonData.level} onChange={(e) => setLessonData({ ...lessonData, level: e.target.value })} required />

          <DropZone label="🎧 Upload Audio File" accept="audio/*" onFileDrop={handleDrop('audio')} />
          <DropZone label="🖼️ Upload Thumbnail Image" accept="image/*" onFileDrop={handleDrop('thumbnail')} />

          {preview && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ color: '#fff' }}>📷 Thumbnail Preview:</p>
              <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          )}

          <button type="submit" style={{ marginTop: '15px' }}>{editLesson ? 'Update Lesson' : 'Upload Lesson'}</button>
        </form>
      )}

      {tab === 'lessons' && (
        <div className="lesson-list">
          {lessons.map((lesson) => (
            <div key={lesson._id} className="lesson-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {lesson.thumbnail && (
                  <img src={`http://localhost:5000${lesson.thumbnail}`} alt="Thumbnail" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00ffcc', boxShadow: '0 0 8px rgba(0,255,204,0.3)' }} />
                )}
                <h4>{lesson.title}</h4>
              </div>
              <p>{lesson.description}</p>
              {lesson.audio && <audio controls><source src={`http://localhost:5000${lesson.audio}`} /></audio>}
              <button onClick={() => handleEditLesson(lesson)}>Edit</button>
              <button onClick={() => handleDeleteLesson(lesson._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
