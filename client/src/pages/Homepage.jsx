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
        short: `To bring back the power of nature to every home across Africa.We don’t just treat diseases — we revive body, mind, and soul.`,
        more: `We’ve built a fortress of hope for all suffering physically or emotionally. We believe healing isn’t just in injections — it's in herbs, food, conversations, and belief. Kayani is more than medicine; it’s a lifestyle.

        Welcome to the world of natural healing, where every challenge has a solution — in your language, through natural ingredients, and from the heart.`,
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
      title: 'Tiba Kwa Mimea Asili.',
      subtitle: '🌿 Jitibu Changamoto Zako Za Kiafya Kiasili Ukiwa Na Kayani Herbs',
      button: 'Angalia Tiba Zetu',
    },
  mission: {
  title: '🌿 Dhamira Yetu',
  short: `Tunarudisha nguvu ya tiba ya asili, moja kwa moja kutoka kwa mizizi ya mababu hadi kizazi cha leo. Hatutibu tu magonjwa – tunafufua mwili, akili, na roho.`,
  more: `Tumejenga ngome ya matumaini kwa wote wanaoteseka kimwili au kihisia. Tunaamini tiba haiko kwenye sindano tu – ipo kwenye mimea, chakula, mazungumzo, na imani. Kayani ni zaidi ya dawa; ni mtindo wa maisha.

Karibu katika ulimwengu wa tiba mbadala, ambapo kila tatizo lina suluhisho lake – kwa lugha ya asili, kwa viungo vya asili, na kwa moyo wa kweli.`,
},

    programs: {
      title: 'Tiba [Programu] Zetu Maarufu',
      items: [
        ['Kayani Men Power', 'Ongeza Nguvu Za Kiume, Ujasiri, Na Uwezo Wa Kudumu Hadi Dak 30 Kwenye Shoo Kwa Njia Asili.'],
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
  const [showMore, setShowMore] = useState(false);


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
<motion.section
  className="section mission"
  id="mission"
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <h2>{t.mission.title}</h2>

  <div className="mission-card">
    <p className="dhamira-text">
      {t.mission.short}
    </p>
  </div>

  {!showMore && (
    <button className="learn-more-btn" onClick={() => setShowMore(true)}>
      📖 {lang === 'sw' ? 'Soma Zaidi' : 'Learn More'}
    </button>
  )}

  {showMore && (
    <>
      <motion.div
        className="mission-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="dhamira-text">{t.mission.more}</p>
      </motion.div>

      <button className="learn-more-btn" onClick={() => setShowMore(false)}>
        🔽 {lang === 'sw' ? 'Funga Maelezo' : 'Collapse'}
      </button>
    </>
  )}
</motion.section>


     {/* Programs */}
      <motion.section className="section programs" id="programs" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{t.programs.title}</h2>
        <div className="program-cards">
{t.programs.items.map(([title, desc], i) => (
  <div
    className="card"
    key={i}
    onClick={() => {
      if (title === 'Kayani Men Power') {
        window.location.href = '/program-intro';
      }
    }}
    style={{ cursor: title === 'Kayani Men Power' ? 'pointer' : 'default' }}
  >
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