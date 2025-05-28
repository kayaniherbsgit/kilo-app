const mongoose = require('mongoose');

const editHistorySchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  editedBy: { type: String, required: true }, // Admin username or ID
  changes: {
    title: String,
    description: String,
    audio: String
  },
  editedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EditHistory', editHistorySchema);
