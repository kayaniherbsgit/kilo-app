const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { reorderLessons } = require('../controllers/lessonController');
const auth = require('../middleware/auth');
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


module.exports = router;
