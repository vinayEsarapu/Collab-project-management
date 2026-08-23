const Project = require("../models/Project");
const User = require("../models/User");

// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const { title, description, status, technologies } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      technologies,
      owner: req.user.userId
    });

    res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET ALL PROJECTS
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user.userId
    });

    res.status(200).json({
      projects
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      project
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    const { title, description, status, technologies } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.userId
      },
      {
        title,
        description,
        status,
        technologies
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ADD MEMBER TO PROJECT
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required"
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

     const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a project member"
      });
    }


    project.members.push(userId);

    await project.save();

    res.status(200).json({
      message: "Member added successfully",
      project
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// REMOVE MEMBER FROM PROJECT
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId
    }).populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    if (!project.members.includes(userId)) {
      return res.status(404).json({
        message: "User is not a member of this project"
      });
    }

    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    await project.save();

    res.status(200).json({
      message: "Member removed successfully",
      project
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};