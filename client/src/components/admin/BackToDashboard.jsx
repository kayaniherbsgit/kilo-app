// src/components/admin/BackToDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin/BackToDashboard.css';

const BackToDashboard = () => {
  return (
    <div className="back-to-dashboard">
      <Link to="/admin" className="back-link">
        ← Back to Dashboard
      </Link>
    </div>
  );
};

export default BackToDashboard;