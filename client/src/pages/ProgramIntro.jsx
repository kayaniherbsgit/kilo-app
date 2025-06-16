import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProgramIntro.css';
import logo from '../assets/kayani-logo.jpg';
import CloseButton from '../components/CloseButton';

const images = [
  '/images/kpg1.jpg',
  '/images/kpg2.jpg',
  '/images/kpg3.jpg',
  '/images/kpg4.jpg',
  '/images/kpg5.jpg',
  '/images/kpg6.jpg',
  '/images/kpg7.jpg',
  '/images/kpg8.jpg',
];

const ProgramIntro = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="program-container">

      <CloseButton />

      <div className="carousel-wrapper">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            className={`carousel-img ${index === currentImage ? 'active' : ''}`}
            alt={`Slide ${index + 1}`}
          />
        ))}
        <div className="program-overlay" />
      </div>

      <div className="program-content">
        <img src={logo} alt="Kayani Logo" className="intro-logo" />
        <h1>Kayani Men Program</h1>
        <p className="tagline">🔥 Revive. Reclaim. Rise as a Man.</p>

        <div className="cta-buttons">
          <button className="register-btn" onClick={() => navigate('/register')}>
            🚀 Register & Start Free
          </button>
          <button className="login-btn" onClick={() => navigate('/login')}>
            🔐 Already Joined? Login
          </button>
          <button className="info-btn" onClick={() => navigate('/about-men-program')}>
            📖 Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramIntro;
