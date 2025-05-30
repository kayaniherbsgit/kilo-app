const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  avatar: {
    type: String, // Path to the avatar image (e.g., filename)
    default: '',  // Optional, in case some don't include avatars
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true // adds createdAt & updatedAt
});

module.exports = mongoose.model('Notification', notificationSchema);
