import React from "react";
import "../styles/import "../../styles/admin/AdminDashboard.css";s"; // optional if you want styles here

const Overview = () => {
  return (
    <div className="overview-section">
      <h2>📊 Admin Overview</h2>
      <div className="overview-grid">
        <div className="overview-card">
          <h3>👤 Total Users</h3>
          <p>123</p>
        </div>
        <div className="overview-card">
          <h3>📚 Lessons</h3>
          <p>28</p>
        </div>
        <div className="overview-card">
          <h3>🚀 Active Today</h3>
          <p>19</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
