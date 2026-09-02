const Comment = require("../models/comment");
const Issue = require("../models/issues");
const Project = require("../models/Project");

const authorizeCommentMember = async (req, res, next) => {
  try {
    const { issueId, taskId } = req.params;

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

    // -----------------------------------------
    // Task-level issue validation
    // -----------------------------------------

    if (taskId) {
      const task = project.tasks.id(taskId);

      if (!task) {
        return res.status(404).json({
          message: "Task not found in this project",
        });
      }

      // Make sure this issue actually belongs
      // to the requested task.
      if (
        !issue.task ||
        issue.task.toString() !== taskId.toString()
      ) {
        return res.status(403).json({
          message:
            "This issue does not belong to the requested task",
        });
      }

      req.task = task;
    }

    // -----------------------------------------
    // Existing project authorization
    // -----------------------------------------

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message:
          "You are not authorized to access comments in this project",
      });
    }

    req.issue = issue;
    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
};

const authorizeCommentAuthor = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const issue = await Issue.findById(comment.issue);

    if (!issue) {
      return res.status(404).json({
        message: "Associated issue not found",
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
          "You are not authorized to access this comment",
      });
    }

    const isAuthor =
      comment.createdBy.toString() === userId;

    if (!isAuthor) {
      return res.status(403).json({
        message:
          "Only the comment author can modify this comment",
      });
    }

    req.comment = comment;
    req.issue = issue;
    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorizeCommentMember,
  authorizeCommentAuthor,
};