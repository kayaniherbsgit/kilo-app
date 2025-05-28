const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification-Log');
const User = require('../models/User');
const Lesson = require('../models/Lesson');

// ✅ Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
};

// ✅ Get notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

// ✅ Get admin stats
const getStats = async (req, res) => {
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
};

module.exports = {
  getActivityLogs,
  getNotifications,
  getStats
};