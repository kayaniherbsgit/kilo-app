const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth'); // Make sure path matches your setup

router.get('/ping', (req, res) => {
  res.send('Analytics route is alive 🔥');
});


router.post('/track', auth, async (req, res) => {
  try {
    const { event, data } = req.body;

    await Analytics.create({
      user: req.user._id,
      event,
      data
    });

    res.status(200).json({ message: 'Tracked' });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ message: 'Failed to track event' });
  }
});

module.exports = router;
