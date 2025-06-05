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

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) return res.status(400).json({ message: 'Username or email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const isAdmin = username === 'kayaniadmin';

    const user = await User.create({
      fullName,
      username,
      email,
      phoneNumber,
      whatsappNumber,
      region,
      password: hashed,
      avatar: avatarUrl,
      isAdmin,
      isApproved: isAdmin // ✅ Only admin auto-approved
    });

    const msg = isAdmin
      ? 'Admin registered successfully.'
      : 'Registration successful. Wait for admin approval.';
    res.status(201).json({ message: msg });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🚀 Received login request for username:', username);

    // Case-insensitive exact match for username
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('+password'); // Explicitly include password field

    if (!user) {
      console.log('❌ No user found for username:', username);
      return res.status(400).json({ message: 'Invalid credentials' }); // Generic message for security
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Wrong password for username:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Enforce approval check for non-admin users
    if (!user.isApproved && !user.isAdmin) {
      console.log('⏳ Login attempt before approval:', username);
      return res.status(403).json({ 
        message: 'Your account is pending approval by admin.' 
      });
    }

    const token = generateToken(user);
    console.log('✅ Login success for username:', username);
    
    // Return minimal user data without sensitive info
    const userData = {
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      avatar: user.avatar
    };
    
    res.status(200).json({ user: userData, token });
  } catch (err) {
    console.log('💥 Error during login:', err.message);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};