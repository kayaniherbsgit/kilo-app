import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '1.2rem',
        right: '1.2rem',
        background: 'transparent',
        border: '2px solid var(--accent)',
        padding: '0.6rem',
        borderRadius: '50%',
        cursor: 'pointer',
        color: 'var(--accent)',
        transition: 'transform 0.3s ease',
        zIndex: 999,
      }}
      title="Toggle Theme"
      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(20deg)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
    >
      {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
    </button>
  );
};

export default ThemeSwitcher;
