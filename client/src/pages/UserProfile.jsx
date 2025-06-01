import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`https://kilo-app-backend.onrender.com/api/users/profile/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        alert('User not found');
        navigate('/admin'); // fallback
      }
    };

    fetchUser();
  }, [username]);

  if (!user) return <div className="user-profile">Loading...</div>;

  return (
    <div className="user-profile">
      <h2>Profile: {user.username}</h2>
      <p><strong>Email:</strong> {user.email || 'N/A'}</p>
      <p><strong>Streak:</strong> {user.streak} days</p>
      <p><strong>Completed Lessons:</strong> {user.completedLessons?.length || 0}</p>
      <p><strong>Last Accessed:</strong> {new Date(user.lastAccessed).toLocaleString()}</p>

      <h3>Lesson Progress</h3>
      {user.lessonProgress && Object.keys(user.lessonProgress).length > 0 ? (
        <ul>
          {Object.entries(user.lessonProgress).map(([lessonId, status]) => (
            <li key={lessonId}>
              Lesson ID: {lessonId} – {status.completed ? '✅ Completed' : '⏳ In Progress'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No lesson activity recorded.</p>
      )}

      <button onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
};

export default UserProfile;
