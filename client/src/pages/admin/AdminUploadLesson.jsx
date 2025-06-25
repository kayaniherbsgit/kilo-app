// src/pages/admin/AdminUploadLesson.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import supabase from '../../utils/supabaseClient';
import "../../styles/admin/AdminUploadLesson.css";

const AdminUploadLesson = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState(1);
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('');
  const [audio, setAudio] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Upload to Supabase
const uploadToSupabase = async (file, folder = 'lessons') => {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

  const { data, error: uploadError } = await supabase.storage
    .from(folder)
    .upload(fileName, file);

  if (uploadError) {
    console.error("❌ Upload failed:", uploadError.message);
    return null;
  }

  const { data: publicData, error: urlError } = supabase
    .storage
    .from(folder)
    .getPublicUrl(fileName);

  if (urlError) {
    console.error("❌ Failed to get public URL:", urlError.message);
    return null;
  }

  console.log("✅ Uploaded to Supabase:", publicData.publicUrl);
  return publicData.publicUrl;
};


 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Upload files to Supabase
      const audioUrl = audio ? await uploadToSupabase(audio, 'lessons') : '';
      const thumbnailUrl = thumbnail ? await uploadToSupabase(thumbnail, 'lessons') : '';

      if (audio && !audioUrl) throw new Error('Audio upload failed');
      if (thumbnail && !thumbnailUrl) throw new Error('Thumbnail upload failed');

      const token = localStorage.getItem('token');

      console.log('🖼️ Final Thumbnail URL:', thumbnailUrl);

      const lessonData = {

        title,
        description,
        day,
        duration,
        level,
        thumbnail: thumbnailUrl,
        steps: [
          {
            type: 'audio',
            src: audioUrl,
            label: 'Main Audio',
          },
        ],
      };

      // Post to backend
      const res = await axios.post(
        'http://localhost:5000/api/lessons',
        lessonData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('✅ Lesson uploaded successfully!');
      console.log(res.data);

      // Reset
      setTitle('');
      setDescription('');
      setDay(1);
      setDuration('');
      setLevel('');
      setAudio(null);
      setThumbnail(null);
    } catch (err) {
      console.error(err);
      setMessage('❌ Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-upload-page">
      <h2>📤 Upload New Lesson</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} required onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} required onChange={(e) => setDescription(e.target.value)} />
        <input type="number" placeholder="Day" value={day} required onChange={(e) => setDay(e.target.value)} />
        <input type="text" placeholder="Duration (e.g. Dak 5)" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <input type="text" placeholder="Level (e.g. Beginner)" value={level} onChange={(e) => setLevel(e.target.value)} />
        
        <label>🎵 Upload Audio File</label>
        <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />

        <label>🖼️ Upload Thumbnail</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Lesson'}
        </button>
        {message && <p style={{ marginTop: '10px' }}>{message}</p>}
      </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
  <button
    className="back-dashboard-btn"
    onClick={() => navigate('/admin')}
  >
    ⬅ Back to Admin Dashboard
  </button>

  <button
    className="view-lessons-btn"
    onClick={() => navigate('/admin/lessons')}
  >
    📚 View All Lessons
  </button>
</div>


    </div>
  );
};

export default AdminUploadLesson;
