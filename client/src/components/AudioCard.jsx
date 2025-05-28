import React, { useRef, useEffect, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2 } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const AudioCard = ({
  lesson,
  currentIndex,
  totalLessons,
  onNext,
  onPrev,
  completed,
  onMarkComplete,
}) => {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canMark, setCanMark] = useState(false);
  const [volume, setVolume] = useState(1);
  const [autoPlayTimer, setAutoPlayTimer] = useState(10);
  const [showAutoPlay, setShowAutoPlay] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;
    }
    setProgress(0);
    setIsPlaying(false);
    setCanMark(false);
    setShowAutoPlay(false);
    setAutoPlayTimer(10);
  }, [lesson]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onProgress = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    setProgress(percent);
    if (percent >= 70) setCanMark(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (completed.includes(lesson._id)) {
      setShowAutoPlay(true);
      let timer = 10;
      const interval = setInterval(() => {
        timer -= 1;
        setAutoPlayTimer(timer);
        if (timer === 0) {
          clearInterval(interval);
          setShowAutoPlay(false);
          onNext();
        }
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="card audio-card-container">
      {showAutoPlay && (
        <div className="auto-play-overlay">
          <div className="countdown-box">
            <p>Auto-playing next lesson in</p>
            <h1>{autoPlayTimer}s</h1>
          </div>
        </div>
      )}

      {lesson.thumbnail && (
        <img
          src={`http://localhost:5000${lesson.thumbnail}`}
          alt="Lesson"
          className="lesson-thumbnail"
        />
      )}

      <h3 style={{ marginBottom: '0.4rem' }}>{lesson.title}</h3>
      <p className="meta-text">
        📅 Day {lesson.day} | 🎧 {lesson.duration || 'Unknown'} | 🧠 {lesson.level}
      </p>
      <p style={{ color: 'var(--subtext)', fontSize: '0.9rem', marginTop: '0.6rem' }}>
        {lesson.description || 'No description provided.'}
      </p>

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
          <button
            onClick={togglePlay}
            className="glow-play-btn"
            aria-label="Play or Pause"
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
        </CircularProgressbarWithChildren>
      </div>

      <div className="audio-btn-group" style={{ marginTop: '1.4rem' }}>
        <button onClick={onPrev} className="icon-btn" disabled={currentIndex === 0}>
          <FiSkipBack />
        </button>
        <button
          onClick={onNext}
          className="icon-btn"
          disabled={currentIndex === totalLessons - 1 || !completed.includes(lesson._id)}
        >
          <FiSkipForward />
        </button>
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

      <button
        onClick={() => onMarkComplete(lesson._id)}
        disabled={completed.includes(lesson._id) || !canMark}
        className="neon-btn"
      >
        {completed.includes(lesson._id) ? '✅ Completed' : 'Mark as Completed'}
      </button>
    </div>
  );
};

export default AudioCard;
