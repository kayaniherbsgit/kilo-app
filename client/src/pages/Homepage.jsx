import React, { useState, useEffect } from 'react';
import './Homepage.css';
import logo from '../assets/kayacirclelogo.png';
import { motion, AnimatePresence } from 'framer-motion';

const content = {
  en: {
    nav: ['Mission', 'Programs', 'Testimonials', 'Join'],
    hero: {
      title: 'Healing. Naturally.',
      subtitle: '🌿 Restoring Africa with Pure Herbal Wisdom',
      button: 'Explore Programs',
    },
    mission: {
      title: 'Our Mission',
      short: `To bring back the power of nature to every home across Africa. We don’t just treat diseases — we revive body, mind, and soul.`,
      more: `We’ve built a fortress of hope for all suffering physically or emotionally. Healing isn’t just in pills — it's in herbs, food, conversations, and belief. Kayani is more than medicine; it’s a lifestyle.`,
    },
    programs: {
      title: 'Our Signature Programs',
      items: [
        ['Kayani Men Power', 'Boost endurance, confidence & strength naturally.'],
        ['Tumbolux', 'Ultimate gut and stomach restoration therapy.'],
        ['Bawasiri Cleanse', 'Target hemorrhoids and rectal health naturally.'],
      ],
    },
    testimonials: {
      title: 'What People Say',
      quotes: [
        '"After 7 days, my energy returned like magic. Thank you Kayani Herbs!"',
        '"No more ulcers. Tumbolux is a miracle from nature."',
      ],
    },
    join: {
      title: 'Join the Healing Movement',
      text: 'We’ve helped thousands. Now it’s your turn.',
      button: 'Start Your Journey',
    },
    footer: 'All rights reserved.',
  },
  sw: {
    nav: ['Dhamira', 'Tiba', 'Ushuhuda', 'Jiunge'],
    hero: {
      title: 'Jitibu Changamoto Zako Za Kiafya Kwa Njia Asilia',
      subtitle: '🌿 Usiendelee kuteseka wakati tiba iko karibu nawe.\nKutoka kwenye mimea, viungo, mizizi hadi mazoea ya mababu — tiba asilia haipambwi, lakini ina nguvu ya kweli.',
      button: 'Angalia Tiba Zetu',
    },
    mission: {
      title: '🌿 Dhamira Yetu',
      short: `Tunarudisha nguvu ya tiba ya asili kutoka kwa mizizi ya mababu hadi kizazi cha leo. Hatutibu tu magonjwa – tunafufua mwili, akili, na roho.`,
      more: `Tumejenga ngome ya matumaini kwa wote wanaoteseka kimwili au kihisia. Tunaamini tiba haiko kwenye sindano tu – ipo kwenye mimea, chakula, mazungumzo, na imani. Kayani ni zaidi ya dawa; ni mtindo wa maisha.`,
    },
    programs: {
      title: 'Tiba Zetu Maarufu',
      items: [
        ['Kayani Men Power', 'Ongeza Nguvu Za Kiume Na Uwezo Wa Kudumu Kwenye Shoo Kwa Njia Asili.'],
        ['Tumbolux', 'Tiba Kamili Ya Tumbo Na Mfumo Wa Mmeng’enyo.'],
        ['Bawasiri Cure', 'Ondoa Bawasiri Na Maradhi Ya Njia Ya Haja Kwa Tiba Asilia.'],
      ],
    },
    testimonials: {
      title: 'Wanasema Nini',
      quotes: [
        '"Baada ya siku 7, nguvu zilirejea kama muujiza. Asante Kayani!"',
        '"Tumbolux imeniondolea vidonda vya tumbo kabisa. Asili ni tiba."',
      ],
    },
    join: {
      title: 'Jiunge na Harakati za Uponyaji',
      text: 'Tayari tumeponya maelfu. Sasa ni zamu yako.',
      button: 'Anza Safari Yako',
    },
    footer: 'Haki zote zimehifadhiwa.',
  },
};

const Homepage = () => {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('kayani_lang');
    if (stored) return stored;
    const browser = navigator.language.startsWith('sw') ? 'sw' : 'en';
    localStorage.setItem('kayani_lang', browser);
    return browser;
  });

  const t = content[lang];
  const [showLangToggle, setShowLangToggle] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      setShowLangToggle(window.scrollY < lastScrollY);
      setShrink(window.scrollY > 50);
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.1 }
    );

    sections.forEach(section => observer.observe(section));
    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
  }, [menuOpen]);

  const toggleLang = () => {
    const next = lang === 'sw' ? 'en' : 'sw';
    setLang(next);
    localStorage.setItem('kayani_lang', next);
  };

  return (
    <div className="homepage">
      {/* Navbar */}
      <header className={`navbar ${shrink ? 'shrink' : ''}`}>
        <div className="logo">
          <img src={logo} alt="Kayani Herbs" />
          <span>KAYANI</span>
        </div>

        <nav className="nav-links">
          {t.nav.map((item, i) => (
            <a key={i} href={`#${item.toLowerCase()}`} className={activeSection === item.toLowerCase() ? 'active' : ''}>
              {item}
            </a>
          ))}
        </nav>

        <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
          <span />
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-menu-links">
                {t.nav.map((item, i) => (
                  <a key={i} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                    {item}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <motion.div className="hero-content" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1>{t.hero.title}</h1>
          <div className="subtitle">
            {t.hero.subtitle.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <a href="#programs" className="hero-btn">{t.hero.button}</a>
        </motion.div>
      </section>

      {/* Mission Section */}
      <motion.section className="section mission" id="mission" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.mission.title}</h2>
        <div className="mission-card">
          <p className="dhamira-text">{t.mission.short}</p>
        </div>
        {!showMore ? (
          <button className="learn-more-btn" onClick={() => setShowMore(true)}>
            📖 {lang === 'sw' ? 'Soma Zaidi' : 'Learn More'}
          </button>
        ) : (
          <>
            <motion.div className="mission-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="dhamira-text">{t.mission.more}</p>
            </motion.div>
            <button className="learn-more-btn" onClick={() => setShowMore(false)}>
              🔽 {lang === 'sw' ? 'Funga Maelezo' : 'Collapse'}
            </button>
          </>
        )}
      </motion.section>

      {/* Programs Section */}
      <motion.section className="section programs" id="programs" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.programs.title}</h2>
        <div className="program-cards">
          {t.programs.items.map(([title, desc], i) => (
            <motion.div
              key={i}
              className="card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => title.includes('Men') && (window.location.href = '/program-intro')}
              style={{ cursor: title.includes('Men') ? 'pointer' : 'default' }}
            >
              <h3>{title}</h3>
              <p>{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section className="section testimonials" id="testimonials" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.testimonials.title}</h2>
        <div className="testimonials-list">
          {t.testimonials.quotes.map((quote, i) => (
            <motion.blockquote key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.2 }}>
              {quote}
            </motion.blockquote>
          ))}
        </div>
      </motion.section>

      {/* Join CTA */}
      <motion.section className="section join" id="join" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.join.title}</h2>
        <p>{t.join.text}</p>
        <a href="#programs" className="cta-btn">{t.join.button}</a>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Kayani Herbs. {t.footer}</p>
      </footer>

      {/* Floating Language Toggle */}
      {showLangToggle && (
        <motion.div className="floating-lang" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <button className="lang-float" onClick={toggleLang}>
            {lang === 'sw' ? '🇬🇧 English' : '🇹🇿 Kiswahili'}
          </button>
        </motion.div>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/255655889126?text=Habari%20Kayani%20Herbs%2C%20nataka%20kujiunga%20na%20programu%20ya%20uponyaji."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Chat with Dr. Kayani"
      >
        💬
      </a>
    </div>
  );
};

export default Homepage;
