const express = require("express");
const {
  authorizeIssueMember,
  authorizeIssueCreation,
  authorizeIssueAssignment,
  authorizeIssueEdit,
} = require("../middleware/authorizationMiddleware");
const  checkProjectAccess = require("../middleware/projectauthorization");

const {
  createIssue,
  getIssues,
  getIssueById,
  getIssuesByProject,
  updateIssue,
  deleteIssue,
  getIssuesByTask,
} = require("../controllers/issueController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createIssueValidator,
  updateIssueValidator,
} = require("../validators/issuevalidator");

const validate = require("../middleware/validationMiddleware");

const {checkIssueAccess,   checkTaskIssueAccess,} = require("../middleware/issueauthorization");

const router = express.Router();


// Create issue
router.post(
  "/", authMiddleware, createIssueValidator,
  validate, authorizeIssueCreation, createIssue);


// Get all issues
router.get("/", authMiddleware, getIssues);

router.get(
  "/task/:taskId/:id",
  authMiddleware,
  checkTaskIssueAccess,
  getIssueById
);

router.put(
  "/task/:taskId/:id",
  authMiddleware,
  checkTaskIssueAccess,
  authorizeIssueEdit,
  authorizeIssueAssignment,
  updateIssueValidator,
  validate,
  updateIssue
);

router.delete(
  "/task/:taskId/:id",
  authMiddleware,
  checkTaskIssueAccess,
  deleteIssue
);

//Get issues by project 
router.get("/project/:projectId", authMiddleware, checkProjectAccess, getIssuesByProject);

router.get(
  "/task/:taskId",
  authMiddleware,
  getIssuesByTask
);


// Get single issue
router.get("/:id", authMiddleware,  checkIssueAccess, getIssueById);


// Update issue
router.put("/:id", authMiddleware,  checkIssueAccess,   authorizeIssueEdit, authorizeIssueAssignment,
  updateIssueValidator,
  validate, updateIssue);


// Delete issue
router.delete("/:id", authMiddleware,  checkIssueAccess, deleteIssue);


module.exports = router;