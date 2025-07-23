// backend/controllers/day2Controller.js
const Day2Response = require('../models/Day2Response');

exports.submitDay2Answers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { lesson, answers } = req.body;

    if (!lesson || !answers) {
      return res.status(400).json({ message: 'Lesson and answers are required.' });
    }

    await Day2Response.create({
      user: userId,
      lesson,
      answers,
    });

    res.status(200).json({ message: 'Saved successfully!' });
  } catch (err) {
    console.error("Day2 answer error:", err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
