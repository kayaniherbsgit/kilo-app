const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const {
  getActivityLogs,
  getNotifications,
  getStats
} = require('../controllers/adminController');

router.get('/activity-logs', auth, isAdmin, getActivityLogs);
router.get('/notifications', auth, isAdmin, getNotifications);
router.get('/stats', auth, isAdmin, getStats);

const Lesson = require('../models/Lesson'); // Make sure this is at the top

// Reorder lessons via drag-and-drop
router.post('/reorder-lessons', auth, isAdmin, async (req, res) => {
  const { lessons } = req.body;

  try {
    for (const { id, order } of lessons) {
      await Lesson.findByIdAndUpdate(id, { order });
    }
    res.json({ success: true, message: 'Lesson order updated' });
  } catch (err) {
    console.error('Lesson reorder error:', err);
    res.status(500).json({ error: 'Failed to reorder lessons' });
  }
});


module.exports = router;