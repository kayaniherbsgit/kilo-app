import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUser, FiActivity } from 'react-icons/fi';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className="nav-btn">
        <FiHome />
      </NavLink>
      <NavLink to="/activity" className="nav-btn">
        <FiActivity />
      </NavLink>
      <NavLink to="/profile" className="nav-btn">
        <FiUser />
      </NavLink>
    </nav>
  );
};

export default BottomNav;
