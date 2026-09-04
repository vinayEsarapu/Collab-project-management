const mongoose = require("mongoose");
const Comment = require("../models/comment");
const Issue = require("../models/issues");
const User = require("../models/user");

const { createActivity } = require("../services/activityService");


/*
 * ==================================================
 * GET COMMENTS
 * ==================================================
 */

const getComments = async (req, res) => {
  try {
    const { issueId, taskId } = req.params;

    /*
     * Validate parent.
     */
    if (!issueId && !taskId) {
      return res.status(400).json({
        message: "Issue ID or Task ID is required",
      });
    }

    if (
      issueId &&
      !mongoose.Types.ObjectId.isValid(issueId)
    ) {
      return res.status(400).json({
        message: "Invalid issue ID",
      });
    }

    if (
      taskId &&
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    /*
     * Pagination.
     */
    const requestedPage =
      parseInt(req.query.page, 10) || 1;

    const requestedLimit =
      parseInt(req.query.limit, 10) || 10;

    const limit = Math.min(
      Math.max(requestedLimit, 1),
      50
    );

    const page = Math.max(requestedPage, 1);

    const name =
  (req.query.name || "").trim();

const commenterId =
  (req.query.commenterId || "").trim();
    /*
     * Build comment filter.
     */
    const filter = issueId
      ? { issue: issueId }
      : { task: taskId };

    /*
     * Name filter.
     */
    /*
 * Commenter filter.
 *
 * Dropdown filtering uses commenterId.
 * Name filtering is kept as a fallback for compatibility.
 */
if (commenterId) {
  if (
    !mongoose.Types.ObjectId.isValid(commenterId)
  ) {
    return res.status(400).json({
      message: "Invalid commenter ID",
    });
  }

  filter.createdBy = commenterId;
} else if (name) {
  const matchingUsers = await User.find({
    name: {
      $regex: name,
      $options: "i",
    },
  }).select("_id");

  const userIds = matchingUsers.map(
    (user) => user._id
  );

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
    /*
     * Total comments.
     */
    const totalComments =
      await Comment.countDocuments(filter);

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

    /*
     * Fetch comments.
     */
    const comments =
      await Comment.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json({
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
    console.error("Get comments error:", error);

    return res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};


/*
 * ==================================================
 * CREATE COMMENT
 * ==================================================
 */

const createComment = async (req, res) => {
  try {
    const { issueId, taskId } = req.params;
    const { content } = req.body;

    /*
     * Parent validation.
     */
    if (!issueId && !taskId) {
      return res.status(400).json({
        message: "Issue ID or Task ID is required",
      });
    }

    if (
      issueId &&
      !mongoose.Types.ObjectId.isValid(issueId)
    ) {
      return res.status(400).json({
        message: "Invalid issue ID",
      });
    }

    if (
      taskId &&
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    /*
     * Content validation.
     */
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    /*
     * ----------------------------------------------
     * ISSUE COMMENT
     * ----------------------------------------------
     */
    if (issueId) {
      const issue = await Issue.findById(issueId);

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found",
        });
      }

      const comment = await Comment.create({
        content: content.trim(),
        issue: issueId,
        task: taskId || null,
        createdBy: req.user.userId,
      });

      /*
       * Preserve existing issue activity behavior.
       */
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
          .populate("createdBy", "name email");

      return res.status(201).json({
        message: "Comment added successfully",
        comment: populatedComment,
      });
    }

    /*
     * ----------------------------------------------
     * TASK-LEVEL COMMENT
     * ----------------------------------------------
     */

    const comment = await Comment.create({
      content: content.trim(),
      task: taskId,
      createdBy: req.user.userId,
    });

    await createActivity({
  task: taskId,
  project: req.project._id,
  user: req.user.userId,
  action: "COMMENT_ADDED",
  details: {
    commentId: comment._id.toString(),
  },
});

    /*
     * Task comments don't use Issue activity because
     * there is no Issue associated with them.
     *
     * The comment itself is stored correctly against
     * the embedded task.
     */

    const populatedComment =
      await Comment.findById(comment._id)
        .populate("createdBy", "name email");

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      message: "Failed to create comment",
      error: error.message,
    });
  }
};


/*
 * ==================================================
 * UPDATE COMMENT
 * ==================================================
 */

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

    /*
     * Only create existing issue activity when
     * the comment actually belongs to an issue.
     */
    if (comment.issue) {
     await createActivity({
  issue: comment.issue || null,
  task: comment.task || null,
  project: req.project._id,
  user: req.user.userId,
  action: "COMMENT_UPDATED",
  details: {
    commentId: comment._id.toString(),
  },
});
    }

    const populatedComment =
      await Comment.findById(comment._id)
        .populate("createdBy", "name email");

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: populatedComment,
    });

  } catch (error) {
    console.error("Update comment error:", error);

    return res.status(500).json({
      message: "Failed to update comment",
      error: error.message,
    });
  }
};


/*
 * ==================================================
 * DELETE COMMENT
 * ==================================================
 */

const deleteComment = async (req, res) => {
  try {
    const comment = req.comment;

    await Comment.findByIdAndDelete(comment._id);

    await createActivity({
  issue: comment.issue || null,
  task: comment.task || null,
  project: req.project._id,
  user: req.user.userId,
  action: "COMMENT_DELETED",
  details: {
    commentId: comment._id.toString(),
  },
});

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
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