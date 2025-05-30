const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const User = require('../models/User');

const {
  getAllUsers,
  deleteUser,
  updateProgress
} = require('../controllers/userController');

// Existing admin routes
router.get('/all', auth, isAdmin, getAllUsers);
router.delete('/:id', auth, isAdmin, deleteUser);
router.patch('/progress', auth, updateProgress);

// ✅ Save current lesson
router.post('/current-lesson', auth, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required' });

  try {
    const user = await User.findById(req.user.id);
    user.lastPlayedLesson = lessonId;
    await user.save();
    res.status(200).json({ message: 'Current lesson saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving current lesson' });
  }
});

// ✅ Mark lesson as completed
router.post('/mark-complete', auth, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required' });

  try {
    const user = await User.findById(req.user.id);
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      await user.save();
    }
    res.status(200).json({ message: 'Lesson marked as complete' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking lesson complete' });
  }
});

module.exports = router;