const Project = require("../models/Project");

const checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.id.toString();

    const isOwner = project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to access this project",
      });
    }

    req.project = project;

    next();
  } catch (error) {
    res.status(500).json({
      message: "Project authorization check failed",
      error: error.message,
    });
  }
};

module.exports = checkProjectAccess;