import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";
import { FaBell } from "react-icons/fa";
import "../styles/AdminNotificationDetail.css";

const AdminNotificationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/notifications/${id}`);
        setNotification(res.data); // ✅ fixed: backend returns a single object
      } catch (error) {
        console.error("Failed to fetch notification:", error);
      }
    };
    fetchNotification();
  }, [id]);

  if (!notification) return <p className="loading-msg">Loading...</p>;

  return (
    <div className="admin-notification-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} />
        Back
      </button>

      <div className="notification-card">
        <div className="icon-circle">
          <FaBell size={24} />
        </div>

        <div className="notification-content">
          <h2 className="notification-title">{notification.message}</h2>
          <p className="notification-body">
            {notification.body || "This is a system-generated notification. Please take action if needed."}
          </p>
          <p className="notification-time">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationDetail;
