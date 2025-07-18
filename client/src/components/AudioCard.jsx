import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import axios from 'axios';
import '../styles/AudioCard.css';
import { toast } from 'react-toastify';
import { useAudio } from '../contexts/AudioContext';
import Day2InteractiveStep from './Day2InteractiveStep';

const BASE_URL = import.meta.env.VITE_API_URL;

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
  const [isEightyPercentReached, setIsEightyPercentReached] = useState(completed.includes(lesson._id));
  const [showConfetti, setShowConfetti] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [autoPlayTimer, setAutoPlayTimer] = useState(10);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);
  const [delayedAutoPlay, setDelayedAutoPlay] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [width, height] = useWindowSize();
  const isCompleted = completed.includes(lesson._id);
  const { audioRef } = useAudio();
  const countdownRef = useRef(null);
  const delayTimerRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = Array.isArray(lesson.steps) && lesson.steps.length > 0 ? lesson.steps : [];
  const currentStep = steps[stepIndex] || {};
  const isDay2 = lesson.title?.toLowerCase().includes("hatua ya malengo");

  const trackEvent = async (event, data = {}) => {
    try {
      await axios.post(`${BASE_URL}/api/analytics/track`, {
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
    setIsEightyPercentReached(false);
    setShowAutoPlay(false);
    setAutoPlayCancelled(false);
    setDelayedAutoPlay(false);
    setStepIndex(0);
    setShowReflection(false);

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

    axios.post(`${BASE_URL}/api/users/current-lesson`, {
      lessonId: lesson._id
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).catch(err => console.error('Failed to save current lesson:', err.message));

    localStorage.setItem('lastPlayedLessonId', lesson._id);
  }, [lesson]);

  useEffect(() => {
  }, [isCompleted]);

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

      if (pct >= 80 && !isEightyPercentReached) {
        setIsEightyPercentReached(true);
        trackEvent('audio_80_percent', { lessonId: lesson._id, stepIndex, time: currentTime });
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
          axios.post(`${BASE_URL}/api/users/mark-complete`, {
            lessonId: lesson._id
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }).catch(err => console.error('Error saving completion:', err.message));
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
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', handleUpdate);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [audioRef, completed, lesson._id, onMarkComplete, stepIndex, currentStep, isEightyPercentReached]);

  const handleNextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="audio-card-container">
      {showConfetti && <Confetti width={width} height={height} />}
      {resumePrompt && (
        <div className="resume-modal">
          <div className="resume-box">
            <h4>⏪ Resume?</h4>
            <p>Continue from {Math.floor(resumeTime / 60)}:{String(Math.floor(resumeTime % 60)).padStart(2, '0')}</p>
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
      {!isDay2 || !showReflection ? (
        <>
          <h3 className="lesson-title">{lesson.title}</h3>
          {lesson.description && <p className="lesson-description">{lesson.description}</p>}
          {lesson.thumbnail && stepIndex === 0 && (
            <img
              src={lesson.thumbnail}
              alt="Lesson Thumbnail"
              className="lesson-thumbnail"
            />
          )}
          {currentStep.type === 'text' && (
            <div className="text-step-box">
              <p style={{ whiteSpace: 'pre-wrap' }}>{currentStep.content}</p>
              <button className="neon-btn small" onClick={handleNextStep}>⏭ Continue</button>
            </div>
          )}
          {currentStep.type === 'audio' && (
            <audio
              key={lesson._id + stepIndex}
              ref={audioRef}
              controls
              src={currentStep.src}
              style={{ width: '100%' }}
            />
          )}
          {isDay2 && isEightyPercentReached && (
            <button
              className="neon-btn enabled"
              style={{ marginTop: '1rem' }}
              onClick={() => setShowReflection(true)}
            >
              🧠 Jibu Maswali Haya
            </button>
          )}
        </>
      ) : (
        <Day2InteractiveStep
          lessonId={lesson._id}
          step={currentStep}
          audioRef={audioRef}
          onComplete={() => {
            setIsEightyPercentReached(true);
            toast.success('Day 2 Reflection Completed! ✅');
          }}
        />
      )}
      <div className="nav-buttons-wrapper">
        {currentIndex > 0 && (
          <button onClick={onPrev} className="neon-btn small prev-btn">⬅️ Previous</button>
        )}
        {stepIndex >= steps.length - 1 && currentIndex < totalLessons - 1 && (
          <button
            onClick={onNext}
            className="neon-btn small"
            style={{
              backgroundColor: isEightyPercentReached ? '#048547' : '#555',
              color: '#fff',
              cursor: isEightyPercentReached ? 'pointer' : 'not-allowed',
              opacity: isEightyPercentReached ? 1 : 0.6,
              boxShadow: isEightyPercentReached ? '0 0 10px #048547' : 'none',
            }}
            disabled={!isEightyPercentReached}
          >
            ➡️ Next Lesson
          </button>
        )}
        {stepIndex >= steps.length - 1 && !isEightyPercentReached && (
          <p className="audio-warning">
            ⏳ Listen to at least 80% of the audio to unlock the next lesson.
          </p>
        )}
      </div>
    </div>
  );
};

export default AudioCard;