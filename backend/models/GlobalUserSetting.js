const mongoose = require('mongoose');

const globalUserSettingSchema = new mongoose.Schema({
  showWelcomeToast: { type: Boolean, default: true },
  // Add more settings like enableStreaks, enableConfetti, etc.
}, { timestamps: true });

module.exports = mongoose.model('GlobalUserSetting', globalUserSettingSchema);