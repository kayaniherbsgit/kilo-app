const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Notification = require('../models/Notification-Log'); // ✅ make sure path is correct


// ✅ Admin only: Get all users
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// ✅ Admin only: Delete a user
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

router.post('/progress', auth, async (req, res) => {
  const { lessonId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      await user.save();

      // ✅ create notification
      await Notification.create({
        title: `🎉 ${user.username} completed a lesson`,
        message: `They finished lesson ID: ${lessonId}`,
        createdBy: user.username,
      });
    }

    res.json({ message: 'Progress updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

module.exports = router;
