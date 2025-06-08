import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Lesson from './pages/Lesson';
import Notifications from './pages/Notifications';
import Community from './pages/Community';
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserProfile from './pages/UserProfile';
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminNotificationDetail from "./pages/admin/AdminNotificationDetail";
import ProfileSettings from "./pages/ProfileSettings";
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLessons from './pages/admin/AdminLessons';
import AdminUploadLesson from "./pages/admin/AdminUploadLesson";
import AdminLogs from './pages/admin/AdminLogs';
import AdminSendNotification from './pages/admin/AdminSendNotification';


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
        <Route path="/profile-settings" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ProfileSettings /></motion.div>} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/community" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Community /></motion.div>} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/lessons" element={<AdminLessons />} />
        <Route path="/admin/notifications/:id" element={<AdminNotificationDetail />} />
        <Route path="/admin/upload" element={<AdminUploadLesson />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        <Route path="/admin/send-notification" element={<AdminSendNotification />} />
        <Route path="/lesson/:id" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Lesson /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;