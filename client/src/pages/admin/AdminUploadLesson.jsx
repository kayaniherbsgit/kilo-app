// src/pages/admin/AdminUploadLesson.jsx
import React, { useState } from 'react';
import axios from 'axios';
import supabase from '../../utils/supabaseClient';

const AdminUploadLesson = () => {
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
  const fileName = `${Date.now()}-${file.name}`;

  console.log("Uploading:", file.name);

  const { data, error } = await supabase.storage
    .from(folder)
    .upload(fileName, file);

  if (error) {
    console.error("❌ Upload error from Supabase:", error.message);
    return null;
  }

  // ✅ Properly generate public URL
const { data: publicData } = supabase
  .storage
  .from(folder)
  .getPublicUrl(fileName);

const publicUrl = publicData?.publicUrl;

console.log("✅ File uploaded successfully. Public URL:", publicUrl);
return publicUrl;

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
        'https://kilo-app-backend.onrender.com/api/lessons',
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
    </div>
  );
};

export default AdminUploadLesson;
