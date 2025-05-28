const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  getAllUsers,
  deleteUser,
  updateProgress
} = require('../controllers/userController');

router.get('/all', auth, isAdmin, getAllUsers);
router.delete('/:id', auth, isAdmin, deleteUser);
router.post('/progress', auth, updateProgress);

module.exports = router;