const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['audio', 'text', 'questions', 'pdf'] },
  label: { type: String }, // Optional label like "Start Here", "Read First"
  src: { type: String },   // File path for audio/pdf
  content: { type: String }, // For text content
  questions: [String],     // For questions step
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  day: { type: Number, required: true },
  duration: { type: String },
  level: { type: String },
  thumbnail: { type: String },
  order: { type: Number, default: 0 },
  steps: [stepSchema], // ✅ New flexible step-based structure
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
