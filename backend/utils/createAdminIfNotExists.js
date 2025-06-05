// utils/createAdminIfNotExists.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdminIfNotExists = async () => {
  const exists = await User.findOne({ username: 'kayaniadmin' });

  if (exists) {
    console.log('✅ Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('#Kayani2025', 10);

  await User.create({
    fullName: 'Dr. Kayani',
    username: 'kayaniadmin',
    email: 'kayaniherbs@gmail.com',
    phoneNumber: '0655889126',
    whatsappNumber: '0655889126',
    region: 'Dar es Salaam',
    password: hashedPassword,
    avatar: '/uploads/admin.png',
    isAdmin: true,
    isApproved: true
  });

console.log('🎉 Default admin created: kayaniadmin / #Kayani2025');
};

module.exports = createAdminIfNotExists;