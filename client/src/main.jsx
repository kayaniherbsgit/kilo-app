import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './styles/theme.css';
import { registerSW } from 'virtual:pwa-register';
import { AudioProvider } from './contexts/AudioContext';
import { ToastContainer } from 'react-toastify'; // ✅ added
import 'react-toastify/dist/ReactToastify.css'; // ✅ added

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AudioProvider>
        <App />
        <ToastContainer position="top-center" autoClose={2500} theme="dark" />
      </AudioProvider>
    </BrowserRouter>
  </React.StrictMode>
);

registerSW();

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
