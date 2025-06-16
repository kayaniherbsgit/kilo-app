const Lesson = require('../models/Lesson');
const Notification = require('../models/Notification-Log');
const logActivity = require('../utils/logActivity');

const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ day: 1 });

    lessons.forEach((lesson) => {
      if (!lesson.audio && Array.isArray(lesson.steps)) {
        const firstAudioStep = lesson.steps.find(step => step.type === 'audio');
        if (firstAudioStep) {
          lesson.audio = firstAudioStep.src;
        }
      }
    });

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lessons', error: err.message });
  }
};

const uploadLesson = async (req, res) => {
  try {
    console.log('📦 Incoming lesson payload:', req.body); // 🧠 LOG HERE

    const { title, description, day, duration, level, thumbnail, steps } = req.body;

    const newLesson = new Lesson({
      title,
      description,
      day,
      duration,
      level,
      thumbnail,
      steps,
    });

    await newLesson.save();

    await Notification.create({
      title: `📚 New lesson uploaded`,
      message: `${title} is now available (Day ${day})`,
      createdBy: req.user.username || 'admin',
    });

    await logActivity({
      action: 'Upload Lesson',
      performedBy: req.user.username || 'admin',
      targetType: 'Lesson',
      targetId: newLesson._id,
      details: `Uploaded "${title}" (Day ${day})`,
    });

    res.status(201).json(newLesson);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await Lesson.findByIdAndUpdate(id, updates, { new: true });

    await logActivity({
      action: 'Edit Lesson',
      performedBy: req.user.username || 'admin',
      targetType: 'Lesson',
      targetId: updated._id,
      details: `Edited "${updated.title}"`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const deleted = await Lesson.findByIdAndDelete(req.params.id);

    if (deleted) {
      await logActivity({
        action: 'Delete Lesson',
        performedBy: req.user.username || 'admin',
        targetType: 'Lesson',
        targetId: deleted._id,
        details: `Deleted "${deleted.title}"`,
      });
    }

    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

const reorderLessons = async (req, res) => {
  try {
    const { order } = req.body;
    for (let i = 0; i < order.length; i++) {
      await Lesson.findByIdAndUpdate(order[i], { order: i });
    }

    await logActivity({
      action: 'Reorder Lessons',
      performedBy: req.user.username || 'admin',
      targetType: 'Lesson',
      details: `Reordered ${order.length} lessons`,
    });

    res.json({ message: 'Lessons reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Reordering failed', details: err.message });
  }
};

module.exports = {
  getAllLessons,
  uploadLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
