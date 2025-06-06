// src/components/AudioCard.jsx
import React, { useEffect, useState } from 'react';
import { FiPlay, FiPause, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
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

  const [progress, setProgress] = useState(0);            // percent 0–100
  const [showConfetti, setShowConfetti] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [lastToastLevel, setLastToastLevel] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState(10);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);

  const [width, height] = useWindowSize();
  const isCompleted = completed.includes(lesson._id);

  // 1) Whenever `lesson` changes:
  useEffect(() => {
    // Start playback of the new lesson via global AudioContext
    playSource(`https://kilo-app-backend.onrender.com${lesson.audio}`);

    // Check if we should prompt “Resume from savedTime?”
    const savedTime = localStorage.getItem(`lesson-progress-${lesson._id}`);
    const resumedKey = sessionStorage.getItem(`resumed-${lesson._id}`);
    if (savedTime && !resumedKey && parseFloat(savedTime) > 5) {
      setResumeTime(parseFloat(savedTime));
      setResumePrompt(true);
    }

    // Reset UI flags whenever the lesson changes
    setProgress(0);
    setShowAutoPlay(false);
    setAutoPlayTimer(10);
    setShowConfetti(false);
    setAutoPlayCancelled(false);
    setLastToastLevel(null);

    // Inform backend of “current lesson”
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

    // Milestone toasts/Confetti exactly once per threshold
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
  }, [
    currentTime,
    duration,
    lastToastLevel,
    lesson._id,
    onMarkComplete,
    completed,
  ]);

  // 3) When the track ends, show auto‐play overlay
  useEffect(() => {
    if (duration && currentTime >= duration) {
      setShowAutoPlay(true);
      setAutoPlayCancelled(false);
      setIsExpanded(false);

      let timer = 10;
      setAutoPlayTimer(10);
      const countdown = setInterval(() => {
        if (autoPlayCancelled) {
          clearInterval(countdown);
          setShowAutoPlay(false);
          return;
        }
        timer -= 1;
        setAutoPlayTimer(timer);
        if (timer <= 0) {
          clearInterval(countdown);
          setShowAutoPlay(false);
          onNext();
        }
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [currentTime, duration, autoPlayCancelled, onNext]);

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
    <div className={`card audio-card-container ${isCompleted ? 'lesson-completed' : 'pending'}`}>
      {showConfetti && <Confetti width={width} height={height} />}

      {resumePrompt && (
        <div className="resume-modal">
          <div className="resume-box">
            <h4>⏪ Resume?</h4>
            <p>Do you want to continue from {formatTime(resumeTime)}?</p>
            <div className="resume-btn-group">
              <button
                className="neon-btn"
                onClick={() => {
                  seekTo(resumeTime);
                  sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                  setResumePrompt(false);
                }}
              >
                Yes, resume
              </button>
              <button
                className="neon-btn"
                onClick={() => {
                  seekTo(0);
                  sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                  setResumePrompt(false);
                }}
              >
                No, start over
              </button>
            </div>
          </div>
        </div>
      )}

      {showAutoPlay && (
        <div className="auto-play-overlay">
          <div className="countdown-box">
            <p>Auto-playing next lesson in</p>
            <h1>{autoPlayTimer}s</h1>
            <div className="resume-btn-group" style={{ marginTop: '1rem' }}>
              <button
                className="neon-btn"
                onClick={() => {
                  setShowAutoPlay(false);
                  onNext();
                }}
              >
                ⏭ Go to Next Now
              </button>
              <button
                className="neon-btn"
                onClick={() => {
                  setAutoPlayCancelled(true);
                  setShowAutoPlay(false);
                }}
              >
                ✖ Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      {lesson.thumbnail && (
        <img
          src={`https://kilo-app-backend.onrender.com${lesson.thumbnail}`}
          alt="Lesson"
          className="lesson-thumbnail"
        />
      )}

      <h3>{lesson.title}</h3>
      <div style={{ margin: '1rem 0' }} />

      {progressMessage() && <div className="progress-badge">{progressMessage()}</div>}
      {isCompleted && <p className="completed-tag">✅ Lesson Completed</p>}

      <div className="lesson-meta-bar">
        <div className="meta-item">
          📅 <span>Day {lesson.day}</span>
        </div>
        <div className="meta-item">
          🎧 <span>{lesson.duration || 'Unknown'}</span>
        </div>
        <div className="meta-item">
          🧠 <span>{lesson.level}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
        <button className="toggle-btn" onClick={() => setIsExpanded((prev) => !prev)}>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />} {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {isExpanded && (
        <div className="expand-wrapper">
          <div className={`expandable-section ${isExpanded ? 'expanded' : ''}`}>
            <p className="lesson-description">{lesson.description || 'No description provided.'}</p>

            <div className="ring-wrapper">
              <CircularProgressbarWithChildren
                value={progress}
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: '#07bc0c',
                  trailColor: '#333',
                  strokeLinecap: 'round',
                })}
              >
                <button onClick={togglePlay} className="glow-play-btn" aria-label="Play or Pause">
                  {isPlaying ? <FiPause /> : <FiPlay />}
                </button>
              </CircularProgressbarWithChildren>
            </div>

            <div className="progress-container">
              <span>{formatTime(currentTime || 0)}</span>
              <input
                type="range"
                value={currentTime || 0}
                min="0"
                max={duration || 1}
                step="0.1"
                onChange={handleRangeChange}
                className="progress-range"
              />
              <span>{formatTime(duration || 0)}</span>
            </div>

            <div className="progress-bar" onClick={handleSeekClick}>
              <div className="progress-filled" style={{ width: `${progress}%` }} />
            </div>

            <div className="nav-buttons">
              <button onClick={onPrev} disabled={currentIndex === 0} className="neon-btn">
                ⬅️ Previous Lesson
              </button>
              <button
                onClick={handleNextClick}
                disabled={currentIndex === totalLessons - 1 || (!isCompleted && progress < 70)}
                className={`neon-btn ${!isCompleted && progress < 70 ? 'disabled' : ''}`}
              >
                {isCompleted || progress >= 70 ? '➡️ Next Lesson' : '⏳ Listen 70% to continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioCard;