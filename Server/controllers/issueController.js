const Issue = require("../models/issues");
const Project = require("../models/Project");
const { createActivity } = require("../services/activityService");

// Create an issue
const createIssue = async (req, res) => {
  try {
    const { title, description, status, priority, labels, project, assignedTo } =
      req.body;

    const issue = await Issue.create({
      title,
      description,
      status,
      priority,
      labels,
      project,
      createdBy: req.user.userId,
      assignedTo: assignedTo || null,
    });
    await createActivity({
    issue: issue._id,
    project: issue.project,
    user: req.user.userId,
    action: "ISSUE_CREATED",
});
   if (assignedTo) {
  await createActivity({
    issue: issue._id,
    project: issue.project,
    user: req.user.userId,
    action: "ISSUE_ASSIGNED",
    details: {
      assignedTo: assignedTo.toString(),
    },
  });
}

    const populatedIssue = await Issue.findById(issue._id)
      .populate("project", "name description")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(201).json({
      message: "Issue created successfully",
      issue: populatedIssue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create issue",
      error: error.message,
    });
  }
};


// Get all issues
const getIssues = async (req, res) => {
  try {
    const userId = req.user.userId;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId },
      ],
    }).select("_id");

    const projectIds = projects.map((project) => project._id);

    const issues = await Issue.find({
      project: { $in: projectIds },
    })
      .populate("project", "name description")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};


// Get single issue
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("project", "title description")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    res.status(200).json({
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch issue",
      error: error.message,
    });
  }
};


// Update an issue


    // Update an issue
const updateIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      labels,
      assignedTo,
    } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    // Store old values before making changes
    const oldStatus = issue.status;
    const oldPriority = issue.priority;
    const oldAssignedTo = issue.assignedTo
      ? issue.assignedTo.toString()
      : null;

    const titleChanged =
      title !== undefined && title !== issue.title;

    const descriptionChanged =
      description !== undefined &&
      description !== issue.description;

    const labelsChanged =
      labels !== undefined &&
      JSON.stringify(labels) !== JSON.stringify(issue.labels);

    const statusChanged =
      status !== undefined &&
      status !== oldStatus;

    const priorityChanged =
      priority !== undefined &&
      priority !== oldPriority;

    const newAssignedTo =
  assignedTo !== undefined
    ? assignedTo || null
    : oldAssignedTo;

  const normalizedNewAssignedTo = newAssignedTo
   ? newAssignedTo.toString()
   : null;

  const assignmentChanged =
    assignedTo !== undefined &&
    normalizedNewAssignedTo !== oldAssignedTo;

    // Existing issue update logic
    issue.title = title ?? issue.title;
    issue.description = description ?? issue.description;
    issue.status = status ?? issue.status;
    issue.priority = priority ?? issue.priority;
    issue.labels = labels ?? issue.labels;
    issue.assignedTo =
      assignedTo !== undefined
        ? assignedTo || null
        : issue.assignedTo;

    await issue.save();

    /*
     * Create activity records
     */

    // Status changed
    if (statusChanged) {
      await createActivity({
        issue: issue._id,
        project: issue.project,
        user: req.user.userId,
        action: "STATUS_CHANGED",
        details: {
          from: oldStatus,
          to: issue.status,
        },
      });
    }

    // Priority changed
    if (priorityChanged) {
      await createActivity({
        issue: issue._id,
        project: issue.project,
        user: req.user.userId,
        action: "PRIORITY_CHANGED",
        details: {
          from: oldPriority,
          to: issue.priority,
        },
      });
    }

    // Assignment changed
    // Assignment changed
    if (assignmentChanged) {
  if (!normalizedNewAssignedTo) {
    await createActivity({
      issue: issue._id,
      project: issue.project,
      user: req.user.userId,
      action: "ISSUE_UNASSIGNED",
      details: {},
    });
  } else if (!oldAssignedTo) {
    await createActivity({
      issue: issue._id,
      project: issue.project,
      user: req.user.userId,
      action: "ISSUE_ASSIGNED",
      details: {
        assignedTo: savedAssignedTo,
      },
    });
  } else {
    await createActivity({
      issue: issue._id,
      project: issue.project,
      user: req.user.userId,
      action: "ISSUE_REASSIGNED",
      details: {
        from: oldAssignedTo,
        to: savedAssignedTo,
      },
    });
  }
}

    // Other issue information changed
    if (
      titleChanged ||
      descriptionChanged ||
      labelsChanged
    ) {
      await createActivity({
        issue: issue._id,
        project: issue.project,
        user: req.user.userId,
        action: "ISSUE_UPDATED",
        details: {
          titleChanged,
          descriptionChanged,
          labelsChanged,
        },
      });
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate("project", "name description")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({
      message: "Issue updated successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update issue",
      error: error.message,
    });
  }

};


// Delete an issue
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete issue",
      error: error.message,
    });
  }
};

// Get issues by project
const getIssuesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const issues = await Issue.find({ project: projectId })
      .populate("project", "name description")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project issues",
      error: error.message,
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  getIssuesByProject,
  updateIssue,
  deleteIssue,
};