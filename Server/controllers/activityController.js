const Activity = require("../models/activity");
const Issue = require("../models/issues");
const Project = require("../models/Project");

// Get activity history for an issue
const getIssueActivities = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const project = await Project.findById(issue.project);

    if (!project) {
      return res.status(404).json({
        message: "Associated project not found",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message:
          "You are not authorized to view this activity",
      });
    }

    const activities = await Activity.find({
      issue: issueId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: activities.length,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch issue activity",
      error: error.message,
    });
  }
};

module.exports = {
  getIssueActivities,
};