import { useState, useEffect, useRef } from 'react';

export const useAudioProgress = (audioRef, lesson, onMarkComplete, completed) => {
  const [progress, setProgress] = useState(0);
  const [isEightyPercentReached, setIsEightyPercentReached] = useState(
    completed.includes(lesson._id)
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 1;
      const pct = (currentTime / duration) * 100;
      
      setProgress(pct);
      localStorage.setItem(`lesson-progress-${lesson._id}`, currentTime);

      if (pct >= 80 && !isEightyPercentReached) {
        setIsEightyPercentReached(true);
      }

      if (pct >= 99 && !completed.includes(lesson._id)) {
        onMarkComplete(lesson._id);
      }
    };

    audio.addEventListener('timeupdate', handleUpdate);
    return () => audio.removeEventListener('timeupdate', handleUpdate);
  }, [audioRef, lesson._id, isEightyPercentReached, completed, onMarkComplete]);

  return { progress, isEightyPercentReached };
};
