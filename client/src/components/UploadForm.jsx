// components/UploadForm.jsx
import React from 'react';
import DropZone from './DropZone';

const UploadForm = ({ lessonData, setLessonData, preview, setPreview, handleDrop, handleSubmit, editLesson }) => (
  <form className="upload-form" onSubmit={handleSubmit}>
    <input
      type="text"
      placeholder="Lesson Title"
      value={lessonData.title}
      onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
      required
    />
    <textarea
      placeholder="Lesson Description"
      value={lessonData.description}
      onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
      required
    />
    <input
      type="number"
      placeholder="Day"
      value={lessonData.day}
      onChange={(e) => setLessonData({ ...lessonData, day: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="Duration"
      value={lessonData.duration}
      onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="Level"
      value={lessonData.level}
      onChange={(e) => setLessonData({ ...lessonData, level: e.target.value })}
      required
    />
    <DropZone label="🎧 Upload Audio File" accept="audio/*" onFileDrop={handleDrop('audio')} />
    <DropZone label="🖼️ Upload Thumbnail" accept="image/*" onFileDrop={handleDrop('thumbnail')} />
    {preview && <img src={preview} alt="Preview" className="thumbnail-preview" />}
    <button type="submit">{editLesson ? 'Update Lesson' : 'Upload Lesson'}</button>
  </form>
);

export default UploadForm;
