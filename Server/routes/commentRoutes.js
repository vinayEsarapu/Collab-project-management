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

/*
 * ==================================================
 * TASK-LEVEL COMMENTS
 * ==================================================
 */

// Get comments for a task
router.get(
  "/task/:taskId",
  authMiddleware,
  authorizeCommentMember,
  getComments
);

// Add comment to a task
router.post(
  "/task/:taskId",
  authMiddleware,
  authorizeCommentMember,
  createComment
);


/*
 * ==================================================
 * TASK ISSUE COMMENTS
 * ==================================================
 */

// Get comments for an issue inside a task
router.get(
  "/task/:taskId/issue/:issueId",
  authMiddleware,
  authorizeCommentMember,
  getComments
);

// Add comment to an issue inside a task
router.post(
  "/task/:taskId/issue/:issueId",
  authMiddleware,
  authorizeCommentMember,
  createComment
);


/*
 * ==================================================
 * NORMAL ISSUE COMMENTS
 * ==================================================
 */

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


/*
 * ==================================================
 * UPDATE / DELETE
 * ==================================================
 */

router.put(
  "/:commentId",
  authMiddleware,
  authorizeCommentAuthor,
  updateComment
);

router.delete(
  "/:commentId",
  authMiddleware,
  authorizeCommentAuthor,
  deleteComment
);

module.exports = router;