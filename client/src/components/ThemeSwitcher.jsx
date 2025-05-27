import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setIsDark(currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setIsDark(!isDark);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
  };

  return (
    <>
      <motion.button
        onClick={toggleTheme}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          background: 'var(--button-bg)',
          color: '#fff',
          border: 'none',
          borderRadius: '20px',
          padding: '0.6rem 1.2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1001
        }}
      >
        {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </motion.button>

      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'radial-gradient(circle at center, #34a853 0%, transparent 70%)',
              zIndex: 999,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeSwitcher;
