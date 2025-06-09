const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  username: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
