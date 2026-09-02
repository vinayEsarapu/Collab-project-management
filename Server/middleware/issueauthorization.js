const Issue = require("../models/issues");
const Project = require("../models/Project");

const checkTaskIssueAccess = async (req, res, next) => {
  try {
    const { taskId, id } = req.params;

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    // A task-level endpoint must only work with a task-level issue.
    if (!issue.task) {
      return res.status(404).json({
        message: "This issue does not belong to a task",
      });
    }

    // Verify that the issue belongs to the task from the URL.
    if (issue.task.toString() !== taskId.toString()) {
      return res.status(403).json({
        message: "Issue does not belong to this task",
      });
    }

    const project = await Project.findById(issue.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
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
        message: "You do not have access to this task issue",
      });
    }

    req.issue = issue;
    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkTaskIssueAccess,
};


const authorizeIssueAssignment = async (req, res, next) => {
  try {
    const issueId = req.params.id;

    const issue = await Issue.findById(issueId).populate("project");

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const userId = req.user.userId.toString();

    const project = issue.project;

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner =
      project.owner.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the project owner can assign or reassign issues",
      });
    }

    req.issue = issue;
    req.project = project;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Issue assignment authorization failed",
      error: error.message,
    });
  }
};
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

module.exports = {checkIssueAccess, checkTaskIssueAccess, authorizeIssueAssignment};