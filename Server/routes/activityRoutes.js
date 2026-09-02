const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getIssueActivities,
    getTaskActivities,
} = require("../controllers/activityController");

const router = express.Router();

router.get(
  "/issue/:issueId",
  authMiddleware,
  getIssueActivities
);

router.get(
  "/task/:taskId",
  authMiddleware,
  getTaskActivities
);


module.exports = router;