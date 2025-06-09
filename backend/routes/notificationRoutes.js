const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification-Log');

const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/admin/secret', auth, isAdmin, (req, res) => {
  res.json({ message: 'This is a protected admin-only route.' });
});


// GET unread notification count for a user
router.get('/unread/:username', async (req, res) => {
  try {
    const unread = await Notification.find({ username: req.params.username, read: false });
    res.json({ unreadCount: unread.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark a specific notification as read
router.patch('/admin/notifications/:id/mark-read', auth, isAdmin, async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Marked as read', notification: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});


module.exports = router;