import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import io from 'socket.io-client';
import DropZone from '../components/DropZone';
import UserModal from '../components/UserModal';
import ActivityLog from '../components/ActivityLog';
import NotificationManager from '../components/NotificationManager';

import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [lessons, setLessons] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editLesson, setEditLesson] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByStreak, setSortByStreak] = useState(false);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // ✅ THIS IS WHAT YOU FORGOT


  const [lessonData, setLessonData] = useState({
    title: '', description: '', day: '', duration: '', level: '', audio: null, thumbnail: null
  });

  const [stats, setStats] = useState({
    totalUsers: 0, totalLessons: 0, averageStreak: 0, usersByDay: [], lessonsByDay: []
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
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
    const res = await axios.get('http://localhost:5000/api/admin/activity-logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLogs(res.data);
  };

  const fetchNotifications = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(res.data);
  };

  const groupedNotifications = () => {
  const groups = {};

  notifications.forEach(note => {
    let type = 'Other';
    const msg = note.message?.toLowerCase() || '';

    if (msg.includes('registered')) type = '🧑 User Registered';
    else if (msg.includes('completed')) type = '✅ Lesson Completed';
    else if (msg.includes('uploaded')) type = '📝 Lesson Uploaded';
    else if (msg.includes('deleted')) type = '🗑 Deleted';
    else if (msg.includes('updated')) type = '✏️ Updated';

    if (!groups[type]) groups[type] = [];
    groups[type].push(note);
  });

  return Object.entries(groups);
};


  const handleDrop = (field) => (file) => {
    setLessonData(prev => ({ ...prev, [field]: file }));
    if (field === 'thumbnail') setPreview(URL.createObjectURL(file));
  };

  const handleEditLesson = (lesson) => {
    setEditLesson(lesson);
    setLessonData({
      title: lesson.title, 
      description: lesson.description, 
      day: lesson.day, 
      duration: lesson.duration,
      level: lesson.level, 
      audio: null, 
      thumbnail: null
    });
    setPreview(lesson.thumbnail ? `http://localhost:5000${lesson.thumbnail}` : null);
    setTab('upload');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(lessonData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    await axios.post('http://localhost:5000/api/lessons', formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
    });

    alert('Lesson uploaded!');
    setLessonData({ title: '', description: '', day: '', duration: '', level: '', audio: null, thumbnail: null });
    setPreview(null);
    fetchAllData();
  };

  const handleUpdateLesson = async () => {
    const formData = new FormData();
    Object.entries(lessonData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    await axios.put(`http://localhost:5000/api/lessons/${editLesson._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
    });

    alert('Lesson updated!');
    setEditLesson(null);
    setModalOpen(false);
    setLessonData({ title: '', description: '', day: '', duration: '', level: '', audio: null, thumbnail: null });
    setPreview(null);
    fetchLessons();
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) {
      await axios.delete(`http://localhost:5000/api/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLessons();
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedLessons.length} selected lessons?`)) {
      await Promise.all(
        selectedLessons.map(id => 
          axios.delete(`http://localhost:5000/api/lessons/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      fetchLessons();
      setSelectedLessons([]);
    }
  };

  const exportCSV = () => {
    const headers = ['Username', 'Streak', 'Completed Lessons', 'Last Accessed'];
    const rows = users.map(user => [
      user.username,
      user.streak || 0,
      user.completedLessons?.length || 0,
      user.lastAccessed?.split('T')[0] || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'user_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users
    .filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (sortByStreak ? (b.streak || 0) - (a.streak || 0) : 0));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

const tabItems = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'upload', label: editLesson ? '✏️ Edit Lesson' : '📤 Upload Lesson' },
  { key: 'lessons', label: '🎧 All Lessons' },
  { key: 'users', label: '👥 Users' },
  { key: 'logs', label: '📋 Logs' },
];

  return (
<div className="admin-dashboard">
      <div className="admin-header">
        <h2 className="gradient-title">Hi, {user?.username || 'Admin'} 👋</h2>

        <div className="notification-bell-container">
          <div className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
            🔔
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-count">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>

    {showDropdown && (
            <div className="notification-dropdown">
              <h4 className="dropdown-title">🔔 Notifications</h4>
              {groupedNotifications().length === 0 ? (
                <p className="no-notifications">No notifications yet.</p>
              ) : (
                groupedNotifications().map(([category, items], i) => (
                  <div key={i} className="notification-group">
                    <h5>{category}</h5>
                    {items.map((note, idx) => (
                      <div
                        key={idx}
                        className={`notification-item ${!note.read ? 'unread' : ''}`}
                      >
                        <div className="note-message">{note.message}</div>
                        <div className="note-time">
                          {new Date(note.createdAt).toLocaleString()}
                   </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div
                className="see-all-btn"
                onClick={() => navigate('/admin/notifications')}
              >
                🔍 See All Notifications
              </div>
            </div>
          )}
        </div>
      </div>

<div className="admin-tab-cards">
        {tabItems.map(({ key, label }) => (
          <div
            key={key}
            className={`tab-card ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </div>
        ))}
        <div className="tab-card logout" onClick={() => {
          localStorage.clear();
          navigate('/login');
        }}>
          🚪 Logout
        </div>
      </div>
      {tab === 'logs' && (
  <ActivityLog logs={logs} />
)}


      {tab === 'upload' && (
        <form className="upload-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Lesson Title" 
            value={lessonData.title} 
            onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} 
            required 
          />
          <textarea 
            placeholder="Lesson Description" 
            value={lessonData.description} 
            onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })} 
            required 
          />
          <input 
            type="number" 
            placeholder="Day" 
            value={lessonData.day} 
            onChange={(e) => setLessonData({ ...lessonData, day: e.target.value })} 
            required 
          />
          <input 
            type="text" 
            placeholder="Duration" 
            value={lessonData.duration} 
            onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })} 
            required 
          />
          <input 
            type="text" 
            placeholder="Level" 
            value={lessonData.level} 
            onChange={(e) => setLessonData({ ...lessonData, level: e.target.value })} 
            required 
          />
          <DropZone label="🎧 Upload Audio File" accept="audio/*" onFileDrop={handleDrop('audio')} />
          <DropZone label="🖼️ Upload Thumbnail" accept="image/*" onFileDrop={handleDrop('thumbnail')} />
          {preview && <img src={preview} alt="Preview" className="thumbnail-preview" />}
          <button type="submit">{editLesson ? 'Update Lesson' : 'Upload Lesson'}</button>
        </form>
      )}

      {tab === 'lessons' && (
        <div className="lessons-grid">
          <div className="lesson-controls">
            <input
              type="text"
              placeholder="Search lessons"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lesson-search"
            />
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="dropdown-items-per-page"
            >
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={20}>Show 20</option>
            </select>
          </div>

          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) return;
              const reordered = [...lessons];
              const [removed] = reordered.splice(result.source.index, 1);
              reordered.splice(result.destination.index, 0, removed);
              setLessons(reordered);

              axios.post('http://localhost:5000/api/admin/reorder-lessons', {
                lessons: reordered.map((lesson, index) => ({
                  id: lesson._id,
                  order: index,
                })),
              });
            }}
          >
            <Droppable droppableId="lessons">
              {(provided) => {
                const filteredLessons = lessons.filter(lesson =>
                  lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
                );

                const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
                const paginatedLessons = filteredLessons.slice(
                  page * itemsPerPage,
                  (page + 1) * itemsPerPage
                );

                return (
                  <>
                    <div {...provided.droppableProps} ref={provided.innerRef} className="fade-transition">
                      {paginatedLessons.map((lesson, index) => (
                        <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                          {(provided) => (
                            <div
                              className="lesson-card"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {lesson.thumbnail && (
                                  <img
                                    src={`http://localhost:5000${lesson.thumbnail}`}
                                    alt="thumbnail"
                                    className="lesson-thumb"
                                  />
                                )}
                                <div>
                                  <h4 style={{ margin: 0, color: '#b4ff39' }}>{lesson.title}</h4>
                                  <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }}>
                                    📅 Day {lesson.day} | ⏱ {lesson.duration || 'Unknown'} | 📘 {lesson.level}
                                  </p>
                                </div>
                              </div>
                              <p style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: '#ddd' }}>
                                {lesson.description}
                              </p>
                              {lesson.audio && (
                                <audio controls style={{ width: '100%', marginTop: '10px' }}>
                                  <source src={`http://localhost:5000${lesson.audio}`} />
                                </audio>
                              )}
                              <div style={{ marginTop: '10px', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleEditLesson(lesson)} className="neon-btn">
                                  ✏️ Edit
                                </button>
                                <button onClick={() => handleDeleteLesson(lesson._id)} className="danger-btn">
                                  🗑 Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    <div className="pagination-controls">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          className={`pagination-btn ${i === page ? 'active' : ''}`}
                          onClick={() => setPage(i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </>
                );
              }}
            </Droppable>
          </DragDropContext>

          {selectedLessons.length > 0 && (
            <div className="bulk-actions">
              <button onClick={handleBulkDelete} className="danger-btn">
                🗑 Delete Selected ({selectedLessons.length})
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="user-management">
          <div className="user-actions">
            <input 
              type="text" 
              placeholder="Search username" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button onClick={() => setSortByStreak(!sortByStreak)}>
              {sortByStreak ? '🔽 Unsort' : '🔼 Sort by Streak'}
            </button>
            <button onClick={exportCSV}>📁 Export CSV</button>
          </div>
          <ul className="user-list">
            {filteredUsers.map((user, i) => (
              <li key={i} onClick={() => setSelectedUser(user)}>
                <img
                  src={`http://localhost:5000${user.avatar && user.avatar !== '' ? user.avatar : '/uploads/default.png'}`}
                  alt="avatar"
                  className="avatar-img"
                />
                <div>
                  <strong>{user.username}</strong>
                  <div>🔥 {user.streak || 0} days</div>
                  <div>✅ {user.completedLessons?.length || 0} lessons</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Lesson</h3>
            <input
              type="text"
              placeholder="Lesson Title"
              value={lessonData.title}
              onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
            />
            <textarea
              placeholder="Lesson Description"
              value={lessonData.description}
              onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Day"
              value={lessonData.day}
              onChange={(e) => setLessonData({ ...lessonData, day: e.target.value })}
            />
            <input
              type="text"
              placeholder="Duration"
              value={lessonData.duration}
              onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
            />
            <input
              type="text"
              placeholder="Level"
              value={lessonData.level}
              onChange={(e) => setLessonData({ ...lessonData, level: e.target.value })}
            />
            <DropZone label="🎧 Replace Audio" accept="audio/*" onFileDrop={handleDrop('audio')} />
            <DropZone label="🖼️ Replace Thumbnail" accept="image/*" onFileDrop={handleDrop('thumbnail')} />
            {preview && <img src={preview} className="thumbnail-preview" alt="preview" />}
            <div className="modal-actions">
              <button onClick={handleUpdateLesson} className="neon-btn">💾 Save</button>
              <button onClick={() => setModalOpen(false)} className="danger-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;