// src/components/LessonManager.jsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const LessonManager = ({
  lessons, setLessons, searchQuery, setSearchQuery, itemsPerPage, setItemsPerPage, page, setPage,
  handleEditLesson, handleDeleteLesson, handleBulkDelete, selectedLessons
}) => {
  return (
    <div className="lessons-grid">
      <div className="lesson-controls">
        <input
          type="text"
          placeholder="Search lessons"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="lesson-search"
        />
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setPage(0);
          }}
          className="dropdown-items-per-page"
        >
          <option value={5}>Show 5</option>
          <option value={10}>Show 10</option>
          <option value={20}>Show 20</option>
        </select>
      </div>

      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) return;
          const reordered = [...lessons];
          const [removed] = reordered.splice(result.source.index, 1);
          reordered.splice(result.destination.index, 0, removed);
          setLessons(reordered);

          fetch('https://kilo-app-backend.onrender.com/api/admin/reorder-lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lessons: reordered.map((lesson, index) => ({
                id: lesson._id,
                order: index,
              })),
            }),
          });
        }}
      >
        <Droppable droppableId="lessons">
          {(provided) => {
            const filteredLessons = lessons.filter(lesson =>
              lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
            const paginatedLessons = filteredLessons.slice(
              page * itemsPerPage,
              (page + 1) * itemsPerPage
            );

            return (
              <>
                <div {...provided.droppableProps} ref={provided.innerRef} className="fade-transition">
                  {paginatedLessons.map((lesson, index) => (
                    <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                      {(provided) => (
                        <div
                          className="lesson-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {lesson.thumbnail && (
                              <img
                                src={`https://kilo-app-backend.onrender.com${lesson.thumbnail}`}
                                alt="thumbnail"
                                className="lesson-thumb"
                              />
                            )}
                            <div>
                              <h4 style={{ margin: 0, color: '#07bc0c' }}>{lesson.title}</h4>
                              <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }}>
                                📅 Day {lesson.day} | ⏱ {lesson.duration || 'Unknown'} | 📘 {lesson.level}
                              </p>
                            </div>
                          </div>
                          <p style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: '#ddd' }}>
                            {lesson.description}
                          </p>
                          {lesson.audio && (
                            <audio controls style={{ width: '100%', marginTop: '10px' }}>
                              <source src={`https://kilo-app-backend.onrender.com${lesson.audio}`} />
                            </audio>
                          )}
                          <div style={{ marginTop: '10px', display: 'flex', gap: '1rem' }}>
                            <button onClick={() => handleEditLesson(lesson)} className="neon-btn">
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson._id)} className="danger-btn">
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>

                <div className="pagination-controls">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`pagination-btn ${i === page ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            );
          }}
        </Droppable>
      </DragDropContext>

      {selectedLessons.length > 0 && (
        <div className="bulk-actions">
          <button onClick={handleBulkDelete} className="danger-btn">
            🗑 Delete Selected ({selectedLessons.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonManager;