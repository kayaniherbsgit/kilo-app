// src/components/AudioCard.jsx
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
  const [lastToastLevel, setLastToastLevel] = useState(null);

  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);

    setProgress(0);
    setShowAutoPlay(false);
    setAutoPlayCancelled(false);
    setDelayedAutoPlay(false);
    setLastToastLevel(null);

    const saved = localStorage.getItem(`lesson-progress-${lesson._id}`);
    const resumedFlag = sessionStorage.getItem(`resumed-${lesson._id}`);
    if (saved && !resumedFlag && parseFloat(saved) > 5) {
      setResumeTime(parseFloat(saved));
      setResumePrompt(true);
    }

    delayTimerRef.current = setTimeout(() => {
      setDelayedAutoPlay(true);
    }, 15000);

    axios.post(
      'https://kilo-app-backend.onrender.com/api/users/current-lesson',
      { lessonId: lesson._id },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    ).catch(err => console.error('Failed to save current lesson:', err.message));

    localStorage.setItem('lastPlayedLessonId', lesson._id);
  }, [lesson]);

  useEffect(() => {
    if (delayedAutoPlay && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((err) => {
        console.warn('Auto-play blocked:', err.message);
      });
    }
  }, [delayedAutoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 1;
      const pct = (currentTime / duration) * 100;
      setProgress(pct);
      localStorage.setItem(`lesson-progress-${lesson._id}`, currentTime);

      if (pct >= 99 && lastToastLevel !== 'done') {
        if (!completed.includes(lesson._id)) {
          onMarkComplete(lesson._id);
          axios.post(
            'https://kilo-app-backend.onrender.com/api/user/mark-complete',
            { lessonId: lesson._id },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          ).catch(err => console.error('Error saving completion:', err.message));
        }

        toast.success('🏁 ✅ Completed! Ready to level up.');
        if (!sessionStorage.getItem(`confetti-shown-${lesson._id}`)) {
          setShowConfetti(true);
          sessionStorage.setItem(`confetti-shown-${lesson._id}`, 'true');
          setTimeout(() => setShowConfetti(false), 5000);
        }

        toast('🔥 You’ve just added 1 to your streak! Keep going.', {
          type: 'info',
          icon: '🔥',
        });

        setLastToastLevel('done');
      } else if (pct >= 70 && lastToastLevel !== 'almost') {
        toast.info('🔥 You’re almost done. Focus!');
        setLastToastLevel('almost');
      } else if (pct >= 50 && lastToastLevel !== 'half') {
        toast.info('⚡ Halfway there — don’t stop now!');
        setLastToastLevel('half');
      } else if (pct >= 25 && lastToastLevel !== 'quarter') {
        toast.info('🎧 Nice flow... keep listening.');
        setLastToastLevel('quarter');
      } else if (pct > 0 && lastToastLevel !== 'start') {
        toast.info('🚀 Let’s go! Your journey begins.');
        setLastToastLevel('start');
      }
    };

    const handleEnd = () => {
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
          onNext();
        }
      }, 1000);
    };

    audio.addEventListener('timeupdate', handleUpdate);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', handleUpdate);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [audioRef, completed, lesson._id, onMarkComplete, onNext, lastToastLevel]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNextClick = async () => {
    if (!completed.includes(lesson._id)) {
      await axios.post(
        'https://kilo-app-backend.onrender.com/api/users/mark-complete',
        { lessonId: lesson._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      ).catch(err => console.error('Error saving completion:', err.message));
      onMarkComplete(lesson._id);
    }
    onNext();
  };

  return (
    <div className={`card audio-card-container ${isCompleted ? 'lesson-completed' : ''}`}>
      {showConfetti && <Confetti width={width} height={height} />}

      {resumePrompt && (
        <div className="resume-modal">
          <div className="resume-box">
            <h4>⏪ Resume?</h4>
            <p>Continue from {formatTime(resumeTime)}?</p>
            <div className="resume-btn-group">
              <button className="neon-btn small" onClick={() => {
                audioRef.current.currentTime = resumeTime;
                sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                setResumePrompt(false);
              }}>
                Yes, resume
              </button>
              <button className="neon-btn small" onClick={() => {
                audioRef.current.currentTime = 0;
                sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                setResumePrompt(false);
              }}>
                No, start over
              </button>
            </div>
          </div>
        </div>
      )}

      {showAutoPlay && (
        <div className="auto-play-overlay">
          <div className="countdown-box">
            <p>Auto‐playing next lesson in</p>
            <h1>{autoPlayTimer}s</h1>
            <div className="resume-btn-group" style={{ marginTop: '0.5rem' }}>
              <button className="neon-btn small" onClick={() => {
                clearInterval(countdownRef.current);
                setShowAutoPlay(false);
                onNext();
              }}>
                ⏭ Next Now
              </button>
              <button className="neon-btn small" onClick={() => {
                setAutoPlayCancelled(true);
                setShowAutoPlay(false);
              }}>
                ✖ Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      <img
        src={`https://kilo-app-backend.onrender.com${lesson.thumbnail}`}
        alt="Lesson Thumbnail"
        className="lesson-thumbnail"
      />

      <div className="audio-card-content">
        <h3 className="lesson-title">{lesson.title}</h3>
        <p className="lesson-description">{lesson.description || 'No description provided.'}</p>
        {lesson.tagline && <div className="tagline-badge">{lesson.tagline}</div>}
        <div className="lesson-meta-bar">
          <div className="meta-item">📅 Day {lesson.day}</div>
          <div className="meta-item">⏱ {lesson.duration || 'Unknown'}</div>
          <div className="meta-item">🎧 {lesson.level}</div>
        </div>

        {/* ✅ Audio player with key to reset playback */}
        <audio
          key={lesson._id}
          ref={audioRef}
          controls
          src={`https://kilo-app-backend.onrender.com${lesson.audio}`}
          style={{ width: '100%', marginTop: '1rem', borderRadius: '10px' }}
        />

        <div className="nav-buttons-wrapper">
          {currentIndex > 0 && (
            <button onClick={onPrev} className="neon-btn small">
              ⬅️ Previous
            </button>
          )}
          {currentIndex < totalLessons - 1 && (
            <div>
              <button
                onClick={handleNextClick}
                disabled={!isCompleted && progress < 70}
                className={`neon-btn small ${!isCompleted && progress < 70 ? 'disabled' : ''}`}
              >
                {isCompleted
                  ? '➡️ Next'
                  : progress >= 70
                  ? '➡️ Next'
                  : '⏳ 70% to continue'}
              </button>
              {progress < 70 && !isCompleted && (
                <small style={{ color: '#999', display: 'block', marginTop: '0.2rem' }}>
                  Complete at least 70% to continue
                </small>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioCard;
