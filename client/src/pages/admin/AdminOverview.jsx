import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/admin/AdminDashboard.css";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLessons: 0,
    averageStreak: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/admin')} className="neon-btn" style={{ marginBottom: '1rem' }}>
        🔙 Back to Dashboard
      </button>
      
      <div className="card" style={{ padding: '2rem', background: '#202020' }}>
        <h2 style={{ color: '#b4ff39' }}>📊 Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p style={{ fontSize: '2rem', color: '#b4ff39' }}>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Lessons</h3>
            <p style={{ fontSize: '2rem', color: '#b4ff39' }}>{stats.totalLessons}</p>
          </div>
          <div className="stat-card">
            <h3>Avg. Streak</h3>
            <p style={{ fontSize: '2rem', color: '#b4ff39' }}>{stats.averageStreak}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;