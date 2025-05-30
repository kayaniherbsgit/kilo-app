const User = require('../models/User');
const NotificationLog = require('../models/Notification-Log');

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// User: Mark lesson complete
const updateProgress = async (req, res) => {
  const { lessonId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      await user.save();

      await NotificationLog.create({
        message: `🎉 ${user.username} completed lesson ID: ${lessonId}`,
        userId: user._id,
        type: 'success',
      });
    }
    res.status(200).json({ message: 'Progress updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress', details: err.message });
  }
};

// User: Save lesson progress
const saveLessonProgress = async (req, res) => {
  const { lessonId, progress } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.lessonProgress.set(lessonId, progress);
    await user.save();
    res.json({ message: 'Progress saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save progress', error: err.message });
  }
};

// User: Set current lesson
const setCurrentLesson = async (req, res) => {
  const { lessonId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.currentLesson = lessonId;
    await user.save();
    res.json({ message: 'Current lesson updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to set current lesson', error: err.message });
  }
};

// User: Get current lesson
const getCurrentLesson = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('currentLesson');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ currentLesson: user.currentLesson });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get current lesson', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateProgress,
  saveLessonProgress,
  setCurrentLesson,
  getCurrentLesson,
};