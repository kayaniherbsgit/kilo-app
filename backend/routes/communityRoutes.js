const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

// Get all posts
router.get('/', async (req, res) => {
  const posts = await CommunityPost.find().sort({ timestamp: -1 });
  res.json(posts);
});

// Create new post
router.post('/', upload.single('media'), async (req, res) => {
  const { username, content } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  let media = '';
  let mediaType = '';
  if (req.file) {
    media = req.file.filename;
    const ext = path.extname(media).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) mediaType = 'image';
    else if (['.mp4', '.mov', '.webm'].includes(ext)) mediaType = 'video';
    else if (['.mp3', '.wav', '.m4a'].includes(ext)) mediaType = 'audio';
  }

  const post = new CommunityPost({
    username,
    avatar: user.avatar,
    content,
    media,
    mediaType,
  });

  await post.save();
  req.io?.emit('newPost', post);
  res.status(201).json(post);
});

// Delete post (User or Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.username === req.user.username;
    const isAdminUser = req.user.isAdmin;

    if (!isOwner && !isAdminUser)
      return res.status(403).json({ message: 'Not authorized to delete this post' });

    await post.remove();
    req.io?.emit('deletePost', req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed', error: err.message });
  }
});

// Patch/edit post
router.patch('/:id', auth, async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.username !== req.user.username && !req.user.isAdmin)
    return res.status(403).json({ message: 'Not authorized' });

  post.content = req.body.content || post.content;
  await post.save();
  req.io?.emit('updatePost', post);
  res.json(post);
});

// React to post
router.post('/:id/reaction', async (req, res) => {
  const { emoji } = req.body;
  const post = await CommunityPost.findById(req.params.id);
  if (post && post.reactions[emoji] !== undefined) {
    post.reactions[emoji]++;
    await post.save();
    req.io?.emit('updatePost', post);
    res.json(post);
  } else {
    res.status(400).json({ message: 'Invalid reaction' });
  }
});

// Comment
router.post('/:id/comment', async (req, res) => {
  const { username, text } = req.body;
  const user = await User.findOne({ username });
  const avatar = user?.avatar || '';

  const post = await CommunityPost.findById(req.params.id);
  post.comments.push({ username, avatar, text });
  await post.save();
  req.io?.emit('updatePost', post);
  res.json(post);
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find().sort({ streak: -1 }).limit(10);
    const leaderboard = topUsers.map(user => ({
      username: user.username,
      streak: user.streak || 0,
      avatar: user.avatar || '',
    }));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Leaderboard fetch failed' });
  }
});

module.exports = router;