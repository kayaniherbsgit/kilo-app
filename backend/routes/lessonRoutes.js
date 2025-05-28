const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Lesson = require('../models/Lesson');
const Notification = require('../models/Notification-Log');

// Multer setup (moved up to avoid hoisting issues)
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

// GET /api/lessons – Fetch all lessons
router.get('/', async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ day: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// POST /api/lessons – Admin uploads a new lesson (single handler)
router.post('/', auth, isAdmin, upload.single('audio'), async (req, res) => {
  try {
    const { title, description, day, duration, level } = req.body;
    const newLesson = new Lesson({
      title,
      description,
      day,
      duration,
      level,
      audio: req.file ? `/uploads/${req.file.filename}` : '',
    });
    await newLesson.save();

    // Create notification
    await Notification.create({
      title: `📚 New lesson uploaded`,
      message: `${title} is now available (Day ${day})`,
      createdBy: req.user.username || 'admin',
    });

    res.status(201).json(newLesson);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// PUT /api/lessons/:id – Update a lesson
router.put('/:id', auth, isAdmin, upload.single('audio'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.file) updates.audio = `/uploads/${req.file.filename}`;
    
    const updatedLesson = await Lesson.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedLesson);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/lessons/:id – Delete a lesson
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

module.exports = router;