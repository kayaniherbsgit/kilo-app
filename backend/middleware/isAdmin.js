const User = require('../models/User');

module.exports = (req, res, next) => {
  const user = req.user;
  if (!user || user.username !== 'kayaniadmin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};
