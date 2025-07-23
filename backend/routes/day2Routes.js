const express = require('express');
const router = express.Router();
const { submitDay2Answers } = require('../controllers/day2Controller'); // ✅ FIXED NAME
const auth = require('../middleware/auth');

router.post('/responses/day2', auth, submitDay2Answers); // ✅ FIXED NAME

router.get('/test', (req, res) => {
  res.json({ message: 'Day2 route is active!' });
});

module.exports = router;
