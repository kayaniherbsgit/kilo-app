const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const {
      fullName, username, email, phoneNumber,
      whatsappNumber, region, password
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdmin = username === 'kayaniadmin';

    const user = await User.create({
      fullName,
      username,
      email,
      phoneNumber,
      whatsappNumber,
      region,
      password: hashedPassword,
      avatar: '', // 🔥 No avatar
      isAdmin,
      isApproved: isAdmin
    });

    const msg = isAdmin
      ? 'Admin registered successfully.'
      : 'Registration successful. Wait for admin approval.';

    res.status(201).json({ message: msg });

  } catch (err) {
    console.error('💥 Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved && !user.isAdmin) {
      return res.status(403).json({
        message: 'Your account is pending approval by admin.'
      });
    }

    const token = generateToken(user);

    const userData = {
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      avatar: user.avatar
    };

    res.status(200).json({ user: userData, token });
  } catch (err) {
    console.error('💥 Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};