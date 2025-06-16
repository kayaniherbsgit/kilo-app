import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/theme.css';
import { registerSW } from 'virtual:pwa-register';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext'; // ✅ add this
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AudioProvider>
          <App />
          <ToastContainer position="top-center" autoClose={2500} theme="dark" />
        </AudioProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

registerSW();

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);