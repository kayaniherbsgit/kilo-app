// src/components/CloseButton.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CloseButton.css';

const CloseButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home
  if (location.pathname === '/' || location.pathname === '/home') return null;

  return (
    <button className="close-btn" onClick={() => navigate(-1)}>
      ❌
    </button>
  );
};

export default CloseButton;
