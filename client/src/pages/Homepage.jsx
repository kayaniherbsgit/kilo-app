import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import logo from '../assets/kayani-logo.jpg';

const programList = [
  { name: 'Kayani Men Program', path: '/program-intro' },
  { name: 'Tumbolux Program', path: '/digestive' },
  { name: 'Bawasiri Cure Program', path: '/women' },
];

const carouselImages = [
  '/images/kayani1.jpg',
  '/images/kayani2.jpg',
  '/images/kayani3.png',
];

const infoCards = [
  '🍃 100% Herbal Formulations — Trusted by thousands.',
  '🧠 Energy, Digestion, Fertility, Mental Calm.',
  '🌍 Healing Africa with Pure Remedies.',
];

const Homepage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    const imgTimer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(imgTimer);
  }, []);

  const enterProgram = () => {
    setLoading(true);
    setTimeout(() => navigate('/program-intro'), 2000);
  };

  return (
    <div className="landing-container">
      <div className="overlay" />

      {/* Top Navigation */}
      <div className="top-bar">
        <div className="brand">
          <img src={logo} alt="Kayani Herbs" className="small-logo" />
          <span className="brand-name">Kayani Herbs</span>
        </div>

        <div className="menu">
          <button onClick={() => setMenuOpen(!menuOpen)} className="menu-btn">☰</button>
          {menuOpen && (
            <div className="menu-dropdown">
              {programList.map((prog, i) => (
                <div
                  key={i}
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(prog.path);
                  }}
                >
                  {prog.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Hero Carousel */}
      <section className="hero-section">
        <img
          src={carouselImages[currentImg]}
          alt="Kayani Slide"
          className="hero-image fade-slide"
          key={currentImg} // key ensures React re-renders with animation
        />
        <h1 className="title">Kayani Herbs</h1>
        <p className="slogan">🌿 Cure from Nature 🌿</p>
        <button className="enter-btn" onClick={enterProgram} disabled={loading}>
          {loading ? 'Loading Your Custom Formula...' : 'Enter Kayani Men Program'}
        </button>
      </section>

      {/* Section 2: Info Swiper */}
      <section className="info-section">
        <div className="info-swiper">
          <button onClick={() => setCurrentCard((prev) => (prev === 0 ? infoCards.length - 1 : prev - 1))}>
            ◀
          </button>
          <p>{infoCards[currentCard]}</p>
          <button onClick={() => setCurrentCard((prev) => (prev + 1) % infoCards.length)}>
            ▶
          </button>
        </div>
      </section>

      {/* Section 3: About or CTA */}
      <section className="about-section">
        <h2>Why Choose Kayani?</h2>
        <p>💚 We blend tradition with nature. All our remedies are backed by decades of indigenous knowledge.</p>
        <p>✨ Trusted by thousands across Africa. Safe, natural, and tested by time.</p>
      </section>
    </div>
  );
};

export default Homepage;
