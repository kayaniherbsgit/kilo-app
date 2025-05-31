const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  audio: { type: String },
  thumbnail: { type: String },
  description: { type: String },
  day: { type: Number, required: true },
  duration: { type: String },
  level: { type: String },
  order: { type: Number, default: 0 }, // ✅ add this
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);