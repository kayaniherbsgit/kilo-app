const User = require('../models/User');
const NotificationLog = require('../models/Notification-Log');

// ✅ Get all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// ✅ Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// ✅ Progress update (user)
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

module.exports = {
  getAllUsers,
  deleteUser,
  updateProgress
};
