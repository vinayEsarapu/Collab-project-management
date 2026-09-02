const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectComment = require("../models/ProjectComment");

// -----------------------------------------
// PROJECT MEMBER / OWNER AUTHORIZATION
// -----------------------------------------

const authorizeProjectCommentMember = async (
  req,
  res,
  next
) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.userId },
        { members: req.user.userId },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message:
          "Project not found or you are not authorized to access it",
      });
    }

    req.project = project;

    next();
  } catch (error) {
    console.error(
      "Project comment authorization error:",
      error
    );

    next(error);
  }
};

// -----------------------------------------
// COMMENT AUTHOR AUTHORIZATION
// -----------------------------------------

const authorizeProjectCommentAuthor = async (
  req,
  res,
  next
) => {
  try {
    const { id, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    // First verify user belongs to project
    const project = await Project.findOne({
      _id: id,
      $or: [
        { owner: req.user.userId },
        { members: req.user.userId },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message:
          "Project not found or you are not authorized to access it",
      });
    }

    // Make sure comment belongs to this project
    const comment = await ProjectComment.findOne({
      _id: commentId,
      project: id,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Only author can modify
    if (
      comment.createdBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the comment author can modify this comment",
      });
    }

    req.project = project;
    req.comment = comment;

    next();
  } catch (error) {
    console.error(
      "Project comment author authorization error:",
      error
    );

    next(error);
  }
};

module.exports = {
  authorizeProjectCommentMember,
  authorizeProjectCommentAuthor,
};
