// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  avatar: String,
  streak: { type: Number, default: 0 },

  // ✅ Updated field
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  lastPlayedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);