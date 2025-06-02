const express = require('express');
const router = express.Router();
const {
  getGlobalUserSetting,
  updateGlobalUserSetting
} = require('../controllers/globalUserSettingController');

const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getGlobalUserSetting);
router.put('/', auth, isAdmin, updateGlobalUserSetting);

module.exports = router;