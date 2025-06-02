// src/pages/admin/AdminLessons.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../../styles/AdminLessons.css';
import BackToDashboard from '../../components/admin/BackToDashboard';

const AdminLessons = () => {
  const [lessons, setLessons] = useState([]);
  const token = localStorage.getItem('token');

  const fetchLessons = async () => {
    try {
      const res = await axios.get('https://kilo-app-backend.onrender.com/api/lessons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLessons(res.data);
    } catch (err) {
      console.error('Failed to fetch lessons', err);
    }
  };

  const deleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson permanently?')) return;
    try {
      await axios.delete(`https://kilo-app-backend.onrender.com/api/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLessons();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(lessons);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLessons(reordered);

    try {
      const order = reordered.map((l) => l._id);
      await axios.patch(
        'https://kilo-app-backend.onrender.com/api/lessons/reorder',
        { order },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Reordering failed', err);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return (
  
    <div className="admin-lessons">
        <BackToDashboard />

      <h2>📚 All Lessons</h2>
      <Link className="create-btn" to="/admin/upload">➕ New Lesson</Link>

      {lessons.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="lesson-list">
                {lessons.map((lesson, index) => (
                  <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                    {(provided) => (
                      <li
                        className="lesson-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="lesson-info">
                          <strong>{lesson.title}</strong>
                          <p>{lesson.description || 'No description'}</p>
                          <audio src={lesson.audio} controls />
                        </div>
                        <div className="lesson-actions">
                          <Link to={`/admin/edit-lesson/${lesson._id}`} className="edit-btn">✏️ Edit</Link>
                          <button onClick={() => deleteLesson(lesson._id)} className="delete-btn">🗑️</button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default AdminLessons;
