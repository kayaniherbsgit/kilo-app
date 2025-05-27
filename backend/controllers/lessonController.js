const Lesson = require('../models/Lesson');

exports.uploadLesson = async (req, res) => {
  try {
    const { title, description } = req.body;
    const audio = req.file ? req.file.filename : null;

    const newLesson = new Lesson({ title, description, audio });
    await newLesson.save();

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
