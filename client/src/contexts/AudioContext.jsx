// src/contexts/AudioContext.jsx
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback
} from 'react';

const AudioContext = createContext({
  src: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playSource: (srcUrl) => {},
  togglePlay: () => {},
  seekTo: (time) => {},
});

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [src, setSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Whenever `src` changes, pause old, load new, then attempt to play
  useEffect(() => {
    const audio = audioRef.current;
    if (!src) return;

    // 1) Stop any previous playback
    audio.pause();
    audio.currentTime = 0;

    // 2) Set new source and load
    audio.src = src;
    audio.load();

    // 3) Play (catch AbortError if user hasn’t interacted)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Audio play error:', err.message);
          setIsPlaying(false);
        });
    }
  }, [src]);

  // timeupdate / loadedmetadata / ended listeners
  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Exposed methods:

  const playSource = useCallback((newSrc) => {
    setSrc(newSrc);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekTo = useCallback((time) => {
    const audio = audioRef.current;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        src,
        isPlaying,
        currentTime,
        duration,
        playSource,
        togglePlay,
        seekTo,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
