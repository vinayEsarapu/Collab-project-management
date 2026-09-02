const Activity = require("../models/activity");
const Issue = require("../models/issues");
const Project = require("../models/Project");

// Get paginated activity history for an issue
const getIssueActivities = async (req, res) => {
  try {
    const { issueId } = req.params;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );

    const { date } = req.query;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const project = await Project.findById(issue.project);

    if (!project) {
      return res.status(404).json({
        message: "Associated project not found",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message:
          "You are not authorized to view this activity",
      });
    }

    const filter = {
      issue: issueId,
    };

    // Optional single-day filter
    if (date) {
      const selectedDate = new Date(`${date}T00:00:00.000`);

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

    const totalActivities = await Activity.countDocuments(filter);

    const totalPages =
      totalActivities === 0
        ? 0
        : Math.ceil(totalActivities / limit);

    const currentPage =
      totalPages > 0
        ? Math.min(page, totalPages)
        : 1;

    const skip = (currentPage - 1) * limit;

    const activities = await Activity.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      count: activities.length,
      activities,
      pagination: {
        currentPage,
        totalPages,
        totalActivities,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch issue activity",
      error: error.message,
    });
  }
};

// Get paginated activity history for all issues belonging to a task
const getTaskActivities = async (req, res) => {
  try {
    const { taskId } = req.params;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );

    const { date } = req.query;

    // Find the project containing this task
    const project = await Project.findOne({
      "tasks._id": taskId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check project access
    const userId = req.user.userId.toString();

    const isOwner =
      project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to view this activity",
      });
    }

    // Find all issues belonging to this task
    const taskIssues = await Issue.find({
      project: project._id,
      task: taskId,
    }).select("_id");

    const issueIds = taskIssues.map((issue) => issue._id);

    const filter = {
      issue: { $in: issueIds },
    };

    // Optional single-day filter
    if (date) {
      const selectedDate = new Date(`${date}T00:00:00.000`);

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

    const totalActivities =
      await Activity.countDocuments(filter);

    const totalPages =
      totalActivities === 0
        ? 0
        : Math.ceil(totalActivities / limit);

    const currentPage =
      totalPages > 0
        ? Math.min(page, totalPages)
        : 1;

    const skip = (currentPage - 1) * limit;

    const activities = await Activity.find(filter)
      .populate("user", "name email")
      .populate("issue", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      count: activities.length,
      activities,
      pagination: {
        currentPage,
        totalPages,
        totalActivities,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task activity",
      error: error.message,
    });
  }
};

module.exports = {
  getIssueActivities,
  getTaskActivities,
};

