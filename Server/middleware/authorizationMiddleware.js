const Project = require("../models/Project");
const Issue = require("../models/issues");

const authorizeProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userid.toString();

    const isOwner = project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to access this project",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeProjectOwner = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userid.toString();

    if (project.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Only the project owner can perform this action",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeIssueMember = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

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

    const userId = req.user.userid.toString();

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
    next(error);
  }
};

const authorizeIssueCreation = async (req, res, next) => {
  try {
    const project = await Project.findById(req.body.project);

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
        message:
          "You are not authorized to create issues in this project",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorizeProjectMember,
  authorizeProjectOwner,
  authorizeIssueMember,
  authorizeIssueCreation,
};