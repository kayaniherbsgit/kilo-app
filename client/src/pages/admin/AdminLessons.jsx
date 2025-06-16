// src/pages/admin/AdminLessons.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import BackToDashboard from '../../components/admin/BackToDashboard';
import '../../styles/admin/AdminLessons.css';

const AdminLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const token = localStorage.getItem('token');

  const fetchLessons = async () => {
    try {
      const res = await axios.get('https://kilo-app-backend.onrender.com/api/lessons', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enriched = res.data.map(lesson => {
        const audioStep = lesson.steps?.find(step => step.type === 'audio');
        return {
          ...lesson,
          resolvedAudio: lesson.audio || audioStep?.src || ''
        };
      });

      setLessons(enriched);
    } catch (err) {
      console.error('Failed to fetch lessons', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axios.delete(`https://kilo-app-backend.onrender.com/api/lessons/${confirmDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmDeleteId(null);
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

  const handlePlay = (audioSrc) => {
    if (playingAudio && playingAudio !== audioSrc) {
      const current = document.getElementById('global-audio');
      if (current) current.pause();
    }
    setPlayingAudio(audioSrc);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const filteredLessons = lessons.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-lessons">
      <BackToDashboard />

      <h2>📚 All Lessons</h2>

      <input
        className="search-bar"
        type="text"
        placeholder="Search lessons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredLessons.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="lesson-list">
                {filteredLessons.map((lesson, index) => (
                  <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                    {(provided) => (
                      <li
                        className="lesson-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {/* Thumbnail */}
                        {lesson.thumbnail && (
                          <div className="lesson-thumb">
                            <img
                              src={lesson.thumbnail}
                              alt="Thumbnail"
                            />
                          </div>
                        )}

                        <div className="lesson-info">
                          <strong>{lesson.title}</strong>
                          <p>{lesson.description || 'No description'}</p>

                          {lesson.resolvedAudio && (
                            <audio
                              id="global-audio"
                              controls
                              src={lesson.resolvedAudio}
                              onPlay={() => handlePlay(lesson.resolvedAudio)}
                            />
                          )}
                        </div>

                        <div className="lesson-actions">
                          <Link to={`/admin/edit-lesson/${lesson._id}`} className="edit-btn">✏️ Edit</Link>
                          <button onClick={() => setConfirmDeleteId(lesson._id)} className="delete-btn">🗑️</button>
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

      {/* Floating Add Button */}
      <Link to="/admin/upload" className="fab">➕</Link>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this lesson permanently?</p>
            <div className="modal-actions">
              <button onClick={handleDelete} className="confirm-btn">Yes, Delete</button>
              <button onClick={() => setConfirmDeleteId(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;