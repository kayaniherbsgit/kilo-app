import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Homepage.css';
import logo from '../assets/kayani-logo.jpg';

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
      text: 'To bring back the power of nature to every home across Africa, with remedies tested by generations and crafted with care.',
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
    nav: ['Dhamira', 'Programu', 'Ushuhuda', 'Jiunge'],
    hero: {
      title: 'Uponyaji wa Asili.',
      subtitle: '🌿 Tunarejesha Afya ya Kiafrika kwa Tiba za Asili',
      button: 'Angalia Programu',
    },
    mission: {
      title: 'Dhamira Yetu',
      text: 'Kurudisha nguvu ya tiba za asili katika kila nyumba barani Afrika, kwa kutumia maarifa ya vizazi.',
    },
    programs: {
      title: 'Programu Zetu Maarufu',
      items: [
        ['Kayani Men Power', 'Ongeza nguvu, ujasiri, na uwezo wa kudumu kwa njia ya asili.'],
        ['Tumbolux', 'Tiba kamili ya tumbo na mfumo wa mmeng’enyo.'],
        ['Bawasiri Cleanse', 'Ondoa bawasiri na maradhi ya njia ya haja kwa tiba asilia.'],
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
  // Load language from localStorage or browser
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('kayani_lang');
    if (stored) return stored;
    const browser = navigator.language.startsWith('sw') ? 'sw' : 'en';
    localStorage.setItem('kayani_lang', browser);
    return browser;
  });

  const t = content[lang];
  const [showLangToggle, setShowLangToggle] = useState(true);

  // Scroll toggle for language button
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowLangToggle(false);
      } else {
        setShowLangToggle(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle language and store
  const toggleLang = () => {
    const next = lang === 'sw' ? 'en' : 'sw';
    setLang(next);
    localStorage.setItem('kayani_lang', next);
  };

  return (
    <div className="homepage">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Kayani Herbs" />
          <span>Kayani Herbs</span>
        </div>
        <nav className="nav-links">
          <a href="#mission">{t.nav[0]}</a>
          <a href="#programs">{t.nav[1]}</a>
          <a href="#testimonials">{t.nav[2]}</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>{t.hero.title}</h1>
          <p>{t.hero.subtitle}</p>
          <a href="#programs" className="hero-btn">{t.hero.button}</a>
        </motion.div>
      </section>

      {/* Mission */}
      <motion.section className="section mission" id="mission" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.mission.title}</h2>
        <p>{t.mission.text}</p>
      </motion.section>

      {/* Programs */}
      <motion.section className="section programs" id="programs" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.programs.title}</h2>
        <div className="program-cards">
          {t.programs.items.map(([title, desc], i) => (
            <div className="card" key={i}>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section className="section testimonials" id="testimonials" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.testimonials.title}</h2>
        {t.testimonials.quotes.map((quote, i) => (
          <blockquote key={i}>{quote}</blockquote>
        ))}
      </motion.section>

      {/* Join */}
      <motion.section className="section join" id="join" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.join.title}</h2>
        <p>{t.join.text}</p>
        <a href="#programs" className="hero-btn">{t.join.button}</a>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Kayani Herbs. {t.footer}</p>
      </footer>

      {/* Floating Language Toggle */}
      {showLangToggle && (
        <motion.div
          className="floating-lang"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button className="lang-float" onClick={toggleLang}>
{lang === 'sw' ? '🇬🇧 English' : '🇹🇿 Kiswahili'}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Homepage;