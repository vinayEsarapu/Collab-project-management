const express = require("express");


const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require("../controllers/Projectcontroller");

const authMiddleware = require("../middleware/authMiddleware");
const validateProject = require("../validators/projectValidator");

const router = express.Router();


// Protect all project routes
router.use(authMiddleware);


// CREATE
router.post("/", validateProject, createProject);

// READ ALL
router.get("/", getProjects);

// READ ONE
router.get("/:id", getProjectById);

// UPDATE
router.put("/:id", validateProject, updateProject);

// DELETE
router.delete("/:id", deleteProject);

// Member management
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);


module.exports = router;