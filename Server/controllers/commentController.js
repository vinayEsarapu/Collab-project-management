const mongoose = require("mongoose");
const Comment = require("../models/comment");
const Issue = require("../models/issues");

// Get comments for an issue
const getComments = async (req, res) => {
  try {
    const { issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const comments = await Comment.find({ issue: issueId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

// Create a comment
const createComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({
        message: "Invalid issue ID",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      issue: issueId,
      createdBy: req.user.userId,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("createdBy", "name email");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

module.exports = {
  getComments,
  createComment,
};