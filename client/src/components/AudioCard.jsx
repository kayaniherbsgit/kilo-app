import React, { useRef, useEffect, useState } from 'react';
import { FiPlay, FiPause, FiVolume2 } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import '../styles/AudioCard.css';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

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
  const [lastToastLevel, setLastToastLevel] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [width, height] = useWindowSize();
  const isCompleted = completed.includes(lesson._id);

  useEffect(() => {

      console.log("🔊 Audio URL in use:", lesson.audio); // 👈 ADD THIS LINE HERE

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
    setLastToastLevel(null);

    axios.post('http://localhost:5000/api/users/current-lesson', {
      lessonId: lesson._id,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).catch((err) => {
      console.error('Failed to save current lesson index:', err.message);
    });

    if (lesson && lesson._id) {
      localStorage.setItem('lastPlayedLessonId', lesson._id);
    }

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
          axios.patch('http://localhost:5000/api/users/progress', {
            lessonId: lesson._id,
            progress: currentProgress,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }).catch((err) => {
            console.error('Error saving progress:', err.message);
          });
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [lesson._id]);

const togglePlay = () => {
  const audio = audioRef.current;
  if (!audio) return;

  if (isPlaying) {
    audio.pause();
    setIsPlaying(false);
  } else {
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.warn("Audio play error:", err.message));
  }
};


  const onProgress = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;
    setProgress(percent);

    if (percent >= 99 && lastToastLevel !== 'done') {
      if (onMarkComplete && !completed.includes(lesson._id)) {
        onMarkComplete(lesson._id);
      }

      axios.post('http://localhost:5000/api/user/mark-complete', {
        lessonId: lesson._id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }).catch((err) => {
        console.error('Error saving completion:', err.message);
      });

      toast.success("🏁 ✅ Completed! Ready to level up.");
      setLastToastLevel('done');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else if (percent >= 70 && percent < 99 && lastToastLevel !== 'almost') {
      toast.info("🔥 You’re almost done. Focus!");
      setLastToastLevel('almost');
    } else if (percent >= 50 && percent < 70 && lastToastLevel !== 'half') {
      toast.info("⚡ Halfway there — don’t stop now!");
      setLastToastLevel('half');
    } else if (percent >= 25 && percent < 50 && lastToastLevel !== 'quarter') {
      toast.info("🎧 Nice flow... keep listening.");
      setLastToastLevel('quarter');
    } else if (percent > 0 && percent < 25 && lastToastLevel !== 'start') {
      toast.info("🚀 Let’s go! Your journey begins.");
      setLastToastLevel('start');
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowAutoPlay(true);
    setAutoPlayCancelled(false);
    setIsExpanded(false); // ✅ Collapse when audio ends
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

  const handleNextClick = async () => {
    if (!completed.includes(lesson._id)) {
      await axios.post('http://localhost:5000/api/users/mark-complete', {
        lessonId: lesson._id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      onMarkComplete(lesson._id);
    }
    onNext();
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const progressMessage = () => {
    if (progress >= 99) return "🏁 ✅ Completed! Ready to level up.";
    if (progress >= 70) return "🔥 You’re almost done. Focus!";
    if (progress >= 50) return "⚡ Halfway there — don’t stop now!";
    if (progress >= 25) return "🎧 Nice flow... keep listening.";
    if (progress > 0) return "🚀 Let’s go! Your journey begins.";
    return null;
  };

  return (
    <div className={`card audio-card-container ${isCompleted ? 'lesson-completed' : 'pending'}`}>
      <ToastContainer position="top-center" />
      {showConfetti && <Confetti width={width} height={height} />}

      {resumePrompt && (
        <div className="resume-modal">
          <div className="resume-box">
            <h4>⏪ Resume?</h4>
            <p>Do you want to continue from where you left off?</p>
            <div className="resume-btn-group">
              <button className="neon-btn" onClick={() => {
                audioRef.current.currentTime = resumeTime;
                sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                setResumePrompt(false);
              }}>Yes, resume</button>
              <button className="neon-btn" onClick={() => {
                audioRef.current.currentTime = 0;
                sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
                setResumePrompt(false);
              }}>No, start over</button>
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
              }}>⏭ Go to Next Now</button>
              <button className="neon-btn" onClick={() => {
                setAutoPlayCancelled(true);
                setShowAutoPlay(false);
              }}>✖ Stay Here</button>
            </div>
          </div>
        </div>
      )}

      {lesson.thumbnail && (
        <img src={`http://localhost:5000${lesson.thumbnail}`} alt="Lesson" className="lesson-thumbnail" />
      )}

      <h3>{lesson.title}</h3>
      <div style={{ margin: '1rem 0' }}>
</div>
      {progressMessage() && <div className="progress-badge">{progressMessage()}</div>}
      {isCompleted && (
        <p className="completed-tag">✅ Lesson Completed</p>
      )}
<div className="lesson-meta-bar">
  <div className="meta-item">📅 <span>Day {lesson.day}</span></div>
  <div className="meta-item">🎧 <span>{lesson.duration || 'Unknown'}</span></div>
  <div className="meta-item">🧠 <span>{lesson.level}</span></div>
</div>

<div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
  <button className="toggle-btn" onClick={() => setIsExpanded(prev => !prev)}>
    {isExpanded ? <FiChevronUp /> : <FiChevronDown />} {isExpanded ? 'Hide Details' : 'Show Details'}
  </button>
</div>


     {isExpanded && (
  <div className="expand-wrapper">
    <div className={`expandable-section ${isExpanded ? 'expanded' : ''}`}>
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