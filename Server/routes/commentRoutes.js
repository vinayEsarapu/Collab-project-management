const express = require("express");

const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  authorizeCommentMember,
  authorizeCommentAuthor,
} = require("../middleware/commentauthorization");

const router = express.Router();

// Get comments for a task-level issue
router.get(
  "/task/:taskId/issue/:issueId",
  authMiddleware,
  authorizeCommentMember,
  getComments
);

// Add comment to a task-level issue
router.post(
  "/task/:taskId/issue/:issueId",
  authMiddleware,
  authorizeCommentMember,
  createComment
);

// Get comments for an issue
router.get(
  "/issue/:issueId",
  authMiddleware,
  authorizeCommentMember,
  getComments
);

// Add comment to an issue
router.post(
  "/issue/:issueId",
  authMiddleware,
  authorizeCommentMember,
  createComment
);

// Update own comment
router.put(
  "/:commentId",
  authMiddleware,
  authorizeCommentAuthor,
  updateComment
);

// Delete own comment
router.delete(
  "/:commentId",
  authMiddleware,
  authorizeCommentAuthor,
  deleteComment
);

module.exports = router;