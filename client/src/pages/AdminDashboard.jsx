import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import io from 'socket.io-client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [lessons, setLessons] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editLesson, setEditLesson] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLessons: 0,
    averageStreak: 0,
    usersByDay: [],
    lessonsByDay: []
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

      const [lessonData, setLessonData] = useState({
      title: '',
      description: '',
      day: '',
      duration: '',
      level: '',
      audio: null
    });


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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setLessonData({ ...lessonData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(lessonData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      await axios.post('http://localhost:5000/api/lessons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Lesson uploaded!');
      setLessonData({ title: '', description: '', day: '', duration: '', level: '', audio: null });
      fetchAllData();
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    }
  };

  const handleUpdateLesson = async () => {
    const formData = new FormData();
    Object.entries(lessonData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      await axios.put(`http://localhost:5000/api/lessons/${editLesson._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Lesson updated!');
      setEditLesson(null);
      setLessonData({ title: '', description: '', day: '', duration: '', level: '', audio: null });
      fetchLessons(); fetchLogs(); fetchStats();
    } catch (err) {
      alert('Update failed');
      console.error(err);
    }
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
    });
    setTab('upload');
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) {
      await axios.delete(`http://localhost:5000/api/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLessons(); fetchLogs(); fetchStats();
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete this user?')) {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); fetchLogs(); fetchStats();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#ccc', font: { size: 12 } } },
      tooltip: { backgroundColor: '#333', titleColor: '#fff', bodyColor: '#eee' },
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: '#444' } },
      y: { ticks: { color: '#aaa' }, grid: { color: '#444' } },
    }
  };

   const tabItems = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'upload', label: editLesson ? '✏️ Edit Lesson' : '📤 Upload Lesson' },
    { key: 'lessons', label: '🎧 All Lessons' },
    { key: 'users', label: '👥 Users' },
    { key: 'logs', label: '📄 Logs' },
    { key: 'notifications', label: '🔔 Notifications' },
    { key: 'analytics', label: '📈 Analytics' },
  ];

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

      {tab === 'overview' && (
        <div className="admin-overview">
          <h3>Overview Stats</h3>
        <div className="stat-cards">
  <div className="stat-card">👤 Users: {stats.totalUsers || 'Loading...'}</div>
  <div className="stat-card">🎧 Lessons: {stats.totalLessons || 'Loading...'}</div>
  <div className="stat-card">🔥 Avg Streak: {stats.averageStreak || 'Loading...'}</div>
</div>

        </div>
      )}

      {tab === 'upload' && (
        <form className="upload-form" onSubmit={(e) => { e.preventDefault(); editLesson ? handleUpdateLesson() : handleSubmit(e); }}>
          <input type="text" name="title" placeholder="Lesson Title" value={lessonData.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Lesson Description" value={lessonData.description} onChange={handleChange} rows="4" required />
          <input type="number" name="day" placeholder="Day" value={lessonData.day} onChange={handleChange} required />
          <input type="text" name="duration" placeholder="Duration" value={lessonData.duration} onChange={handleChange} required />
          <input type="text" name="level" placeholder="Level" value={lessonData.level} onChange={handleChange} required />
          <input type="file" name="audio" accept="audio/*" onChange={handleChange} />
          <button type="submit">{editLesson ? 'Update' : 'Upload'}</button>
        </form>
      )}

      {tab === 'lessons' && (
        <div className="lesson-list">
          <h3>All Lessons</h3>
          {lessons.length === 0 ? <p>No lessons found</p> : (
            lessons.map((lesson) => (
              <div key={lesson._id} className="lesson-item">
                <h4>{lesson.title}</h4>
                <p>{lesson.description}</p>
                {lesson.audio && (
                  <audio controls>
                    <source src={`http://localhost:5000${lesson.audio}`} type="audio/mpeg" />
                  </audio>
                )}
                <div className="actions">
                  <button onClick={() => handleEditLesson(lesson)}>Edit</button>
                  <button onClick={() => handleDeleteLesson(lesson._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="user-list">
          <h3>All Users</h3>
          {users.length === 0 ? <p>No users found</p> : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Streak</th>
                  <th>Completed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.streak}</td>
                    <td>{user.completedLessons?.length || 0}</td>
                    <td>
                      <button onClick={() => setSelectedUser(user)}>View</button>
                      <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {selectedUser && (
            <div className="modal">
              <div className="modal-content">
                <h3>User: {selectedUser.username}</h3>
                <p>Streak: {selectedUser.streak}</p>
                <p>Completed Lessons: {selectedUser.completedLessons?.length || 0}</p>
                <p>Last Accessed: {selectedUser.lastAccessed ? new Date(selectedUser.lastAccessed).toLocaleString() : 'N/A'}</p>
                <button onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'logs' && (
        <div className="log-list">
          <h3>Activity Logs</h3>
          {logs.length === 0 ? <p>No logs yet</p> : (
            <ul>
              {logs.map(log => (
                <li key={log._id}>
                  <strong>{log.action}</strong>: {log.details} — <em>{log.performedBy}</em> at {new Date(log.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="notification-list">
          <h3>Notifications</h3>
          {notifications.length === 0 ? <p>No notifications yet</p> : (
            <ul>
              {notifications.map(note => (
                <li key={note._id}>
                  <strong>{note.title}</strong>: {note.message} — <em>{new Date(note.createdAt).toLocaleString()}</em>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="analytics-tab">
          <h3>📈 Analytics Overview</h3>

          <div className="chart-grid">
            <div className="chart-card">
              <h4>👥 Users Joined Over Time</h4>
              {stats.usersByDay.length === 0 ? (
                <p>Loading chart...</p>
              ) : (
                <Line
                  data={{
                    labels: stats.usersByDay.map(u => u.date),
                    datasets: [{
                      label: 'New Users',
                      data: stats.usersByDay.map(u => u.count),
                      borderColor: '#4caf50',
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: true } },
                    animation: { duration: 1000 }
                  }}
                />
              )}
            </div>

            <div className="chart-card">
              <h4>📚 Lessons Uploaded Over Time</h4>
              {stats.lessonsByDay.length === 0 ? (
                <p>Loading chart...</p>
              ) : (
                <Bar
                  data={{
                    labels: stats.lessonsByDay.map(l => l.date),
                    datasets: [{
                      label: 'Lessons',
                      data: stats.lessonsByDay.map(l => l.count),
                      backgroundColor: '#42a5f5',
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    animation: { duration: 1000 }
                  }}
                />
              )}
            </div>

            <div className="chart-card">
              <h4>🔥 Average Streak</h4>
              {stats.averageStreak === 0 ? (
                <p>Loading chart...</p>
              ) : (
                <Doughnut
                  data={{
                    labels: ['Avg Streak', 'To Max (7)'],
                    datasets: [{
                      data: [stats.averageStreak, 7 - stats.averageStreak],
                      backgroundColor: ['#ff9800', '#e0e0e0'],
                      hoverOffset: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } },
                    animation: { duration: 1000 }
                  }}
                />
              )}
      </div>
    </div>
  </div>
)}


    </div>
  );
};



export default AdminDashboard;