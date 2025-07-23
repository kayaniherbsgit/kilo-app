import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/Day2Reflection.css';
import finalAudioSrc from '../assets/audio/lesson2-final.opus';
import bonusAudioSrc from '../assets/audio/lesson2-bonus.opus';

const BASE_URL = import.meta.env.VITE_API_URL;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleSubmitAnswers = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        lesson: "Hatua Ya Malengo",
        answers: questions.map((q, i) => ({
          question: q,
          answer: answers[i],
        })),
      };

      const res = await axios.post(`${BASE_URL}/api/responses/day2`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Failed to submit answers:', err.message);
      alert("Imeshindikana kutuma majibu. Tafadhali jaribu tena.");
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <div className="day2-box">
    <div className="day2-header">
      <span className="brain-icon">🧠</span>
      <h4>Hapa Nimekuelekeza Jinsi Ya Kuweka Malengo Yako🗒</h4>
    </div>

    <div>
      <h4>🔊 Sikiliza Audio Yote</h4>
      <audio ref={finalAudioRef} controls src={finalAudioSrc} />
      <p>🎯 Sikiliza hadi 80% ili kufungua maswali</p>
    </div>

    {/* ✅ WRAPPER FOR QUESTION + PREVIEW */}
    <div className="interactive-content">
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
    </div>

    {/* ✅ BONUS AUDIO SECTION */}
    {canPlayBonus && (
      <div>
        <h4 className="pink-title">💎 Bonus Audio</h4>
        <audio ref={bonusAudioRef} controls src={bonusAudioSrc} />
        <p>🌟 Sikiliza audio hii ya ziada kwa undani zaidi</p>

        {submitSuccess ? (
          <p style={{ color: '#4ade80', fontWeight: 'bold', marginTop: '1rem' }}>
            ✅ Majibu yako yamesharekewa salama!
          </p>
        ) : (
          <button
            className="neon-btn green"
            onClick={handleSubmitAnswers}
            disabled={isSubmitting}
            style={{ marginTop: '1.2rem' }}
          >
            📤 {isSubmitting ? "Inatuma..." : "Share Majibu Yako"}
          </button>
        )}
      </div>
    )}
  </div>
);

};

export default Day2InteractiveStep;