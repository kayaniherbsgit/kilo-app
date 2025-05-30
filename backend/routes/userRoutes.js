const express = require('express');
const router = express.Router(); // ✅ correct Express router

const isAdmin = require('../middleware/isAdmin');
const { requireAuth } = require('../middleware/auth');

const {
  getAllUsers,
  deleteUser,
  updateProgress,
  saveLessonProgress,
  setCurrentLesson,
  getCurrentLesson,
} = require('../controllers/userController');

// Secure routes
router.get('/all', requireAuth, isAdmin, getAllUsers);
router.delete('/:id', requireAuth, isAdmin, deleteUser);
router.post('/progress', requireAuth, updateProgress);
router.patch('/progress', requireAuth, saveLessonProgress);
router.post('/current-lesson', requireAuth, setCurrentLesson);
router.get('/current-lesson', requireAuth, getCurrentLesson);

module.exports = router;