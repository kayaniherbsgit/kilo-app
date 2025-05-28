const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true }, // Admin username or ID
  targetType: { type: String }, // 'Lesson', 'User', etc.
  targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetType' },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
