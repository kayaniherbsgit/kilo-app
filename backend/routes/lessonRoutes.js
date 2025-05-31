const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { reorderLessons } = require('../controllers/lessonController');
const auth = require('../middleware/auth');
const Lesson = require('../models/Lesson');
const isAdmin = require('../middleware/isAdmin');
const {
  getAllLessons,
  uploadLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Accept both audio and thumbnail files
const uploadFields = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Routes
router.get('/', getAllLessons);
router.post('/', auth, isAdmin, uploadFields, uploadLesson);
router.put('/:id', auth, isAdmin, uploadFields, updateLesson);
router.delete('/:id', auth, isAdmin, deleteLesson);
router.patch('/reorder', auth, isAdmin, reorderLessons); // ✅ new route

// GET total number of lessons
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
    const lesson = await Lesson.findById(req.params.id);
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: 'Lesson not found' });
  }
});




module.exports = router;
