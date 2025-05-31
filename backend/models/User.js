const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },

  avatar: { type: String, default: '' },
  streak: { type: Number, default: 0 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  lastPlayedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },

  // ✅ New: Track user activity like a timeline/log
  activityLog: [
    {
      action: { type: String },           // e.g. 'Completed Lesson', 'Commented', 'Changed Avatar'
      message: { type: String },          // e.g. 'Finished Lesson 3', 'Updated Profile'
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);