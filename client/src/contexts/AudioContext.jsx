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

  // Whenever `src` changes, pause old, load new, but DO NOT auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!src) return;

    // 1) Pause any in‐flight playback
    audio.pause();
    // 2) Reset currentTime to 0 (so new track always starts at 0)
    audio.currentTime = 0;

    // 3) Update the source and load
    audio.src = src;
    audio.load();

    // We intentionally do NOT call `audio.play()` here.
    // Playback will begin only when the user taps Play via togglePlay().
    setIsPlaying(false);
  }, [src]);

  // Add timeupdate / loadedmetadata / ended listeners
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

  // playSource: load a brand‐new `src` (but do NOT start playback)
  const playSource = useCallback(
    (newSrc) => {
      setSrc(newSrc);
      // Playback stays paused until togglePlay() is called
    },
    []
  );

  // togglePlay: if paused, attempt to play; otherwise, pause
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

  // seekTo: jump to a specific time
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
