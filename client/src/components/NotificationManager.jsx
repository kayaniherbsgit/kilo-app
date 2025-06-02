import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/admin/AdminDashboard.css";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-section">
      <h3 className="notification-heading">🔔 Notifications</h3>
      {notifications.length > 0 ? (
        notifications.map((note, i) => (
          <div key={i} className="notification-card">
            <div className="notification-title">{note.title}</div>
            <div className="notification-message">{note.message}</div>
            <div className="notification-timestamp">
              {new Date(note.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      ) : (
        <div className="no-notifications">No notifications yet.</div>
      )}
    </div>
  );
};

export default NotificationManager;
