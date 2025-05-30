// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const user = await User.create({
      username,
      password: hashed,
      avatar: avatarUrl,
      isAdmin: username === 'kayaniadmin'
    });

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    const token = generateToken(user);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.saveAudioProgress = async (req, res) => {
  const { username, lessonId, progress } = req.body;
  try {
    const user = await User.findOne({ username });
    user.audioProgress.set(lessonId, progress);
    await user.save();
    res.json({ message: 'Progress saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving progress' });
  }
};

exports.saveCurrentIndex = async (req, res) => {
  const { username, index } = req.body;
  try {
    await User.findOneAndUpdate({ username }, { currentLessonIndex: index });
    res.json({ message: 'Index saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving index' });
  }
};

exports.getUserState = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json({
      index: user.currentLessonIndex || 0,
      audioProgress: user.audioProgress || {},
      completedLessons: user.completedLessons || [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get state' });
  }
};