import React from 'react';
import { motion } from 'framer-motion';
import './Homepage.css';
import logo from '../assets/kayani-logo.jpg';

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Kayani Herbs" />
          <span>Kayani Herbs</span>
        </div>
        <nav className="nav-links">
          <a href="#mission">Mission</a>
          <a href="#programs">Programs</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#join">Join</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>Healing. Naturally.</h1>
          <p>🌿 Restoring Africa with Pure Herbal Wisdom</p>
          <a href="#programs" className="hero-btn">Explore Programs</a>
        </motion.div>
      </section>

      {/* Mission Section */}
      <motion.section
        className="section mission"
        id="mission"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Our Mission</h2>
        <p>To bring back the power of nature to every home across Africa, with remedies tested by generations and crafted with care.</p>
      </motion.section>

      {/* Programs Section */}
      <motion.section
        className="section programs"
        id="programs"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Our Signature Programs</h2>
        <div className="program-cards">
          <div className="card">
            <h3>Kayani Men Power</h3>
            <p>Boost endurance, confidence & strength naturally.</p>
          </div>
          <div className="card">
            <h3>Tumbolux</h3>
            <p>Ultimate gut and stomach restoration therapy.</p>
          </div>
          <div className="card">
            <h3>Bawasiri Cleanse</h3>
            <p>Target hemorrhoids and rectal health naturally.</p>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="section testimonials"
        id="testimonials"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>What People Say</h2>
        <blockquote>"After 7 days, my energy returned like magic. Thank you Kayani Herbs!"</blockquote>
        <blockquote>"No more ulcers. Tumbolux is a miracle from nature."</blockquote>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="section join"
        id="join"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Join the Healing Movement</h2>
        <p>We’ve helped thousands. Now it’s your turn.</p>
        <a href="#programs" className="hero-btn">Start Your Journey</a>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Kayani Herbs. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
