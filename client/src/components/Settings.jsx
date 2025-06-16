import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { toast } from 'react-toastify';

const fontOptions = [
  'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Garamond', 'Courier New',
  'Brush Script MT', 'Lucida Console', 'Segoe UI', 'Comic Sans MS', 'Impact', 'Palatino', 'Bookman',
  'Century Gothic', 'Candara', 'Franklin Gothic Medium', 'Gill Sans', 'Optima', 'Calibri',
  'Cambria', 'Fira Sans', 'IBM Plex Sans', 'Josefin Sans', 'Lora', 'Merriweather', 'Montserrat',
  'Noto Sans', 'Open Sans', 'Oswald', 'Playfair Display', 'Poppins', 'PT Sans', 'Raleway',
  'Roboto', 'Rubik', 'Source Sans Pro', 'Ubuntu', 'Work Sans', 'Zilla Slab', 'Inconsolata',
  'Chivo', 'Crimson Text', 'DM Sans', 'Exo 2', 'Heebo', 'Karla', 'Mukta', 'Quicksand', 'Space Grotesk',
];

const Settings = () => {
  const navigate = useNavigate();

  const savedFont = localStorage.getItem('font') || 'Inter';
  const [selectedFont, setSelectedFont] = useState(savedFont);
  const [tempFont, setTempFont] = useState(savedFont);
  const [hasChanged, setHasChanged] = useState(false);

  const savedTheme = localStorage.getItem('theme') || 'light';
  const [theme, setTheme] = useState(savedTheme);

  useEffect(() => {
    document.body.style.fontFamily = selectedFont;
    document.documentElement.setAttribute('data-theme', theme);
  }, [selectedFont, theme]);

  const handleFontChange = (e) => {
    const font = e.target.value;
    setTempFont(font);
    setHasChanged(font !== selectedFont);
  };

  const handleSave = () => {
    setSelectedFont(tempFont);
    localStorage.setItem('font', tempFont);
    document.body.style.fontFamily = tempFont;
    setHasChanged(false);
    toast.success(`✅ Font updated to "${tempFont}"`);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    toast.info(`🌗 Switched to ${newTheme} mode`);
  };

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>🛠️ Settings</h2>

      {/* Font Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
          Choose your preferred font:
        </label>
        <select
          value={tempFont}
          onChange={handleFontChange}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: '10px',
            border: '1px solid #ccc',
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontFamily: tempFont,
          }}
        >
          {fontOptions.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Save & Return Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          onClick={handleSave}
          disabled={!hasChanged}
          style={{
            background: hasChanged ? '#34a853' : '#777',
            color: 'white',
            padding: '0.6rem 1.4rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: hasChanged ? 'pointer' : 'not-allowed',
          }}
        >
          💾 Save Font
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={{
            background: '#0a85ff',
            color: 'white',
            padding: '0.6rem 1.4rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
          }}
        >
          🔙 Return to Profile
        </button>
      </div>

      {/* Theme Toggle */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h3>🌗 Theme Mode</h3>
        <button
          onClick={toggleTheme}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            background: theme === 'dark' ? '#f0f0f0' : '#111',
            color: theme === 'dark' ? '#000' : '#fff',
            fontWeight: 600,
            border: 'none',
            marginTop: '1rem',
          }}
        >
          {theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
