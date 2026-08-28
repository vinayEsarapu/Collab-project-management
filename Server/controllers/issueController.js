const Issue = require("../models/issues");

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
    const issues = await Issue.find()
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
const updateIssue = async (req, res) => {
  try {
    const { title, description, status, priority,   labels, assignedTo } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    issue.title = title ?? issue.title;
    issue.description = description ?? issue.description;
    issue.status = status ?? issue.status;
    issue.priority = priority ?? issue.priority;
    issue.labels = labels ?? issue.labels;
    issue.assignedTo =
      assignedTo !== undefined ? assignedTo : issue.assignedTo;

    await issue.save();

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