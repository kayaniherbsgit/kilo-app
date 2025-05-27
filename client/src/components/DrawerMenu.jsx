import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DrawerMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      {/* Toggle Drawer Button */}
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        background: 'var(--button-bg)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        zIndex: 1001
      }}>
        ☰
      </button>

      {/* Drawer Content */}
      {open && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '250px',
            background: 'var(--card-bg)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
            padding: '2rem 1rem',
            zIndex: 1000
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>⚙️ Settings</h3>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            style={{
              marginTop: '1rem',
              background: 'var(--button-bg)',
              color: '#fff',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              border: 'none',
              width: '100%'
            }}
          >
            🌓 Toggle Theme
          </motion.button>

          <button
            onClick={() => setOpen(false)}
            style={{
              marginTop: '2rem',
              padding: '0.5rem',
              background: '#ccc',
              border: 'none',
              borderRadius: '8px',
              width: '100%'
            }}
          >
            Close Menu
          </button>
        </motion.div>
      )}
    </>
  );
};

export default DrawerMenu;
