const express = require('express');
const router = express.Router();
const {
  getAllLessons,
  uploadLesson,
  updateLesson,
  deleteLesson,
  reorderLessons
} = require('../controllers/lessonController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Routes
router.get('/', getAllLessons);
router.post('/', auth, isAdmin, uploadLesson);
router.put('/:id', auth, isAdmin, updateLesson);
router.delete('/:id', auth, isAdmin, deleteLesson);
router.patch('/reorder', auth, isAdmin, reorderLessons);

// Total count
router.get('/count', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson');
    const count = await Lesson.countDocuments();
    res.json({ total: count });
  } catch (err) {
    console.error('Error in /lessons/count:', err);
    res.status(500).json({ message: 'Error fetching lesson count' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lesson = await require('../models/Lesson').findById(req.params.id);
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: 'Lesson not found' });
  }
});

module.exports = router;