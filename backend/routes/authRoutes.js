const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register); // 🔥 No multer, no upload
router.post('/login', login);

module.exports = router;
