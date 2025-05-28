const Lesson = require('../models/Lesson');
const Notification = require('../models/Notification');


exports.uploadLesson = async (req, res) => {
  try {
    const { title, description } = req.body;
    const audio = req.file ? req.file.filename : null;

    const newLesson = new Lesson({ title, description, audio });
    await newLesson.save();

        // Save notification
    const note = new Notification({
      title: 'New Lesson Uploaded',
      message: `${title} was added.`,
    });
    await note.save();


    // Emit real-time event
    if (io) {
      io.emit('lessonUploaded', { title });
    }

    res.status(201).json({ message: 'Lesson uploaded successfully', lesson: newLesson });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload lesson', error: err.message });
  }
};

exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lessons', error: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const id = req.params.id;
    await Lesson.findByIdAndDelete(id);
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete lesson', error: err.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { title, description } = req.body;
    const update = { title, description };
    if (req.file) update.audio = req.file.filename;

    const updated = await Lesson.findByIdAndUpdate(req.params.id, update, { new: true });
    res.status(200).json({ message: 'Lesson updated', lesson: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update lesson', error: err.message });
  }
};

