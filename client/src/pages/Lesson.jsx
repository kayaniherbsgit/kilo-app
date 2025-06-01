import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Lesson = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/lessons/${id}`)
      .then((res) => setLesson(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!lesson) return <p style={{ color: '#fff' }}>⏳ Loading lesson...</p>;

  return (
    <div style={{ padding: '2rem', background: '#111', color: '#fff' }}>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>
      <audio controls src={`${import.meta.env.VITE_API_URL}${lesson.audio}`} style={{ marginTop: '1rem' }} />
    </div>
  );
};

export default Lesson;