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
  user.xp += 10; // 🎯 Award XP

  // 🎖️ Add badge logic
  const completed = user.completedLessons.length;
  const total = 28; // update if dynamic later

  if (completed === 1 && !user.badges.includes('🏁 First Lesson')) {
    user.badges.push('🏁 First Lesson');
  }
  if (completed >= total / 2 && !user.badges.includes('🎯 Halfway There')) {
    user.badges.push('🎯 Halfway There');
  }
  if (completed === total && !user.badges.includes('🏆 All Done!')) {
    user.badges.push('🏆 All Done!');
  }

  const lesson = await Lesson.findById(lessonId);
  user.activityLog.push({
    action: 'Completed Lesson',
    message: `✅ Finished: ${lesson.title}`,
  });

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

const updateLastPlayedLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;

    const user = await User.findById(req.user.id);
    user.lastPlayedLesson = lessonId;

    await user.save();

    res.status(200).json({ message: 'Last played lesson updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update last played lesson', details: err.message });
  }
};


module.exports = {
  getAllUsers,
  deleteUser,
  updateProgress,
  updateLastPlayedLesson

};
