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

module.exports = router;