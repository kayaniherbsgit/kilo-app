// src/components/NowPlayingBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { FiPlay, FiPause } from 'react-icons/fi';
import '../styles/NowPlayingBar.css';

export default function NowPlayingBar() {
  const { src, isPlaying, togglePlay, currentTime, duration } = useAudio();
  if (!src) return null;

  // REF to the bar's DOM node
  const barRef = useRef(null);

  // DRAG STATE
  const [pos, setPos] = useState({ x: 20, y: 20 });   // starting coordinates
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // RESIZE STATE
  const [size, setSize] = useState({ width: 300, height: 60 });
  const [resizing, setResizing] = useState(false);
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  // MOUSE MOVE & MOUSE UP listeners for both dragging & resizing
  useEffect(() => {
    const onMouseMove = (e) => {
      if (dragging) {
        // update position so that top-left = (mouse - offset)
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        setPos({ x: newX, y: newY });
      } else if (resizing) {
        // update size based on how far the mouse moved
        const dx = e.clientX - resizeStart.current.mx;
        const dy = e.clientY - resizeStart.current.my;
        const newW = Math.max(200, resizeStart.current.w + dx);
        const newH = Math.max(40, resizeStart.current.h + dy);
        setSize({ width: newW, height: newH });
      }
    };

    const onMouseUp = () => {
      setDragging(false);
      setResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, resizing]);

  // START DRAG when user clicks anywhere in the bar (except play/pause button or resize-handle)
  const handleBarMouseDown = (e) => {
    // If click is on the play/pause button or on the resize handle, DO NOT start a drag
    if (
      e.target.closest('.play-toggle-btn') ||
      e.target.closest('.resize-handle')
    ) {
      return;
    }
    e.preventDefault();
    setDragging(true);

    // Calculate the offset so the bar doesn't "jump" under the cursor
    const rect = barRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // START RESIZE when user clicks on the resize handle
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent starting a drag at the same time
    setResizing(true);
    resizeStart.current = {
      mx: e.clientX,
      my: e.clientY,
      w: size.width,
      h: size.height,
    };
  };

  // Format seconds → "M:SS"
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Derive a simple track name from the URL
  const trackName = src.split('/').pop().split('?')[0];

  return (
    <div
      ref={barRef}
      className="now-playing-bar"
      onMouseDown={handleBarMouseDown}
      style={{
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
      }}
    >
      <div className="content">
        <div className="track-info">
          <span className="track-name">{trackName}</span>
          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <button
          className="play-toggle-btn"
          onClick={togglePlay}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
        </button>
      </div>

      <div
        className="resize-handle"
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}
