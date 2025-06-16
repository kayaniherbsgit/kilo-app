import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProgramIntro.css';
import logo from '../assets/kayani-logo.jpg';

const ProgramIntro = () => {
  const navigate = useNavigate();

  return (
    <div className="program-container">
      <div className="intro-header">
        <img src={logo} alt="Kayani Logo" className="intro-logo" />
        <h1>Kayani Men Program</h1>
        <p className="tagline">🔥 Revive. Reclaim. Rise as a Man.</p>
      </div>

      <div className="intro-content">
        <h2>🌿 What is This Program?</h2>
        <p>
          A 28-day audio-therapy program combining traditional herbs, modern psychology, and real-life practices — tailored to bring back your confidence, strength, and stamina as a man.
        </p>

        <h2>💪 Benefits You’ll Get</h2>
        <ul>
          <li>✅ More rounds, more control in bed</li>
          <li>✅ Confidence that shows in and out of the bedroom</li>
          <li>✅ Daily natural rituals + exercises</li>
          <li>✅ No pills, no injections — just natural healing</li>
        </ul>

        <h2>📦 What’s Inside</h2>
        <p>
          ✔️ 28 Audio Lessons<br />
          ✔️ Herbs and Diet Recommendations<br />
          ✔️ Progress Tracker<br />
          ✔️ Men-Only Community Access
        </p>

        <div className="cta-buttons">
          <button className="register-btn" onClick={() => navigate('/register')}>
            🚀 Register & Start Free
          </button>
          <button className="login-btn" onClick={() => navigate('/login')}>
            🔐 Already Joined? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramIntro;
