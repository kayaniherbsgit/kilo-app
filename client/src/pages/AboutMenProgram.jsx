import React from 'react';
import './ProgramIntro.css';
import CloseButton from '../components/CloseButton';


const AboutMenProgram = () => {
  return (
    <div className="program-container">
        <CloseButton />

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
      <p className="features">
        ✔️ 28 Audio Lessons<br />
        ✔️ Herbs and Diet Recommendations<br />
        ✔️ Progress Tracker<br />
        ✔️ Men-Only Community Access
      </p>
    </div>
  );
};

export default AboutMenProgram;