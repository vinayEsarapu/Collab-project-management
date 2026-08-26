const express = require("express");

const {
  getComments,
  createComment,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get comments for an issue
router.get(
  "/issue/:issueId",
  authMiddleware,
  getComments
);

// Add comment to an issue
router.post(
  "/issue/:issueId",
  authMiddleware,
  createComment
);

module.exports = router;