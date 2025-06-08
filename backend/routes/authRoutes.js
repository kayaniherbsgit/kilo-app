const express = require('express');
const router = express.Router();
const multer = require('multer');
const { register, login } = require('../controllers/authController');

// ✅ Cloudinary storage for avatar uploads
const { avatarStorage } = require('../utils/cloudinary');
const upload = multer({ storage: avatarStorage });

// ✅ Registration route (with avatar)
router.post('/register', upload.single('avatar'), register);

// ✅ Login route
router.post('/login', login);

module.exports = router;