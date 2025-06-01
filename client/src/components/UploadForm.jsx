// components/UploadForm.jsx
import React from 'react';
import DropZone from './DropZone';

const UploadForm = ({
  lessonData,
  setLessonData,
  preview,
  setPreview,
  handleSubmitSuccess,
  editLesson = false,
}) => {
  const handleDrop = (type) => (file) => {
    setLessonData((prev) => ({
      ...prev,
      [type]: file,
    }));

    if (type === 'thumbnail') {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lessonData.audio) {
  alert("❌ You forgot to add the audio file!");
  return;
}


    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('day', lessonData.day);
    formData.append('duration', lessonData.duration);
    formData.append('level', lessonData.level);

    if (lessonData.audio) {
      formData.append('audio', lessonData.audio);
    }
    if (lessonData.thumbnail) {
      formData.append('thumbnail', lessonData.thumbnail);
    }

    try {
      const endpoint = editLesson
        ? `http://${import.meta.env.VITE_API_URL}/api/lessons/${lessonData._id}`
        : 'http://${import.meta.env.VITE_API_URL}/api/lessons';

      const method = editLesson ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      alert(`Lesson ${editLesson ? 'updated' : 'uploaded'} successfully!`);
      handleSubmitSuccess?.(data); // optional callback
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('Upload failed. Check console.');
    }
  };

  return (
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
};

export default UploadForm;