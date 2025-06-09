// src/components/admin/BackToDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../../styles/admin/BackToDashboard.css';

const BackToDashboard = () => {
  return (
    <motion.div 
      className="back-to-dashboard"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/admin" className="back-link">
        <FaArrowLeft />
        Back to Dashboard
      </Link>
    </motion.div>
  );
};

export default BackToDashboard;
