import React, { useRef, useEffect, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi';

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setProgress(0);
    setIsPlaying(false);
    setCanMark(false);
  }, [lesson]);

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

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
      <h3>{lesson.title}</h3>
      <p>{lesson.description || 'No description provided.'}</p>

      <audio
        ref={audioRef}
        onTimeUpdate={onProgress}
        onEnded={() => setIsPlaying(false)}
        src={`http://localhost:5000${lesson.audio}`}
      />

      <div style={{ margin: '1rem 0' }}>
        <div className="audio-btn-group">
          <button onClick={onPrev} className="icon-btn" disabled={currentIndex === 0}>
            <FiSkipBack />
          </button>

          <button onClick={togglePlay} className="icon-btn" style={{ background: 'var(--accent)' }}>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>

          <button
            onClick={onNext}
            className="icon-btn"
            disabled={currentIndex === totalLessons - 1 || !completed.includes(lesson._id)}
          >
            <FiSkipForward />
          </button>
        </div>
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