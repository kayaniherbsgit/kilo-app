const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

// GET all posts
exports.getPosts = async (req, res) => {
  const posts = await CommunityPost.find().sort({ timestamp: -1 });
  res.json(posts);
};

// CREATE post
exports.createPost = async (req, res) => {
  const { username, content } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  let media = '';
  let mediaType = '';
  if (req.file) {
    media = req.file.filename;
    const ext = media.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) mediaType = 'image';
    else if (['mp4', 'mov', 'webm'].includes(ext)) mediaType = 'video';
    else if (['mp3', 'wav', 'm4a'].includes(ext)) mediaType = 'audio';
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
};

// REACT
exports.addReaction = async (req, res) => {
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
};

// COMMENT
exports.addComment = async (req, res) => {
  const { username, text } = req.body;
  const user = await User.findOne({ username });
  const avatar = user?.avatar || '';
  const post = await CommunityPost.findById(req.params.id);
  post.comments.push({ username, avatar, text });
  await post.save();
  req.io?.emit('updatePost', post);
  res.json(post);
};

// LEADERBOARD
exports.getLeaderboard = async (req, res) => {
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
};

// ✅ DELETE post
exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.username !== req.user.username && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    req.io?.emit('deletePost', req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};