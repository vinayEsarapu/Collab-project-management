const Issue = require("../models/issues");
const Project = require("../models/Project");

const checkIssueAccess = async (req, res, next) => {
  try {
    const issueId = req.params.id;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const project = await Project.findById(issue.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner = project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to access this issue",
      });
    }

    req.issue = issue;
    req.project = project;

    next();
  } catch (error) {
    res.status(500).json({
      message: "Authorization check failed",
      error: error.message,
    });
  }
};

module.exports = checkIssueAccess;