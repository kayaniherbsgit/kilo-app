const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const User = require('../models/User');
const multer = require('multer');


const {
  getAllUsers,
  deleteUser,
  updateProgress
} = require('../controllers/userController');

const { updateLastPlayedLesson } = require('../controllers/userController');

// Existing admin routes
router.get('/all', auth, isAdmin, getAllUsers);
router.delete('/:id', auth, isAdmin, deleteUser);
router.patch('/progress', auth, updateProgress);
router.post('/last-played', auth, updateLastPlayedLesson);

// ✅ Save current lesson
router.post('/current-lesson', auth, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required' });

  try {
    const user = await User.findById(req.user.id);
    user.lastPlayedLesson = lessonId;
    await user.save();
    res.status(200).json({ message: 'Current lesson saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving current lesson' });
  }
});

// ✅ Mark lesson as completed
router.post('/mark-complete', auth, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required' });

  try {
    const user = await User.findById(req.user.id);
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      await user.save();
    }
    res.status(200).json({ message: 'Lesson marked as complete' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking lesson complete' });
  }
});

router.get('/state/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json({
      completedLessons: user.completedLessons,
      audioProgress: user.audioProgress || {},
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get user streak with reset check
router.get('/streak/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const lastLogin = new Date(user.updatedAt); // assuming streak updated on lesson complete
    const now = new Date();

    const diffInDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

    if (diffInDays > 1) {
      user.streak = 0;
      await user.save();
    }

    res.json({ streak: user.streak || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching streak' });
  }
});


// ✅ Avatar storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ Update user profile (username + avatar)
router.patch('/:id', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.username) user.username = req.body.username;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    await user.save();
    res.status(200).json(user); // return updated user
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

router.get('/activity/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const timeline = user.activityLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching timeline' });
  }
});

router.put('/:id/approve', auth, isAdmin, async (req, res) => {
  console.log('🚦 [userRoutes] PUT /:id/approve hit for user ID:', req.params.id);
  
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent approving admins
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot approve admin accounts' });
    }

    // Only update if not already approved
    if (!user.isApproved) {
      user.isApproved = true;
      await user.save();
      
      console.log('✅ Approved user:', user.username);
      return res.status(200).json(user);
    }

    res.status(200).json({ message: 'User was already approved', user });
  } catch (err) {
    console.error('❌ Approval error:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
});

router.post('/complete-lesson', auth, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Avoid duplicate entry
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);

      // Optional activity log
      user.activityLog.push({
        action: 'Completed Lesson',
        message: `🎓 Finished lesson ID: ${lessonId}`,
      });

      await user.save();
    }

    res.status(200).json({ message: 'Lesson marked complete', completedLessons: user.completedLessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/can-access/:day', auth, async (req, res) => {
  try {
    const { day } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentDay = parseInt(day);
    const previousDay = currentDay - 1;

    if (previousDay <= 0) return res.json({ canAccess: true });

    const isPreviousCompleted = user.lessonProgress?.get(String(previousDay));
    return res.json({ canAccess: !!isPreviousCompleted });
  } catch (err) {
    console.error('can-access error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;