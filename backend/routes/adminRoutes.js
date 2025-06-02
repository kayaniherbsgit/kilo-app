const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { sendNotification } = require('../controllers/adminController'); // 👈 add this if not imported
const Notification = require('../models/Notification-Log'); // 👈 Add if not already imported
const User = require('../models/User');
const {
  getActivityLogs,
  getNotifications,
  getStats,
  sendNotification 
} = require('../controllers/adminController');

router.get('/activity-logs', auth, isAdmin, getActivityLogs);
router.get('/notifications', auth, isAdmin, getNotifications);
router.get('/stats', auth, isAdmin, getStats);
router.post('/notifications', auth, isAdmin, sendNotification); // ✅ add this route
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

// ✅ Mark all admin notifications as read
router.put('/notifications/mark-all-read', auth, isAdmin, async (req, res) => {
  try {
    // Update all notifications not yet marked as read by this admin
    await Notification.updateMany(
      { readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    req.io?.emit('notificationsUpdated'); // (Optional real-time sync)
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to mark all as read',
      error: err.message,
    });
  }
});

router.put('/notifications/:id/mark-read', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    if (!notif.readBy.map(id => id.toString()).includes(userId.toString())) {
      notif.readBy.push(userId);
      await notif.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read', error: err.message });
  }
});

router.get('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Could Not Fetch Notification' });
  }
});

router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const users = await User.find();
    const averageStreak =
      users.reduce((sum, u) => sum + (u.streak || 0), 0) / (users.length || 1);

    res.json({ totalUsers, totalLessons, averageStreak: Math.round(averageStreak) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

module.exports = router;