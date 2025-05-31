const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ action, performedBy, targetType, targetId, details }) => {
  try {
    const log = new ActivityLog({
      action,
      performedBy,
      targetType,
      targetId,
      details
    });
    await log.save();
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;
