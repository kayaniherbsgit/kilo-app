const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/community'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({ storage });

// ✅ Get all posts
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const posts = await CommunityPost.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ✅ Create a post
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { username, avatar, content } = req.body;

    const newPost = new CommunityPost({
      username,
      avatar,
      content,
      media: req.file ? `/uploads/community/${req.file.filename}` : '',
      mediaType: req.file ? req.file.mimetype.split('/')[0] : null
    });

    const saved = await newPost.save();

    const io = req.app.get('io'); // ✅ Get io instance from server
    io.emit('newPost', saved);    // 📡 Emit to everyone

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to post' });
  }
});


// ✅ React to a post
router.post('/:id/reaction', async (req, res) => {
  const { emoji } = req.body;
  const post = await CommunityPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
  await post.save();

  req.io.emit('reactionUpdate', post); // 🔥 broadcast to everyone
  res.json(post);
});


// ✅ Comment on a post
router.post('/:id/comment', async (req, res) => {
  const { username, avatar, text } = req.body;
  const post = await CommunityPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = { username, avatar, text };
  post.comments.push(comment);
  await post.save();

  req.io.emit('newComment', { postId: post._id, comment }); // 🔥
  res.json(post);
});


// ✅ Delete a post (author only or admin)
router.delete('/:id', auth, async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (req.user.username !== post.username && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await post.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
