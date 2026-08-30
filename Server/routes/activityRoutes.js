const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getIssueActivities,
} = require("../controllers/activityController");

const router = express.Router();

router.get(
  "/issue/:issueId",
  authMiddleware,
  getIssueActivities
);

module.exports = router;