// components/LessonModal.jsx
import React from 'react';
import DropZone from './DropZone';

const LessonModal = ({ lessonData, setLessonData, preview, handleDrop, handleUpdateLesson, close }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Edit Lesson</h3>
      <input
        type="text"
        placeholder="Lesson Title"
        value={lessonData.title}
        onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
      />
      <textarea
        placeholder="Lesson Description"
        value={lessonData.description}
        onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
      />
      <input
        type="number"
        placeholder="Day"
        value={lessonData.day}
        onChange={(e) => setLessonData({ ...lessonData, day: e.target.value })}
      />
      <input
        type="text"
        placeholder="Duration"
        value={lessonData.duration}
        onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
      />
      <input
        type="text"
        placeholder="Level"
        value={lessonData.level}
        onChange={(e) => setLessonData({ ...lessonData, level: e.target.value })}
      />
      <DropZone label="🎧 Replace Audio" accept="audio/*" onFileDrop={handleDrop('audio')} />
      <DropZone label="🖼️ Replace Thumbnail" accept="image/*" onFileDrop={handleDrop('thumbnail')} />
      {preview && <img src={preview} className="thumbnail-preview" alt="preview" />}
      <div className="modal-actions">
        <button onClick={handleUpdateLesson} className="neon-btn">💾 Save</button>
        <button onClick={close} className="danger-btn">Cancel</button>
      </div>
    </div>
  </div>
);

export default LessonModal;
