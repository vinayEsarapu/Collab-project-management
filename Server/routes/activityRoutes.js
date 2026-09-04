const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getIssueActivities,
    getTaskActivities,
     deleteActivity,
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

router.delete(
  "/:activityId",
  authMiddleware,
  deleteActivity
);


module.exports = router;