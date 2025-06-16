// src/components/admin/BackToDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin/AdminLessons.css'; // or your global admin CSS

const BackToDashboard = () => {
  return (
    <div className="back-dashboard-wrapper">
      <Link to="/admin" className="back-dashboard-btn">
        ⬅ Back to Admin Dashboard
      </Link>
    </div>
  );
};

export default BackToDashboard;
