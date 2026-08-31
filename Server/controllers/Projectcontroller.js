const Project = require("../models/Project.js");
const User = require("../models/user.js");
const ProjectActivity = require("../models/ProjectActivity.js");
const mongoose = require("mongoose");
const ProjectLog = require("../models/ProjectLog");



// ADD TASK - OWNER ONLY
const addTask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(403).json({
        message: "You are not authorized to modify tasks.",
      });
    }

    project.tasks.push({
      title: title.trim(),
    });

    await project.save();

    await ProjectLog.create({
      project: project._id,
      user: req.user.userId,
      action: "TASK_ADDED",
      description: `Task "${title.trim()}" was added.`,
    });

    res.status(201).json({
      message: "Task added successfully",
      project,
    });
  } catch (error) {
    console.error("Add task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE TASK - OWNER ONLY
const updateTask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(403).json({
        message: "You are not authorized to modify tasks.",
      });
    }

    const task = project.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const oldTitle = task.title;

    task.title = title.trim();

    await project.save();

    await ProjectLog.create({
      project: project._id,
      user: req.user.userId,
      action: "TASK_UPDATED",
      description: `Task "${oldTitle}" was changed to "${title.trim()}".`,
    });

    res.status(200).json({
      message: "Task updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE TASK - OWNER ONLY
const deleteTask = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(403).json({
        message: "You are not authorized to modify tasks.",
      });
    }

    const task = project.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const deletedTitle = task.title;

    task.deleteOne();

    await project.save();

    await ProjectLog.create({
      project: project._id,
      user: req.user.userId,
      action: "TASK_DELETED",
      description: `Task "${deletedTitle}" was deleted.`,
    });

    res.status(200).json({
      message: "Task deleted successfully",
      project,
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// CREATE PROJECT
// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      technologies,
      tasks,
      members,
    } = req.body;

    // -----------------------------
    // Validate members
    // -----------------------------

    if (!Array.isArray(members)) {
      return res.status(400).json({
        message: "Members must be an array",
      });
    }

    const ownerId = req.user.userId.toString();

    const selectedMembers = [
      ...new Set(
        members.map((memberId) => memberId.toString())
      ),
    ];

    if (selectedMembers.includes(ownerId)) {
      return res.status(400).json({
        message: "Project owner cannot be added as a member",
      });
    }

    if (selectedMembers.length > 0) {
      const users = await User.find({
        _id: { $in: selectedMembers },
      }).select("_id");

      if (users.length !== selectedMembers.length) {
        return res.status(400).json({
          message: "One or more selected members do not exist",
        });
      }
    }

    // -----------------------------
    // Create project
    // -----------------------------

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      status,
      technologies: technologies || [],
      tasks: tasks || [],
      owner: req.user.userId,
      members: selectedMembers,
    });

    // -----------------------------
    // Create project activity
    // -----------------------------

    await ProjectActivity.create({
      project: project._id,
      user: req.user.userId,
      action: "PROJECT_CREATED",
      description: `Project "${project.title}" was created`,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL PROJECTS
// GET ALL PROJECTS
const getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).populate("members", "name email");

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
// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { members: req.user.userId }
      ]
    })
      .populate("owner", "name userCode")
      .populate("members", "name userCode");

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not authorized to access it"
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
        message: "Project not found",
      });
    }

    // Update only project-level information.
    // Tasks have separate owner-only APIs.
    project.title = title;
    project.description = description;
    project.status = status;
    project.technologies = technologies;

    await project.save();

    // Project.updatedAt is automatically updated by timestamps.

    await ProjectActivity.create({
      project: project._id,
      user: req.user.userId,
      action: "PROJECT_UPDATED",
      description: `Project "${project.title}" was updated`,
    });

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ADD PROJECT TASK - OWNER ONLY


// UPDATE PROJECT TASK - OWNER ONLY

// DELETE PROJECT TASK - OWNER ONLY

// GET PROJECT ACTIVITY
const getProjectActivity = async (req, res) => {
  try {
    const projectId = req.params.id;

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.userId },
        { members: req.user.userId },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message:
          "Project not found or you are not authorized to access it",
      });
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ProjectActivity.find({
        project: projectId,
      })
        .populate("user", "name userCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      ProjectActivity.countDocuments({
        project: projectId,
      }),
    ]);

    res.status(200).json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get project activity error:", error);

    res.status(500).json({
      message: "Unable to load project activity",
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

// Get all registered users for project member selection
const getUsersForMemberSelection = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.userId },
    })
      .select("_id userCode name email")
      .sort({ name: 1 });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    res.status(500).json({
      message: "Failed to fetch registered users",
      error: error.message,
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
    }).populate("members", "name email");

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

    if (project.owner.toString() === userId) {
     return res.status(400).json({
     message: "Project owner is already part of the project"
  });
}

    const alreadyMember = project.members.some(
  (member) => member._id.toString() === userId
);

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a project member"
      });
    }


    project.members.push(userId);

    await project.save();

    await ProjectActivity.create({
  project: project._id,
  user: req.user.userId,
  action: "MEMBER_ADDED",
  description: `${user.name} was added to the project`,
});


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
     if (userId === project.owner.toString()) {
  return res.status(400).json({
    message: "Project owner cannot be removed"
  });
}

    const isMember = project.members.some(
  (member) => member._id.toString() === userId
);
    if (!isMember) {
      return res.status(404).json({
        message: "User is not a member of this project"
      });
    }

   const removedMember = project.members.find(
  (member) => member._id.toString() === userId
);

    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    await project.save();

    await ProjectActivity.create({
  project: project._id,
  user: req.user.userId,
  action: "MEMBER_REMOVED",
  description: `${removedMember.name} was removed from the project`,
});

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

// SEARCH REGISTERED USERS FOR PROJECT MEMBERS
// SEARCH REGISTERED USERS FOR PROJECT MEMBERS
const searchUsers = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const searchValue = search.trim();

    const users = await User.find({
      $or: [
        {
          name: {
            $regex: searchValue,
            $options: "i"
          }
        },
        {
          userCode: {
            $regex: searchValue,
            $options: "i"
          }
        }
      ]
    })
      .select("name userCode")
      .limit(10);

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Failed to search users:", error);

    res.status(500).json({
      message: "Unable to search users",
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
  removeMember,
  getUsersForMemberSelection,
  searchUsers,
  addTask,
  updateTask,
  deleteTask,
  getProjectActivity,
};