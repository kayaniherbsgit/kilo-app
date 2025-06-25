import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import axios from 'axios';
import '../styles/AudioCard.css';
import { toast } from 'react-toastify';
import { useAudio } from '../contexts/AudioContext';

const AudioCard = ({
  lesson,
  currentIndex,
  totalLessons,
  onNext,
  onPrev,
  onMarkComplete,
  completed,
}) => {
  const [progress, setProgress] = useState(0);
  const [isSeventyFiveReached, setIsSeventyFiveReached] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [autoPlayTimer, setAutoPlayTimer] = useState(10);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);
  const [delayedAutoPlay, setDelayedAutoPlay] = useState(false);
  const [width, height] = useWindowSize();
  const isCompleted = completed.includes(lesson._id);
  const { audioRef } = useAudio();
  const countdownRef = useRef(null);
  const delayTimerRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = Array.isArray(lesson.steps) && lesson.steps.length > 0
    ? lesson.steps
    : [{ type: 'audio', src: lesson.audio || '', content: '', label: 'Default Audio' }];
  const currentStep = steps[stepIndex] || {};

  const trackEvent = async (event, data = {}) => {
    try {
      await axios.post('http://localhost:5000/api/analytics/track', {
        event,
        data
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (err) {
      console.warn('Analytics failed:', event, err.message);
    }
  };

  useEffect(() => {
    setProgress(0);
    setIsSeventyFiveReached(false);
    setShowAutoPlay(false);
    setAutoPlayCancelled(false);
    setDelayedAutoPlay(false);
    setStepIndex(0);

    if (countdownRef.current) clearInterval(countdownRef.current);
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);

    const saved = localStorage.getItem(`lesson-progress-${lesson._id}`);
    const resumedFlag = sessionStorage.getItem(`resumed-${lesson._id}`);
    if (saved && !resumedFlag && parseFloat(saved) > 5) {
      setResumeTime(parseFloat(saved));
      setResumePrompt(true);
    }

    delayTimerRef.current = setTimeout(() => {
      setDelayedAutoPlay(true);
    }, 15000);

    axios.post('http://localhost:5000/api/users/current-lesson',
      { lessonId: lesson._id },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    ).catch(err => console.error('Failed to save current lesson:', err.message));

    localStorage.setItem('lastPlayedLessonId', lesson._id);
  }, [lesson]);

  useEffect(() => {
    if (delayedAutoPlay && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(err => {
        console.warn('Auto-play blocked:', err.message);
      });
    }
  }, [delayedAutoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentStep.type !== 'audio') return;

    const handleUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 1;
      const pct = (currentTime / duration) * 100;
      setProgress(pct);
      localStorage.setItem(`lesson-progress-${lesson._id}`, currentTime);

      if (pct >= 75 && !isSeventyFiveReached) {
        setIsSeventyFiveReached(true);
        trackEvent('audio_75_percent', { lessonId: lesson._id, stepIndex, time: currentTime });
      }

      if (pct >= 99) {
        trackEvent('audio_complete', {
          lessonId: lesson._id,
          stepIndex,
          time: currentTime,
          duration
        });

        if (!completed.includes(lesson._id)) {
          onMarkComplete(lesson._id);
          axios.post('http://localhost:5000/api/users/mark-complete',
            { lessonId: lesson._id },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          ).catch(err => console.error('Error saving completion:', err.message));
        }

        if (!sessionStorage.getItem(`toast-shown-${lesson._id}`)) {
          toast.success('🏁 ✅ Completed! Ready to level up.');
          sessionStorage.setItem(`toast-shown-${lesson._id}`, 'true');
        }

        if (!sessionStorage.getItem(`confetti-shown-${lesson._id}`)) {
          setShowConfetti(true);
          sessionStorage.setItem(`confetti-shown-${lesson._id}`, 'true');
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    };

    const handlePlay = () => {
      trackEvent('audio_play', { lessonId: lesson._id, stepIndex, time: audio.currentTime });
    };

    const handlePause = () => {
      trackEvent('audio_pause', { lessonId: lesson._id, stepIndex, time: audio.currentTime });
    };

    const handleEnd = () => {
      trackEvent('audio_ended', { lessonId: lesson._id, stepIndex, time: audio.currentTime });

      if (stepIndex < steps.length - 1) {
        setShowAutoPlay(true);
        setAutoPlayTimer(10);
        let timer = 10;
        countdownRef.current = setInterval(() => {
          if (autoPlayCancelled) {
            clearInterval(countdownRef.current);
            setShowAutoPlay(false);
            return;
          }
          timer -= 1;
          setAutoPlayTimer(timer);
          if (timer <= 0) {
            clearInterval(countdownRef.current);
            setShowAutoPlay(false);
            setStepIndex(stepIndex + 1);
          }
        }, 1000);
      } else {
        onNext();
      }
    };

    audio.addEventListener('timeupdate', handleUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', handleUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [audioRef, completed, lesson._id, onMarkComplete, stepIndex, currentStep, isSeventyFiveReached]);

  const handleNextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className={`card audio-card-container ${isCompleted ? 'lesson-completed' : ''}`}>
      {showConfetti && <Confetti width={width} height={height} />}

      {resumePrompt && (
        <div className="resume-modal">
          <div className="resume-box">
            <h4>⏪ Resume?</h4>
            <p>Continue from {Math.floor(resumeTime / 60)}:{String(Math.floor(resumeTime % 60)).padStart(2, '0')}?</p>
            <div className="resume-btn-group">
              <button className="neon-btn small" onClick={() => {
                audioRef.current.currentTime = resumeTime;
                sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                setResumePrompt(false);
              }}>Yes</button>
              <button className="neon-btn small" onClick={() => {
                audioRef.current.currentTime = 0;
                sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                setResumePrompt(false);
              }}>No</button>
            </div>
          </div>
        </div>
      )}

      {showAutoPlay && (
        <div className="auto-play-overlay">
          <div className="countdown-box">
            <p>Next step starting in</p>
            <h1>{autoPlayTimer}s</h1>
            <div className="resume-btn-group">
              <button className="neon-btn small" onClick={() => {
                clearInterval(countdownRef.current);
                setShowAutoPlay(false);
                handleNextStep();
              }}>⏭ Skip Timer</button>
              <button className="neon-btn small" onClick={() => {
                setAutoPlayCancelled(true);
                setShowAutoPlay(false);
              }}>✖ Stay</button>
            </div>
          </div>
        </div>
      )}

      <div className="audio-card-content">
        {lesson.thumbnail && stepIndex === 0 && (
          <img
            src={lesson.thumbnail}
            alt="Lesson Thumbnail"
            className="lesson-thumbnail"
            style={{
              width: '100%',
              maxHeight: '220px',
              borderRadius: '12px',
              objectFit: 'cover',
              marginBottom: '1rem',
            }}
          />
        )}

        <h3 className="lesson-title">{lesson.title}</h3>

        {lesson.description && stepIndex === 0 && (
          <p className="lesson-description">{lesson.description}</p>
        )}

        {currentStep.type === 'text' && (
          <div className="text-step-box">
            <p style={{ whiteSpace: 'pre-wrap' }}>{currentStep.content}</p>
            <button className="neon-btn small" onClick={handleNextStep}>⏭ Endelea</button>
          </div>
        )}

        {currentStep.type === 'audio' && (
          <audio
            key={lesson._id + stepIndex}
            ref={audioRef}
            controls
            src={currentStep.src}
            style={{ width: '100%', borderRadius: '10px' }}
          />
        )}

        {currentStep.type === 'pdf' && (
          <a className="neon-btn small" target="_blank" href={currentStep.src} rel="noreferrer">
            📥 Open PDF
          </a>
        )}

        {currentStep.type === 'questions' && (
          <div className="question-box">
            {currentStep.questions.map((q, i) => (
              <p key={i}>❓ {q}</p>
            ))}
            <button onClick={handleNextStep} className="neon-btn small">⏭ Endelea</button>
          </div>
        )}

        <div className="nav-buttons-wrapper">
          {currentIndex > 0 && (
            <button onClick={onPrev} className="neon-btn small prev-btn">⬅️ Previous</button>
          )}
          {stepIndex >= steps.length - 1 && currentIndex < totalLessons - 1 && (
            <button
              onClick={onNext}
              className={`neon-btn small ${isSeventyFiveReached ? 'enabled' : 'disabled'}`}
              disabled={!isSeventyFiveReached}
            >
              ➡️ Next Lesson
            </button>
          )}
          {stepIndex >= steps.length - 1 && !isSeventyFiveReached && (
            <p className="audio-warning">
              ⏳ Sikiliza angalau 75% ya somo ili kufungua somo linalofuata.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioCard;