import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../../supabaseClient'; // 👈 Make sure you have this file
import '../../styles/admin/EditLesson.css';

const BASE_URL = import.meta.env.VITE_API_URL; // Adjust this based on your environment

const EditLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [lesson, setLesson] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('');
  const [audio, setAudio] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [audioURL, setAudioURL] = useState('');
  const [showNewAudio, setShowNewAudio] = useState(false);
  const [showNewThumbnail, setShowNewThumbnail] = useState(false);

  const [steps, setSteps] = useState([]);
  const [newStepType, setNewStepType] = useState('text');
  const [newStepContent, setNewStepContent] = useState('');

  useEffect(() => {
    axios.get(`${BASE_URL}/api/lessons/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const data = res.data;
      setLesson(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setDay(data.day || '');
      setDuration(data.duration || '');
      setLevel(data.level || '');
      setPreviewURL(data.thumbnail);
      setAudioURL(
        data.steps?.find((s) => s.type === 'audio')?.src || ''
      );
      setSteps(data.steps || []);
    }).catch(err => {
      alert('Failed to fetch lesson');
      console.error(err);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedAudioUrl = audioURL;
      let uploadedThumbnailUrl = previewURL;

      if (audio) {
        const { data, error } = await supabase.storage
          .from('lesson-assets')
          .upload(`audio/${Date.now()}-${audio.name}`, audio, { cacheControl: '3600' });
        if (error) throw error;
        uploadedAudioUrl = supabase.storage.from('lesson-assets').getPublicUrl(data.path).publicUrl;
      }

      if (thumbnail) {
        const { data, error } = await supabase.storage
          .from('lesson-assets')
          .upload(`thumbnails/${Date.now()}-${thumbnail.name}`, thumbnail, { cacheControl: '3600' });
        if (error) throw error;
        uploadedThumbnailUrl = supabase.storage.from('lesson-assets').getPublicUrl(data.path).publicUrl;
      }

      const updatedLesson = {
        title,
        description,
        day,
        duration,
        level,
        thumbnail: uploadedThumbnailUrl,
        steps: [
          ...(uploadedAudioUrl ? [{ type: 'audio', src: uploadedAudioUrl, label: 'Main Audio' }] : []),
          ...steps.filter((s) => s.type !== 'audio'),
        ],
      };

      await axios.put(`${BASE_URL}/api/lessons/${id}`, updatedLesson, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Lesson updated!');
      navigate('/admin/lessons');
    } catch (err) {
      alert('❌ Update failed');
      console.error(err);
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    setAudio(file);
    setShowNewAudio(true);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    setShowNewThumbnail(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddStep = () => {
    const newStep = { type: newStepType };
    if (newStepType === 'text') newStep.content = newStepContent;
    if (newStepType === 'questions') newStep.questions = newStepContent.split('\n');
    setSteps([...steps, newStep]);
    setNewStepContent('');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(steps);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSteps(reordered);
  };

  if (!lesson) return <p style={{ color: '#ccc', textAlign: 'center' }}>Loading lesson...</p>;

  return (
    <div className="edit-lesson-container">
      <button onClick={() => navigate('/admin')} className="neon-btn" style={{ marginBottom: '1.5rem' }}>🔙 Back</button>
      <h2 className="edit-title">✏️ Edit Lesson</h2>
      <form onSubmit={handleSubmit} className="edit-lesson-form">
        <label>📝 Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>📄 Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />

        <label>📅 Day</label>
        <input type="number" value={day} onChange={(e) => setDay(e.target.value)} required />

        <label>⏱ Duration</label>
        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} />

        <label>🎧 Level</label>
        <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} />

        <label>🔁 Current Audio</label>
        {!showNewAudio && audioURL && <audio src={audioURL} controls />}

        <label>🎵 Replace Audio</label>
        <input type="file" accept="audio/*" onChange={handleAudioChange} />

        <label>🖼️ Current Thumbnail</label>
        {!showNewThumbnail && previewURL && <img src={previewURL} alt="Current Thumbnail" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px' }} />}

        <label>🖼️ Replace Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />

        <h3 style={{ marginTop: '1.5rem' }}>🧩 Conditional Steps</h3>

        <div>
          <select value={newStepType} onChange={(e) => setNewStepType(e.target.value)}>
            <option value="text">Text</option>
            <option value="questions">Questions</option>
          </select>
          <textarea
            placeholder={newStepType === 'questions' ? 'One question per line' : 'Step content...'}
            value={newStepContent}
            onChange={(e) => setNewStepContent(e.target.value)}
          />
          <button type="button" onClick={handleAddStep} className="neon-btn">➕ Add Step</button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} style={{ background: '#111', padding: '1rem', borderRadius: '8px' }}>
                {steps.map((step, index) => (
                  <Draggable key={index} draggableId={`step-${index}`} index={index}>
                    {(provided) => (
                      <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#222', borderRadius: '6px' }}>
                        <strong>{index + 1}. {step.type}</strong>
                        <button onClick={() => {
                          const updated = [...steps];
                          updated.splice(index, 1);
                          setSteps(updated);
                        }} style={{ float: 'right', color: 'red' }}>❌</button>
                        {step.type === 'text' && (
                          <textarea value={step.content || ''} onChange={(e) => {
                            const updated = [...steps];
                            updated[index].content = e.target.value;
                            setSteps(updated);
                          }} />
                        )}
                        {step.type === 'questions' && (
                          <textarea value={(step.questions || []).join('\n')} onChange={(e) => {
                            const updated = [...steps];
                            updated[index].questions = e.target.value.split('\n');
                            setSteps(updated);
                          }} />
                        )}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <button type="submit" className="floating-save-btn">💾 Update Lesson</button>
      </form>
    </div>
  );
};

export default EditLesson;