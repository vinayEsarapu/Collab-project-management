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
} = require("../controllers/Projectcontroller");

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
router.post("/:id/tasks", addTask);

router.put("/:id/tasks/:taskId", updateTask);

router.delete("/:id/tasks/:taskId", deleteTask);

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