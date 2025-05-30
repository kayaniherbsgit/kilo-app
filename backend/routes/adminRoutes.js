const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Notification = require('../models/Notification-Log');
const Lesson = require('../models/Lesson');


const {
  getActivityLogs,
  getNotifications,
  getStats,
  deleteAllNotifications,
} = require('../controllers/adminController');

// Logs & Stats
router.get('/activity-logs', auth, isAdmin, getActivityLogs);
router.get('/notifications', auth, isAdmin, getNotifications);
router.get('/stats', auth, isAdmin, getStats);

// 🔁 Realtime reorder
router.post('/reorder-lessons', auth, isAdmin, async (req, res) => {
  const { lessons } = req.body;
  try {
    for (const { id, order } of lessons) {
      await Lesson.findByIdAndUpdate(id, { order });
    }
    res.json({ success: true, message: 'Lesson order updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder lessons' });
  }
});

// ✔️ Mark all as read
router.put('/notifications/mark-all-read', auth, isAdmin, async (req, res) => {
  try {
    await Notification.updateMany(
      { readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    req.io.emit('notificationsUpdated');
    res.json({ message: 'Marked all as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read', error: err.message });
  }
});

// 🧹 Delete all
router.delete('/notifications/delete-all', auth, isAdmin, deleteAllNotifications);

// 🟢 Mark single as read
router.put('/notifications/:id/mark-read', auth, isAdmin, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id }
    });
    req.io.emit('notificationsUpdated');
    res.json({ message: 'Marked one as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update', error: err.message });
  }
});

module.exports = router;