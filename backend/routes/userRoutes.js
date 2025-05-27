const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');

// ✅ GET streak for a specific user
router.get('/streak/:username', authController.getStreak);

router.get('/leaderboard', async (req, res) => {
  try {
    const top = await User.find({}, 'username streak')
      .sort({ streak: -1 })
      .limit(10);

    res.status(200).json(top);
  } catch (err) {
    res.status(500).json({ message: 'Leaderboard error', error: err.message });
  }
});


// ✅ GET completed lessons (if needed)
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ completedLessons: user.completedLessons || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user data', error: err.message });
  }
});

module.exports = router;
