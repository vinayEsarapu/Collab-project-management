const { createActivity } = require("../services/activityService");
const mongoose = require("mongoose");
const Comment = require("../models/comment");
const Issue = require("../models/issues");
const User = require("../models/user");


// Get comments for an issue
// Supports:
// ?page=1
// ?limit=10
// ?name=vinay
//
// Filtering happens BEFORE pagination.
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

    // -----------------------------
    // Pagination
    // -----------------------------

    const requestedPage =
      parseInt(req.query.page, 10) || 1;

    const requestedLimit =
      parseInt(req.query.limit, 10) || 10;

    // Prevent invalid/very large limits
    const limit = Math.min(
      Math.max(requestedLimit, 1),
      50
    );

    const page = Math.max(
      requestedPage,
      1
    );

    // -----------------------------
    // Name filter
    // -----------------------------

    const name =
      (req.query.name || "").trim();

    const filter = {
      issue: issueId,
    };

    /*
     * Comments store createdBy as a User reference.
     *
     * Therefore:
     * 1. Find users whose names match the search.
     * 2. Get their IDs.
     * 3. Filter comments using those IDs.
     */
    if (name) {
      const matchingUsers =
        await User.find({
          name: {
            $regex: name,
            $options: "i",
          },
        }).select("_id");

      const userIds =
        matchingUsers.map(
          (user) => user._id
        );

      // No users matched the name
      if (userIds.length === 0) {
        return res.status(200).json({
          count: 0,
          comments: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalComments: 0,
            limit,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }

      filter.createdBy = {
        $in: userIds,
      };
    }

    // -----------------------------
    // Count filtered comments
    // -----------------------------

    const totalComments =
      await Comment.countDocuments(
        filter
      );

    const totalPages =
      totalComments === 0
        ? 0
        : Math.ceil(
            totalComments / limit
          );

    /*
     * If requested page doesn't exist,
     * use the last available page.
     */
    const currentPage =
      totalPages === 0
        ? 1
        : Math.min(
            page,
            totalPages
          );

    const skip =
      (currentPage - 1) * limit;

    // -----------------------------
    // Get paginated comments
    // -----------------------------

    const comments =
      await Comment.find(filter)
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    // -----------------------------
    // Response
    // -----------------------------

    res.status(200).json({
      count: comments.length,
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
      "Get comments error:",
      error
    );

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

    await createActivity({
  issue: issueId,
  project: issue.project,
  user: req.user.userId,
  action: "COMMENT_ADDED",
  details: {
    commentId: comment._id.toString(),
  },
});

    const populatedComment =
      await Comment.findById(comment._id)
        .populate(
          "createdBy",
          "name email"
        );

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


// Update own comment
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const comment = req.comment;

    comment.content = content.trim();

    await comment.save();

    await createActivity({
  issue: comment.issue,
  project: req.comment.project,
  user: req.user.userId,
  action: "COMMENT_UPDATED",
  details: {
    commentId: comment._id.toString(),
  },
});

    const populatedComment =
      await Comment.findById(comment._id)
        .populate(
          "createdBy",
          "name email"
        );

    res.status(200).json({
      message: "Comment updated successfully",
      comment: populatedComment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update comment",
      error: error.message,
    });
  }
};


// Delete own comment
const deleteComment = async (req, res) => {
  try {
    const comment = req.comment;

    await Comment.findByIdAndDelete(
      comment._id
    );

    res.status(200).json({
      message: "Comment deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};


module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};