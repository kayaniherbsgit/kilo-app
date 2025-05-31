const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  content: String,
  media: String,
  mediaType: String, // "image", "video", "audio"
  timestamp: { type: Date, default: Date.now },
  reactions: {
    like: { type: Number, default: 0 },
    fire: { type: Number, default: 0 },
    heart: { type: Number, default: 0 }
  },
  comments: [
    {
      username: String,
      avatar: String,
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);