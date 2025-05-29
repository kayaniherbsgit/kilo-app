import React, { useRef, useEffect, useState } from 'react';
import { FiPlay, FiPause, FiVolume2 } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../styles/AudioCard.css';

const AudioCard = ({
  lesson,
  currentIndex,
  totalLessons,
  onNext,
  onPrev,
  onMarkComplete,
  completed,
}) => {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [autoPlayTimer, setAutoPlayTimer] = useState(10);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [width, height] = useWindowSize();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;

      const savedTime = localStorage.getItem(`lesson-progress-${lesson._id}`);
      const resumed = sessionStorage.getItem(`resumed-${lesson._id}`);
      if (savedTime && !resumed && parseFloat(savedTime) > 5) {
        setResumeTime(parseFloat(savedTime));
        setResumePrompt(true);
      }
    }

    setProgress(0);
    setIsPlaying(false);
    setShowAutoPlay(false);
    setAutoPlayTimer(10);
    setShowConfetti(false);
    setAutoPlayCancelled(false);
  }, [lesson]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        const currentProgress = (audio.currentTime / audio.duration) * 100;
        if (currentProgress > 0) {
          localStorage.setItem(`lesson-progress-${lesson._id}`, audio.currentTime);
          fetch('http://localhost:5000/api/user/progress', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              lessonId: lesson._id,
              progress: currentProgress,
            }),
          });
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [lesson._id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const onProgress = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;
    setProgress(percent);

    if (percent >= 70 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      if (onMarkComplete && !completed.includes(lesson._id)) {
        onMarkComplete(lesson._id);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowAutoPlay(true);
    setAutoPlayCancelled(false);
    let timer = 10;

    const interval = setInterval(() => {
      if (autoPlayCancelled) {
        clearInterval(interval);
        setShowAutoPlay(false);
        return;
      }

      timer -= 1;
      setAutoPlayTimer(timer);
      if (timer === 0) {
        clearInterval(interval);
        setShowAutoPlay(false);
        onNext();
      }
    }, 1000);
  };

  const handleNextClick = () => {
    if (progress < 70) {
      toast.info('Please listen to at least 70% of the lesson to proceed.');
      return;
    }
    onNext();
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="card audio-card-container">
      <ToastContainer position="top-center" />
      {showConfetti && <Confetti width={width} height={height} />}

      {resumePrompt && (
        <div className="resume-modal">
          <div className="resume-box">
            <h4>⏪ Resume?</h4>
            <p>Do you want to continue from where you left off?</p>
            <div className="resume-btn-group">
              <button
                className="neon-btn"
                onClick={() => {
                  audioRef.current.currentTime = resumeTime;
                  sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                  setResumePrompt(false);
                }}
              >
                Yes, resume
              </button>
              <button
                className="neon-btn"
                onClick={() => {
                  audioRef.current.currentTime = 0;
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
              <button className="neon-btn" onClick={() => {
                setShowAutoPlay(false);
                onNext();
              }}>
                ⏭ Go to Next Now
              </button>
              <button className="neon-btn" onClick={() => {
                setAutoPlayCancelled(true);
                setShowAutoPlay(false);
              }}>
                ✖ Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      {lesson.thumbnail && (
        <img src={`http://localhost:5000${lesson.thumbnail}`} alt="Lesson" className="lesson-thumbnail" />
      )}

      <h3 style={{ marginBottom: '0.4rem' }}>{lesson.title}</h3>
      <p className="meta-text">
        📅 Day {lesson.day} | 🎧 {lesson.duration || 'Unknown'} | 🧠 {lesson.level}
      </p>
      <p className="lesson-description">{lesson.description || 'No description provided.'}</p>

      <audio
        ref={audioRef}
        onTimeUpdate={onProgress}
        onEnded={handleEnded}
        src={`http://localhost:5000${lesson.audio}`}
      />

      <div className="ring-wrapper">
        <CircularProgressbarWithChildren
          value={progress}
          strokeWidth={8}
          styles={buildStyles({
            pathColor: 'var(--accent)',
            trailColor: '#2b2b2b',
            strokeLinecap: 'round',
          })}
        >
          <button onClick={togglePlay} className="glow-play-btn" aria-label="Play or Pause">
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
        </CircularProgressbarWithChildren>
      </div>

      <div className="progress-container">
        <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
        <input
          type="range"
          value={audioRef.current?.currentTime || 0}
          min={0}
          max={audioRef.current?.duration || 1}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            audioRef.current.currentTime = val;
          }}
        />
        <span>{formatTime(audioRef.current?.duration || 0)}</span>
      </div>

      <div className="volume-control">
        <FiVolume2 />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>

      <div className="nav-buttons">
        <button onClick={onPrev} disabled={currentIndex === 0} className="neon-btn">
          ⬅️ Previous Lesson
        </button>
        <button
          onClick={handleNextClick}
          disabled={currentIndex === totalLessons - 1}
          className={`neon-btn ${progress < 70 ? 'disabled' : ''}`}
        >
          {progress >= 70 ? '➡️ Next Lesson' : '⏳ Listen 70% to continue'}
        </button>
      </div>
    </div>
  );
};

export default AudioCard;