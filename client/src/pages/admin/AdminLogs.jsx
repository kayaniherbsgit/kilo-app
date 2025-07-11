// src/pages/admin/AdminLogs.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ActivityLog from '../../components/ActivityLog';
import BackToDashboard from '../../components/admin/BackToDashboard';
import "../../styles/admin/AdminLogs.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/activity-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="admin-logs">
      <BackToDashboard />
      <ActivityLog logs={logs} />
    </div>
  );
};

export default AdminLogs;
