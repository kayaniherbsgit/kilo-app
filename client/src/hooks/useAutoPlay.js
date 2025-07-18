import { useState, useEffect, useRef } from 'react';

export const useAutoPlay = (stepIndex, steps, onNext) => {
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState(10);
  const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);
  const countdownRef = useRef(null);

  const startAutoPlay = () => {
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
          // Move to next step
        }
      }, 1000);
    } else {
      onNext();
    }
  };

  const cancelAutoPlay = () => {
    setAutoPlayCancelled(true);
    setShowAutoPlay(false);
    clearInterval(countdownRef.current);
  };

  const skipTimer = () => {
    clearInterval(countdownRef.current);
    setShowAutoPlay(false);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return {
    showAutoPlay,
    autoPlayTimer,
    startAutoPlay,
    cancelAutoPlay,
    skipTimer
  };
};