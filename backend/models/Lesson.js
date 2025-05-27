const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  audio: String,
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);