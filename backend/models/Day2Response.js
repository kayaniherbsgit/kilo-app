// models/Day2Response.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: String,
    required: true
  },
  answers: [
    {
      question: String,
      answer: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Day2Response', responseSchema);
