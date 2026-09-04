const mongoose = require("mongoose");
const ProjectComment = require("../models/ProjectComment");
const ProjectActivity = require("../models/ProjectActivity");

// -----------------------------------------
// GET PROJECT COMMENTS
// -----------------------------------------

const getProjectComments = async (req, res) => {
  try {
    const projectId = req.params.id;

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    const commenterId =
  (req.query.commenterId || "").trim();

const filter = {
  project: projectId,
};

if (commenterId) {
  if (
    !mongoose.Types.ObjectId.isValid(commenterId)
  ) {
    return res.status(400).json({
      message: "Invalid commenter ID",
    });
  }

  filter.createdBy = commenterId;
}

    const totalComments =
  await ProjectComment.countDocuments(filter);

    const totalPages =
      totalComments === 0
        ? 0
        : Math.ceil(totalComments / limit);

    const currentPage =
      totalPages === 0
        ? 1
        : Math.min(page, totalPages);

    const skip =
      (currentPage - 1) * limit;

    const comments =
  await ProjectComment.find(filter)
        .populate(
          "createdBy",
          "name userCode email"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      comments,

      pagination: {
        currentPage,
        totalPages,
        totalComments,
        limit,
        hasNextPage:
          currentPage < totalPages,
        hasPreviousPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get project comments error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch project comments",
    });
  }
};

// -----------------------------------------
// CREATE PROJECT COMMENT
// -----------------------------------------

const createProjectComment = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const comment =
      await ProjectComment.create({
        project: projectId,
        content: content.trim(),
        createdBy: req.user.userId,
      });

    await ProjectActivity.create({
      project: projectId,
      user: req.user.userId,
      action: "COMMENT_ADDED",
      description:
        "A project comment was added.",
    });

    const populatedComment =
      await ProjectComment.findById(
        comment._id
      ).populate(
        "createdBy",
        "name userCode email"
      );

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error(
      "Create project comment error:",
      error
    );

    res.status(500).json({
      message: "Failed to create comment",
    });
  }
};

// -----------------------------------------
// UPDATE OWN PROJECT COMMENT
// -----------------------------------------

const updateProjectComment = async (
  req,
  res
) => {
  try {
    const { content } = req.body;
    const comment = req.comment;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    comment.content = content.trim();

    await comment.save();

    await ProjectActivity.create({
      project: req.project._id,
      user: req.user.userId,
      action: "COMMENT_UPDATED",
      description:
        "A project comment was updated.",
    });

    const populatedComment =
      await ProjectComment.findById(
        comment._id
      ).populate(
        "createdBy",
        "name userCode email"
      );

    res.status(200).json({
      message: "Comment updated successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error(
      "Update project comment error:",
      error
    );

    res.status(500).json({
      message: "Failed to update comment",
    });
  }
};

// -----------------------------------------
// DELETE OWN PROJECT COMMENT
// -----------------------------------------

const deleteProjectComment = async (
  req,
  res
) => {
  try {
    const comment = req.comment;

    await ProjectComment.findByIdAndDelete(
      comment._id
    );

    await ProjectActivity.create({
      project: req.project._id,
      user: req.user.userId,
      action: "COMMENT_DELETED",
      description:
        "A project comment was deleted.",
    });

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete project comment error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete comment",
    });
  }
};

module.exports = {
  getProjectComments,
  createProjectComment,
  updateProjectComment,
  deleteProjectComment,
};