import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminUpload from './pages/AdminDashboard';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';  // ✅ ADD THIS
import UserProfile from './pages/UserProfile';
import AdminNotifications from './pages/AdminNotifications';



const App = () => {
  const location = useLocation(); 

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Home /></motion.div>} />
        <Route path="/admin" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AdminDashboard /></motion.div>} />
        <Route path="/activity" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Activity /></motion.div>} />
        <Route path="/profile" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Profile /></motion.div>} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/community" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Community /></motion.div>} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />


      </Routes>
    </AnimatePresence>
  );
};

export default App;
