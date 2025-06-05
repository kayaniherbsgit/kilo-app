const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: String,
  whatsappNumber: String,
  region: String,
  isAdmin: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  streak: { type: Number, default: 0 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  lastPlayedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  activityLog: [
    {
      action: String,
      message: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);