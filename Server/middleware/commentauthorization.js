const mongoose = require("mongoose");

const Comment = require("../models/comment");
const Issue = require("../models/issues");
const Project = require("../models/Project");

const authorizeCommentMember = async (req, res, next) => {
  try {
    const { issueId, taskId } = req.params;

    let issue = null;
    let task = null;
    let project = null;

    /*
     * --------------------------------------------------
     * ISSUE COMMENT
     * /comments/issue/:issueId
     * --------------------------------------------------
     */
    if (issueId) {
      if (!mongoose.Types.ObjectId.isValid(issueId)) {
        return res.status(400).json({
          message: "Invalid issue ID",
        });
      }

      issue = await Issue.findById(issueId);

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found",
        });
      }

      project = await Project.findById(issue.project);

      if (!project) {
        return res.status(404).json({
          message: "Associated project not found",
        });
      }

      /*
       * ------------------------------------------------
       * TASK ISSUE COMMENT
       * /comments/task/:taskId/issue/:issueId
       * ------------------------------------------------
       */
      if (taskId) {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
          return res.status(400).json({
            message: "Invalid task ID",
          });
        }

        task = project.tasks.id(taskId);

        if (!task) {
          return res.status(404).json({
            message: "Task not found in this project",
          });
        }

        if (
          !issue.task ||
          issue.task.toString() !== taskId.toString()
        ) {
          return res.status(403).json({
            message:
              "This issue does not belong to the requested task",
          });
        }
      }
    }

    /*
     * --------------------------------------------------
     * TASK-LEVEL COMMENT
     * /comments/task/:taskId
     * --------------------------------------------------
     */
    else if (taskId) {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({
          message: "Invalid task ID",
        });
      }

      // Tasks are embedded inside Project.
      project = await Project.findOne({
        "tasks._id": taskId,
      });

      if (!project) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      task = project.tasks.id(taskId);

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }
    } else {
      return res.status(400).json({
        message: "Issue ID or Task ID is required",
      });
    }

    /*
     * --------------------------------------------------
     * PROJECT MEMBERSHIP
     * --------------------------------------------------
     */

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
    req.task = task;
    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
};


const authorizeCommentAuthor = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    let issue = null;
    let task = null;
    let project = null;

    /*
     * -----------------------------------------------
     * COMMENT BELONGS TO ISSUE
     * -----------------------------------------------
     */
    if (comment.issue) {
      issue = await Issue.findById(comment.issue);

      if (!issue) {
        return res.status(404).json({
          message: "Associated issue not found",
        });
      }

      project = await Project.findById(issue.project);

      if (!project) {
        return res.status(404).json({
          message: "Associated project not found",
        });
      }

      /*
       * If this issue comment also belongs to a task,
       * resolve that task.
       */
      if (comment.task) {
        task = project.tasks.id(comment.task);

        if (!task) {
          return res.status(404).json({
            message: "Associated task not found",
          });
        }
      }
    }

    /*
     * -----------------------------------------------
     * COMMENT BELONGS DIRECTLY TO TASK
     * -----------------------------------------------
     */
    else if (comment.task) {
      project = await Project.findOne({
        "tasks._id": comment.task,
      });

      if (!project) {
        return res.status(404).json({
          message: "Associated task not found",
        });
      }

      task = project.tasks.id(comment.task);

      if (!task) {
        return res.status(404).json({
          message: "Associated task not found",
        });
      }
    } else {
      return res.status(400).json({
        message: "Comment has no valid parent",
      });
    }

    /*
     * -----------------------------------------------
     * PROJECT AUTHORIZATION
     * -----------------------------------------------
     */

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

    /*
     * Only comment author can edit/delete.
     */
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
    req.task = task;
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