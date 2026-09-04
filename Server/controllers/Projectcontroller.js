const Project = require("../models/Project.js");
const User = require("../models/user.js");
const ProjectActivity = require("../models/ProjectActivity.js");
const { createActivity } = require("../services/activityService");
const mongoose = require("mongoose");
//const ProjectLog = require("../models/ProjectLog");



// ADD TASK - OWNER ONLY
const addTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
    } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only project owner can create tasks
    if (project.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Only the project owner can create tasks",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Task description is required",
      });
    }

    // Validate assignee
    if (assignedTo) {
      const isOwner =
        project.owner.toString() === assignedTo.toString();

      const isMember = project.members.some(
        (member) => member.toString() === assignedTo.toString()
      );

      if (!isOwner && !isMember) {
        return res.status(400).json({
          message:
            "Task can only be assigned to the project owner or a project member",
        });
      }
    }

    const task = {
      title: title.trim(),
      description: description ? description.trim() : "",
      status: status || "Planning",
      priority: priority || "Medium",
      assignedTo: assignedTo || null,
    };

    project.tasks.push(task);

    await project.save();

    const createdTask =
      project.tasks[project.tasks.length - 1];

      await createActivity({
  task: createdTask._id,
  project: project._id,
  user: req.user.userId,
  action: "TASK_CREATED",
  details: {
    title: createdTask.title,
  },
});

    res.status(201).json({
      message: "Task created successfully",
      task: createdTask,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE TASK - OWNER ONLY
const updateTask = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
    } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const task = project.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner.toString() === userId;

    const isAssignedMember =
      task.assignedTo &&
      task.assignedTo.toString() === userId;

    // Only owner or assigned member can edit
    if (!isOwner && !isAssignedMember) {
      return res.status(403).json({
        message:
          "Only the project owner or assigned member can edit this task",
      });
    }

    // Assignment can ONLY be changed by owner
    if (
      assignedTo !== undefined &&
      !isOwner
    ) {
      return res.status(403).json({
        message: "Only the project owner can change task assignment",
      });
    }

    // Validate new assignee
    if (assignedTo) {
      const assigneeIsOwner =
        project.owner.toString() === assignedTo.toString();

      const assigneeIsMember =
        project.members.some(
          (member) =>
            member.toString() === assignedTo.toString()
        );

      if (!assigneeIsOwner && !assigneeIsMember) {
        return res.status(400).json({
          message:
            "Task can only be assigned to the project owner or a project member",
        });
      }
    }
    const changes = [];

    if (title !== undefined) {
  if (!title.trim()) {
    return res.status(400).json({
      message: "Task title cannot be empty",
    });
  }

  const newTitle = title.trim();

  if (task.title !== newTitle) {
    changes.push({
      action: "TASK_UPDATED",
      details: {
        field: "title",
        from: task.title,
        to: newTitle,
      },
    });

    task.title = newTitle;
  }
}

if (description !== undefined) {
  if (!description.trim()) {
    return res.status(400).json({
      message: "Task description cannot be empty",
    });
  }

  const newDescription = description.trim();

  if (task.description !== newDescription) {
    changes.push({
      action: "TASK_UPDATED",
      details: {
        field: "description",
        from: task.description,
        to: newDescription,
      },
    });

    task.description = newDescription;
  }
}

if (status !== undefined && task.status !== status) {
  changes.push({
    action: "TASK_STATUS_CHANGED",
    details: {
      from: task.status,
      to: status,
    },
  });

  task.status = status;
}

if (priority !== undefined && task.priority !== priority) {
  changes.push({
    action: "TASK_PRIORITY_CHANGED",
    details: {
      from: task.priority,
      to: priority,
    },
  });

  task.priority = priority;
}

if (assignedTo !== undefined) {
  const oldAssignedTo = task.assignedTo
    ? task.assignedTo.toString()
    : null;

  const newAssignedTo = assignedTo
    ? assignedTo.toString()
    : null;

  if (oldAssignedTo !== newAssignedTo) {
    let action = "TASK_ASSIGNED";

    if (oldAssignedTo && newAssignedTo) {
      action = "TASK_REASSIGNED";
    } else if (oldAssignedTo && !newAssignedTo) {
      action = "TASK_UNASSIGNED";
    }

    changes.push({
      action,
      details: {
        from: oldAssignedTo,
        to: newAssignedTo,
      },
    });

    task.assignedTo = assignedTo || null;
  }
}
    await project.save();

    for (const change of changes) {
  await createActivity({
    task: task._id,
    project: project._id,
    user: req.user.userId,
    action: change.action,
    details: change.details,
  });
}

    res.status(200).json({
      message: "Task updated successfully",
      task,
      project,
    });
  } catch (error) {
    next(error);
  }
};
// DELETE TASK - OWNER ONLY
const deleteTask = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only owner can delete
    if (
      project.owner.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message: "Only the project owner can delete tasks",
      });
    }

    const task = project.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    await createActivity({
  task: task._id,
  project: project._id,
  user: req.user.userId,
  action: "TASK_DELETED",
  details: {
    title: task.title,
  },
});

    task.deleteOne();

    await project.save();

    

    res.status(200).json({
      message: "Task deleted successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const getProjectTasks = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("tasks.assignedTo", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner._id.toString() === userId;

    const isMember = project.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    res.status(200).json({
      projectId: project._id,
      tasks: project.tasks,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;

    const project = await Project.findById(id)
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("tasks.assignedTo", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner._id.toString() === userId;

    const isMember = project.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const task = project.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      task,
    });
  } catch (error) {
    next(error);
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
// UPDATE PROJECT - OWNER ONLY
const updateProject = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      technologies,
      members,
    } = req.body;

    // -----------------------------
    // Validate project fields
    // -----------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Project title is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Project description is required",
      });
    }

    if (!Array.isArray(members)) {
      return res.status(400).json({
        message: "Members must be an array",
      });
    }

    // -----------------------------
    // Find project - OWNER ONLY
    // -----------------------------

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner",
      });
    }

    // -----------------------------
    // Prepare members
    // -----------------------------

    const ownerId = req.user.userId.toString();

    const selectedMembers = [
      ...new Set(
        members.map((memberId) => memberId.toString())
      ),
    ];

    // Owner cannot be added as a member
    if (selectedMembers.includes(ownerId)) {
      return res.status(400).json({
        message: "Project owner cannot be added as a member",
      });
    }

    // -----------------------------
    // Validate members exist
    // -----------------------------

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
    // Detect member changes
    // -----------------------------

    const oldMemberIds = project.members.map((member) =>
      member.toString()
    );

    const addedMemberIds = selectedMembers.filter(
      (memberId) => !oldMemberIds.includes(memberId)
    );

    const removedMemberIds = oldMemberIds.filter(
      (memberId) => !selectedMembers.includes(memberId)
    );

    // -----------------------------
    // Update project
    // -----------------------------

    project.title = title.trim();
    project.description = description.trim();
    project.status = status;
    project.technologies = technologies || [];
    project.members = selectedMembers;

    await project.save();

    // -----------------------------
    // Project activity
    // -----------------------------

    await ProjectActivity.create({
      project: project._id,
      user: req.user.userId,
      action: "PROJECT_UPDATED",
      description: `Project "${project.title}" was updated`,
    });

    // -----------------------------
    // Member activity
    // -----------------------------

    if (addedMemberIds.length > 0) {
      const addedUsers = await User.find({
        _id: { $in: addedMemberIds },
      }).select("name");

      for (const user of addedUsers) {
        await ProjectActivity.create({
          project: project._id,
          user: req.user.userId,
          action: "MEMBER_ADDED",
          description: `${user.name} was added to the project`,
        });
      }
    }

    if (removedMemberIds.length > 0) {
      const removedUsers = await User.find({
        _id: { $in: removedMemberIds },
      }).select("name");

      for (const user of removedUsers) {
        await ProjectActivity.create({
          project: project._id,
          user: req.user.userId,
          action: "MEMBER_REMOVED",
          description: `${user.name} was removed from the project`,
        });
      }
    }

    // -----------------------------
    // Return populated project
    // -----------------------------

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name userCode email")
      .populate("members", "name userCode email");

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
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

    const { date } = req.query;

    // Verify project access
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

    // Base filter
    const filter = {
      project: projectId,
    };

    // Optional date filter
    if (date) {
      const selectedDate = new Date(
        `${date}T00:00:00.000`
      );

      if (Number.isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date format",
        });
      }

      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);

      filter.createdAt = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    }

    // Count AFTER applying filter
    const total = await ProjectActivity.countDocuments(
      filter
    );

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(total / limit);

    const currentPage =
      totalPages > 0
        ? Math.min(page, totalPages)
        : 1;

    const skip = (currentPage - 1) * limit;

    const activities = await ProjectActivity.find(filter)
      .populate("user", "name userCode email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      activities,
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get project activity error:",
      error
    );

    res.status(500).json({
      message: "Unable to load project activity",
    });
  }
};


// DELETE PROJECT ACTIVITY - OWNER ONLY
const deleteProjectActivity = async (req, res) => {
  try {
    const { id, activityId } = req.params;

    // Find project and verify owner
    const project = await Project.findOne({
      _id: id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(403).json({
        message: "Only the project owner can delete activity logs",
      });
    }

    // Find activity belonging to this project
    const activity = await ProjectActivity.findOne({
      _id: activityId,
      project: id,
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity log not found",
      });
    }

    await ProjectActivity.findByIdAndDelete(activityId);

    return res.status(200).json({
      message: "Activity log deleted successfully",
      activityId,
    });
  } catch (error) {
    console.error(
      "Delete project activity error:",
      error
    );

    return res.status(500).json({
      message: "Unable to delete activity log",
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

  addTask,
  updateTask,
  deleteTask,
  getProjectTasks,
  getTaskById,

  getProjectActivity,
  deleteProjectActivity,
};