import React, { useEffect, useState, useRef } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import 'react-circular-progressbar/dist/styles.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import axios from 'axios';
import '../styles/AudioCard.css';
import { useAudio } from '../contexts/AudioContext';
import { toast } from 'react-toastify';

const AudioCard = ({
  lesson,
  currentIndex,
  totalLessons,
  onNext,
  onPrev,
  onMarkComplete,
  completed,
}) => {
  // Consume global audio context
  const { src, isPlaying, currentTime, duration, playSource, togglePlay, seekTo } = useAudio();

  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [lastToastLevel, setLastToastLevel] = useState(null);
  const [autoPlayTimer, setAutoPlayTimer] = useState(10);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);

  const [width, height] = useWindowSize();
  const isCompleted = completed.includes(lesson._id);

  // Track whether we’ve already triggered the “ended” sequence
  const hasEndedRef = useRef(false);
  const countdownRef = useRef(null);

  // 1) Whenever `lesson` changes: load but do NOT auto-play
  useEffect(() => {
    hasEndedRef.current = false;
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setShowAutoPlay(false);
    setAutoPlayCancelled(false);

    // Load the new lesson into the global AudioContext (paused)
    playSource(`https://kilo-app-backend.onrender.com${lesson.audio}`);

    // If we have saved progress >5s, show resume prompt
    const savedTime = localStorage.getItem(`lesson-progress-${lesson._id}`);
    const resumedKey = sessionStorage.getItem(`resumed-${lesson._id}`);
    if (savedTime && !resumedKey && parseFloat(savedTime) > 5) {
      setResumeTime(parseFloat(savedTime));
      setResumePrompt(true);
    }

    setProgress(0);
    setLastToastLevel(null);

    // Inform backend of current lesson
    axios
      .post(
        'https://kilo-app-backend.onrender.com/api/users/current-lesson',
        { lessonId: lesson._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      )
      .catch((err) => console.error('Failed to save current lesson index:', err.message));

    // Store lastPlayedLessonId so Home can restore it
    localStorage.setItem('lastPlayedLessonId', lesson._id);
  }, [lesson, playSource]);

  // 2) Update percent + fire milestone toasts
  useEffect(() => {
    if (!duration) {
      setProgress(0);
      return;
    }
    const pct = (currentTime / duration) * 100;
    setProgress(pct);

    if (pct >= 99 && lastToastLevel !== 'done') {
      if (!completed.includes(lesson._id)) {
        onMarkComplete(lesson._id);
        axios
          .post(
            'https://kilo-app-backend.onrender.com/api/user/mark-complete',
            { lessonId: lesson._id },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
          )
          .catch((err) => console.error('Error saving completion:', err.message));
      }
      toast.success('🏁 ✅ Completed! Ready to level up.');
      setLastToastLevel('done');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
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
  }, [currentTime, duration, lastToastLevel, lesson._id, onMarkComplete, completed]);

  // 3) Watch for “audio ended” and initiate 10s countdown once
  useEffect(() => {
    if (!duration) return;

    // If we haven’t already triggered “ended” and currentTime ≥ duration - 0.1
    if (!hasEndedRef.current && currentTime >= duration - 0.1) {
      hasEndedRef.current = true;
      setShowAutoPlay(true);
      setAutoPlayTimer(10);

      let timer = 10;
      countdownRef.current = setInterval(() => {
        if (autoPlayCancelled) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setShowAutoPlay(false);
          return;
        }
        timer -= 1;
        setAutoPlayTimer(timer);
        if (timer <= 0) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setShowAutoPlay(false);
          onNext();
        }
      }, 1000);
    }

    // If user seeks back before end, reset the flag/timer
    if (hasEndedRef.current && currentTime < duration - 0.1) {
      hasEndedRef.current = false;
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setShowAutoPlay(false);
      }
    }
  }, [currentTime, duration, autoPlayCancelled, onNext]);

  // Format seconds → M:SS
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressMessage = () => {
    if (progress >= 99) return '🏁 ✅ Completed! Ready to level up.';
    if (progress >= 70) return '🔥 You’re almost done. Focus!';
    if (progress >= 50) return '⚡ Halfway there — don’t stop now!';
    if (progress >= 25) return '🎧 Nice flow... keep listening.';
    if (progress > 0) return '🚀 Let’s go! Your journey begins.';
    return null;
  };

  // Seek by clicking the progress bar
  const handleSeekClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  // Seek by dragging the slider
  const handleRangeChange = (e) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
  };

  const handleNextClick = async () => {
    if (!completed.includes(lesson._id)) {
      await axios
        .post(
          'https://kilo-app-backend.onrender.com/api/users/mark-complete',
          { lessonId: lesson._id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        )
        .catch((err) => console.error('Error saving completion:', err.message));
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
          <button className="neon-btn small" /* ... */>Yes, resume</button>
          <button className="neon-btn small" /* ... */>No, start over</button>
        </div>
      </div>
    </div>
  )}

  {showAutoPlay && (
    <div className="auto-play-overlay">
      <div className="countdown-box">
        <p>Auto‐playing next lesson in</p>
        <h1>{autoPlayTimer}s</h1>
        <div className="resume-btn-group">
          <button className="neon-btn small">⏭ Next Now</button>
          <button className="neon-btn small">✖ Stay Here</button>
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
    <p className="lesson-description">
      {lesson.description || 'No description provided.'}
    </p>

    <div className="tagline-badge">🚀 Let’s go! Your journey begins.</div>

    <div className="lesson-meta-bar">
      <div className="meta-item">📅 Day {lesson.day}</div>
      <div className="meta-item">⏱ {lesson.duration || 'Unknown'}</div>
      <div className="meta-item">🎧 {lesson.level}</div>
    </div>

    <div className="audio-controls-inline">
      <button className="play-inline-btn" onClick={togglePlay}>
        {isPlaying ? <FiPause /> : <FiPlay />}
      </button>

      <div className="progress-wrapper" onClick={handleSeekClick}>
        <div className="progress-bar-linear">
          <div
            className="progress-filled-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="time-stamps">
        <span>{formatTime(currentTime || 0)}</span>
        <span>/ {formatTime(duration || 0)}</span>
      </div>
    </div>

    <div className="nav-buttons">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="neon-btn small"
      >
        ⬅️ Previous
      </button>
      <button
        onClick={handleNextClick}
        disabled={currentIndex === totalLessons - 1 || (!isCompleted && progress < 70)}
        className={`neon-btn small ${(!isCompleted && progress < 70) ? 'disabled' : ''}`}
      >
        {isCompleted || progress >= 70 ? '➡️ Next' : '⏳ 70% to continue'}
      </button>
    </div>
  </div>
</div>

  );
};

export default AudioCard;
