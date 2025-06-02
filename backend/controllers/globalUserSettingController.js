const GlobalUserSetting = require('../models/GlobalUserSetting');

exports.getGlobalUserSetting = async (req, res) => {
  const settings = await GlobalUserSetting.findOne();
  res.json(settings);
};

exports.updateGlobalUserSetting = async (req, res) => {
  const { showWelcomeToast } = req.body;
  let settings = await GlobalUserSetting.findOne();
  if (!settings) {
    settings = new GlobalUserSetting();
  }
  settings.showWelcomeToast = showWelcomeToast;
  await settings.save();
  res.json(settings);
};