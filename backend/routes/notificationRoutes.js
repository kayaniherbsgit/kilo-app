const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET unread notification count for a user
router.get('/unread/:username', async (req, res) => {
  try {
    const unread = await Notification.find({ username: req.params.username, read: false });
    res.json({ unreadCount: unread.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

module.exports = router;