import React, { useState, useEffect, useRef } from 'react';
import '../styles/Day2Reflection.css';
import finalAudioSrc from '../assets/audio/lesson2-final.opus';
import bonusAudioSrc from '../assets/audio/lesson2-bonus.opus';

const questions = [
  "Unatamani kuona nini kunatokea kwenye Mahusiano Yako?",
  "Unatamani Mke Wako akuchukuliaje?",
  "Unatamani Performance yako Iweje Kwa Bed?",
  "Mambo gani Unatakiwa Kuzingatia au Kufanya Ili Utimize Maono yako Haya?"
];

const Day2InteractiveStep = ({ onComplete }) => {
  const finalAudioRef = useRef(null);
  const bonusAudioRef = useRef(null);

  const [answers, setAnswers] = useState(Array(4).fill(''));
  const [showInput, setShowInput] = useState(Array(4).fill(false));
  const [showPreview, setShowPreview] = useState(false);
  const [canPlayBonus, setCanPlayBonus] = useState(false);
  const [finalComplete, setFinalComplete] = useState(false);
  const [bonusComplete, setBonusComplete] = useState(false);

  const toggleInput = (index) => {
    const updated = [...showInput];
    updated[index] = !updated[index];
    setShowInput(updated);
  };

  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const allAnswered = answers.every(ans => ans.trim() !== '');

  useEffect(() => {
    const audio = finalAudioRef.current;
    if (!audio || finalComplete) return;

    const updateProgress = () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (pct >= 80 && !finalComplete) {
        setFinalComplete(true);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [finalComplete]);

  useEffect(() => {
    const audio = bonusAudioRef.current;
    if (!audio || !canPlayBonus || bonusComplete) return;

    const updateProgress = () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (pct >= 80 && !bonusComplete) {
        setBonusComplete(true);
        onComplete();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [canPlayBonus, bonusComplete, onComplete]);

  return (
    <div className="day2-box">
      <div className="day2-header">
        <span className="brain-icon">🧠</span>
        <h4>Hapa Nimekuelekeza Jinsi Ya Kuweka Malengo Yako🗒</h4>
      </div>

      {/* 1️⃣ Final Audio */}
      <div>
        <h4>🔊 Sikiliza Audio Yote</h4>
        <audio ref={finalAudioRef} controls src={finalAudioSrc} />
        <p>🎯 Sikiliza hadi 80% ili kufungua maswali</p>
      </div>

      {/* 2️⃣ Questions */}
      {finalComplete && !showPreview && (
        <div className="questions-box">
          {questions.map((q, i) => (
            <div key={i} className="question">
              <p>❓ {q}</p>
              {!showInput[i] && (
                <button className="neon-btn small" onClick={() => toggleInput(i)}>
                  ✍️ Answer Question
                </button>
              )}
              {showInput[i] && (
                <textarea
                  placeholder="Andika jibu lako hapa..."
                  value={answers[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                />
              )}
            </div>
          ))}
          {allAnswered && (
            <button className="neon-btn green" onClick={() => setShowPreview(true)}>
              ✅ Hakikisha Majibu Yako
            </button>
          )}
        </div>
      )}

      {/* 3️⃣ Preview and Bonus Audio */}
      {showPreview && (
        <div className="preview-box">
          <h4>🔍 Mapitio Ya Majibu</h4>
          {questions.map((q, i) => (
            <div key={i}>
              <p><strong>{q}</strong></p>
              <p>{answers[i]}</p>
            </div>
          ))}
          <button className="neon-btn green" onClick={() => setCanPlayBonus(true)}>
            🎧 Majibu Yako Sawa, Tuendelee
          </button>
        </div>
      )}

      {canPlayBonus && (
        <div>
          <h4>💎 Bonus Audio</h4>
          <audio ref={bonusAudioRef} controls src={bonusAudioSrc} />
          <p>🌟 Sikiliza audio hii ya ziada kwa undani zaidi</p>
        </div>
      )}
    </div>
  );
};

export default Day2InteractiveStep;