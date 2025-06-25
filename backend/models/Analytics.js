const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: String, required: true },
  data: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
