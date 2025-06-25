import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Lesson = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [unlockedStep, setUnlockedStep] = useState(0);

  useEffect(() => {
  axios
    .get(`http://localhost:5000/api/lessons/${id}`)
    .then((res) => {
      const lessonData = res.data;

      // 👇 Inject main audio as first step if not already part of steps
      const mainAudioStep = {
        type: 'audio',
        src: lessonData.audio,
      };

      const fullSteps = [mainAudioStep, ...(lessonData.steps || [])];

      setLesson({
        ...lessonData,
        steps: fullSteps,
      });

      // Load previous step progress
      const savedStep = localStorage.getItem(`lesson-${id}-step`);
      if (savedStep) setUnlockedStep(parseInt(savedStep));
    })
    .catch((err) => console.error('Error fetching lesson:', err));
}, [id]);


const handleStepComplete = async (index) => {
  if (index === unlockedStep) {
    let nextStep = unlockedStep + 1;

    // If the first step was completed, unlock all remaining steps
    if (index === 0 && lesson && lesson.steps.length > 1) {
      nextStep = lesson.steps.length;
    }

    setUnlockedStep(nextStep);
    localStorage.setItem(`lesson-${id}-step`, nextStep);

    // Auto-mark lesson complete if that was the final step
    if (lesson && nextStep === lesson.steps.length) {
      try {
        await axios.post(
          'http://localhost:5000/api/users/mark-complete',
          { lessonId: lesson._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        console.log('✅ Lesson fully completed');
      } catch (err) {
        console.error('❌ Error marking complete:', err);
      }
    }
  }
};


  if (!lesson) {
    return <p style={{ color: '#fff', textAlign: 'center' }}>⏳ Loading lesson...</p>;
  }

  return (
    <div style={{ padding: '2rem', background: '#111', color: '#fff', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{lesson.title}</h2>
      <p style={{ marginBottom: '1.5rem', color: '#aaa' }}>{lesson.description}</p>

      {lesson.steps && lesson.steps.length > 0 ? (
        lesson.steps.map((step, index) => (
          <div
            key={index}
            style={{
              opacity: index <= unlockedStep ? 1 : 0.4,
              pointerEvents: index <= unlockedStep ? 'auto' : 'none',
              marginBottom: '2rem',
              padding: '1rem',
              border: '1px solid #333',
              borderRadius: '10px',
              background: '#1a1a1a',
            }}
          >
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Step {index + 1} — {step.type.toUpperCase()}
            </p>

            {step.type === 'audio' && (
              <audio
                controls
                src={`http://localhost:5000${step.src}`}
                onEnded={() => handleStepComplete(index)}
                style={{ width: '100%' }}
              />
            )}

            {step.type === 'text' && (
              <div onClick={() => handleStepComplete(index)} style={{ cursor: 'pointer' }}>
                <p>{step.content}</p>
              </div>
            )}

            {step.type === 'pdf' && (
              <div>
                <a
                  href={`http://localhost:5000${step.src}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleStepComplete(index)}
                  style={{ color: '#4fc3f7', textDecoration: 'underline' }}
                >
                  📄 Open PDF
                </a>
              </div>
            )}

            {step.type === 'questions' && (
              <div onClick={() => handleStepComplete(index)} style={{ cursor: 'pointer' }}>
                <ul style={{ paddingLeft: '1rem' }}>
                  {step.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      ) : (
        <p style={{ color: '#999' }}>❌ No steps found for this lesson.</p>
      )}
    </div>
  );
};

export default Lesson;