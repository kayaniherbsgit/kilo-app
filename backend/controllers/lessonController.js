const Lesson = require('../models/Lesson');
const Notification = require('../models/Notification-Log');

const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ day: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lessons', error: err.message });
  }
};

const uploadLesson = async (req, res) => {
  try {
    const { title, description, day, duration, level } = req.body;
    const audio = req.files?.audio?.[0]?.filename || '';
    const thumbnail = req.files?.thumbnail?.[0]?.filename || '';

    const newLesson = new Lesson({
      title,
      description,
      day,
      duration,
      level,
      audio: audio ? `/uploads/${audio}` : '',
      thumbnail: thumbnail ? `/uploads/${thumbnail}` : '',
    });

    await newLesson.save();

    await Notification.create({
      title: `📚 New lesson uploaded`,
      message: `${title} is now available (Day ${day})`,
      createdBy: req.user.username || 'admin',
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

    if (req.files?.audio?.[0]) {
      updates.audio = `/uploads/${req.files.audio[0].filename}`;
    }
    if (req.files?.thumbnail?.[0]) {
      updates.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    }

    const updated = await Lesson.findByIdAndUpdate(id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

module.exports = {
  getAllLessons,
  uploadLesson,
  updateLesson,
  deleteLesson
};