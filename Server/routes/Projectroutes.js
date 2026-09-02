const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getUsersForMemberSelection,
  addTask,
  updateTask,
  deleteTask,
  getProjectActivity,
  getProjectTasks,
getTaskById,
} = require("../controllers/Projectcontroller");

const {
  getProjectComments,
  createProjectComment,
  updateProjectComment,
  deleteProjectComment,
} = require("../controllers/projectCommentController");

const {
  authorizeProjectCommentMember,
  authorizeProjectCommentAuthor,
} = require("../middleware/projectCommentAuthorization");

const authMiddleware = require("../middleware/authMiddleware");
const validateProject = require("../validators/projectValidator");

const router = express.Router();

// Protect all project routes
router.use(authMiddleware);

// CREATE
router.post("/", validateProject, createProject);

// GET REGISTERED USERS FOR MEMBER SELECTION
// Must be before /:id
router.get("/users", getUsersForMemberSelection);

// READ ALL
router.get("/", getProjects);

router.get("/:id/activity", getProjectActivity);

// TASKS - OWNER ONLY
// Get all tasks for a project
router.get("/:id/tasks", getProjectTasks);

// Get one task
router.get("/:id/tasks/:taskId", getTaskById);
router.post("/:id/tasks", addTask);

router.put("/:id/tasks/:taskId", updateTask);

router.delete("/:id/tasks/:taskId", deleteTask);

// -----------------------------------------
// PROJECT COMMENTS
// -----------------------------------------

// GET PROJECT COMMENTS
router.get(
  "/:id/comments",
  authorizeProjectCommentMember,
  getProjectComments
);

// ADD PROJECT COMMENT
router.post(
  "/:id/comments",
  authorizeProjectCommentMember,
  createProjectComment
);

// UPDATE OWN PROJECT COMMENT
router.put(
  "/:id/comments/:commentId",
  authorizeProjectCommentAuthor,
  updateProjectComment
);

// DELETE OWN PROJECT COMMENT
router.delete(
  "/:id/comments/:commentId",
  authorizeProjectCommentAuthor,
  deleteProjectComment
);

// READ ONE
router.get("/:id", getProjectById);

// UPDATE
router.put("/:id", validateProject, updateProject);

// DELETE
router.delete("/:id", deleteProject);

// MEMBER MANAGEMENT
router.post("/:id/members", addMember);

router.delete("/:id/members/:userId", removeMember);

module.exports = router;