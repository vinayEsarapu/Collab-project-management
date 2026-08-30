const Activity = require("../models/activity");

const createActivity = async ({
  issue,
  project,
  user,
  action,
  details = {},
}) => {
  try {
    return await Activity.create({
      issue,
      project,
      user,
      action,
      details,
    });
  } catch (error) {
    console.error("Failed to create activity:", error);
  }
};

module.exports = {
  createActivity,
};