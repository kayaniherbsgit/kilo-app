const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const multer = require('multer');
const path = require('path');

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('audio'), lessonController.uploadLesson);
router.get('/', lessonController.getAllLessons);

module.exports = router;
