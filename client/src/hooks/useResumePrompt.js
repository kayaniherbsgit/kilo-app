import { useState, useEffect } from 'react';

export const useResumePrompt = (lesson, audioRef) => {
  const [resumePrompt, setResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`lesson-progress-${lesson._id}`);
    const resumedFlag = sessionStorage.getItem(`resumed-${lesson._id}`);

    if (saved && !resumedFlag && parseFloat(saved) > 5) {
      setResumeTime(parseFloat(saved));
      setResumePrompt(true);
    }
  }, [lesson._id]);

  const handleResume = (shouldResume) => {
    if (audioRef.current) {
      audioRef.current.currentTime = shouldResume ? resumeTime : 0;
    }
    sessionStorage.setItem(`resumed-${lesson._id}`, 'true');
    setResumePrompt(false);
  };

  return { resumePrompt, resumeTime, handleResume };
};