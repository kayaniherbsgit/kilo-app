const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/admin/secret', auth, isAdmin, (req, res) => {
  res.json({ message: 'This is a protected admin-only route.' });
});


// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// GET all posts
router.get('/', async (req, res) => {
  const posts = await CommunityPost.find().sort({ timestamp: -1 });
  res.json(posts);
});

// POST new post
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
    mediaType
  });

  await post.save();
  req.io?.emit('newPost', post);
  res.status(201).json(post);
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

module.exports = router;
