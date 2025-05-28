// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification-Log');

// Get all activity logs (Admin only)
router.get('/activity-logs', auth, isAdmin, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
});

// Get all notifications (Admin only)
router.get('/notifications', auth, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const averageStreak = await User.aggregate([
      { $group: { _id: null, avg: { $avg: "$streak" } } }
    ]);

    res.json({
      totalUsers,
      totalLessons,
      averageStreak: averageStreak[0]?.avg.toFixed(1) || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


module.exports = router;
