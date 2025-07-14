import React, { useState, useEffect } from 'react';

const questions = [
  "Unatamani kuona nini kunatokea kwenye Mahusiano Yako?",
  "Unatamani Mke Wako akuchukuliaje?",
  "Unatamani Performance yako Iweje Kwa Bed?",
  "Mambo gani Unatakiwa Kuzingatia au Kufanya Ili Utimize Maono yako Haya?"
];

const bonusAudio = "https://your-link.com/audio2.mp3";
const finalAudio = "https://your-link.com/audio3.mp3";

const Day2InteractiveStep = ({ onComplete, audioRef }) => {
  const [answers, setAnswers] = useState(Array(4).fill(''));
  const [showInput, setShowInput] = useState(Array(4).fill(false));
  const [showPreview, setShowPreview] = useState(false);
  const [canPlayBonus, setCanPlayBonus] = useState(false);
  const [canPlayFinal, setCanPlayFinal] = useState(false);
  const [bonusComplete, setBonusComplete] = useState(false);
  const [finalComplete, setFinalComplete] = useState(false);

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
    const audio = audioRef.current;
    if (!audio || !canPlayBonus || bonusComplete) return;

    const updateProgress = () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (pct >= 80 && !bonusComplete) {
        setBonusComplete(true);
        setCanPlayFinal(true);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [canPlayBonus, bonusComplete, audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !canPlayFinal || finalComplete) return;

    const updateFinalProgress = () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (pct >= 80 && !finalComplete) {
        setFinalComplete(true);
        onComplete(); // Unlock next lesson
      }
    };

    audio.addEventListener('timeupdate', updateFinalProgress);
    return () => audio.removeEventListener('timeupdate', updateFinalProgress);
  }, [canPlayFinal, finalComplete, audioRef, onComplete]);

  return (
    <div className="day2-box">
      <h4>🧠 Jibu Maswali Haya Kwa Kuandika Kwenye Notebook 🗒</h4>

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

      {allAnswered && !showPreview && (
        <button className="neon-btn green" onClick={() => setShowPreview(true)}>
          ✅ Preview Majibu
        </button>
      )}

      {showPreview && !canPlayBonus && (
        <div className="preview-box">
          <h4>🔍 Mapitio Ya Majibu</h4>
          {questions.map((q, i) => (
            <div key={i}>
              <p><strong>{q}</strong></p>
              <p>{answers[i]}</p>
            </div>
          ))}
          <button className="neon-btn green" onClick={() => setCanPlayBonus(true)}>
            🎧 Niko Tayari, Cheza Audio
          </button>
          <button className="neon-btn small" onClick={() => setShowPreview(false)}>
            ✏️ Badilisha
          </button>
        </div>
      )}

      {canPlayBonus && !canPlayFinal && (
        <div>
          <h4>🎧 Bonus Audio</h4>
          <audio ref={audioRef} controls src={bonusAudio} />
          <p>👉 Sikiliza angalau 80% ili kufungua audio ya mwisho</p>
        </div>
      )}

      {canPlayFinal && (
        <div>
          <h4>🔊 Final Audio</h4>
          <audio ref={audioRef} controls src={finalAudio} />
          <p>✅ Sikiliza hadi 80% kumaliza somo hili kikamilifu</p>
        </div>
      )}
    </div>
  );
};

export default Day2InteractiveStep;
