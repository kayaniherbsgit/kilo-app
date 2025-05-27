const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const avatar = req.file ? req.file.filename : '';

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      avatar,
      completedLessons: [],
      streak: 0,
      lastCompletedDate: null
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({
      token,
      user: {
        username: user.username,
        avatar: user.avatar,
        completedLessons: user.completedLessons || [],
        streak: user.streak || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { username, lessonId } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyCompleted = user.completedLessons.includes(lessonId);
    const today = new Date().toDateString();
    const last = user.lastCompletedDate?.toDateString();

    if (!alreadyCompleted) {
      user.completedLessons.push(lessonId);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (last === today) {
        // Already completed today — do nothing.
      } else if (last === yesterday.toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1; // Auto-reset streak
      }

      user.lastCompletedDate = new Date();
      await user.save();
    }

    res.status(200).json({ message: 'Progress updated', completedLessons: user.completedLessons });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress', error: err.message });
  }
};

// Optional: expose route to fetch streak
exports.getStreak = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ streak: 0 });
    res.status(200).json({ streak: user.streak || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch streak' });
  }
};
