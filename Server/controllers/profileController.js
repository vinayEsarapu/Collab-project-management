const Project = require("../models/Project.js");
const Issue = require("../models/issues.js");
const User = require("../models/user.js");

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // -----------------------------
    // USER DETAILS
    // -----------------------------
    const user = await User.findById(userId)
      .select("name userCode email")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // -----------------------------
    // MY PROJECTS
    // Owner OR Member
    // -----------------------------
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId },
      ],
    })
      .select(
        "title description status technologies owner updatedAt"
      )
      .sort({ updatedAt: -1 })
      .lean();

    const myProjects = projects.map((project) => ({
      _id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      technologies: project.technologies || [],
      updatedAt: project.updatedAt,

      role:
        project.owner?.toString() === userId.toString()
          ? "Owner"
          : "Member",
    }));

    // -----------------------------
    // MY TASKS
    // Tasks are embedded inside Project
    // -----------------------------
    const taskProjects = await Project.find({
      "tasks.assignedTo": userId,
    })
      .select("title tasks")
      .lean();

    const myTasks = [];

    // Used to find task title for task-level issues
    const taskTitles = new Map();

    taskProjects.forEach((project) => {
      (project.tasks || []).forEach((task) => {
        const taskKey = `${project._id}:${task._id}`;

        taskTitles.set(taskKey, task.title);

        if (
          task.assignedTo?.toString() ===
          userId.toString()
        ) {
          myTasks.push({
            _id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,

            projectId: project._id,
            projectTitle: project.title,
          });
        }
      });
    });

    // -----------------------------
    // ISSUE DATA
    // -----------------------------
    const issueSelect =
      "title description status priority labels project task createdAt updatedAt";

    const issuePopulate = {
      path: "project",
      select: "title",
    };

    const [
      assignedProjectIssues,
      referredProjectIssues,
      assignedTaskIssues,
    ] = await Promise.all([
      // Assigned project-level issues
      Issue.find({
        assignedTo: userId,
        task: null,
      })
        .populate(issuePopulate)
        .select(issueSelect)
        .sort({ updatedAt: -1 })
        .lean(),

      // Referred project-level issues
      Issue.find({
        referredTo: userId,
        task: null,
      })
        .populate(issuePopulate)
        .select(issueSelect)
        .sort({ updatedAt: -1 })
        .lean(),

      // Assigned task-level issues
      Issue.find({
        assignedTo: userId,
        task: { $ne: null },
      })
        .populate(issuePopulate)
        .select(issueSelect)
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    // -----------------------------
    // FORMAT ISSUE RESPONSE
    // -----------------------------
    const formatIssue = (
      issue,
      isTaskIssue = false
    ) => {
      const result = {
        _id: issue._id,

        title: issue.title,
        description: issue.description,

        status: issue.status,
        priority: issue.priority,
        labels: issue.labels || [],

        projectId: issue.project?._id,
        projectTitle:
          issue.project?.title ||
          "Unknown project",

        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      };

      if (isTaskIssue) {
        result.taskId = issue.task;

        result.taskTitle =
          taskTitles.get(
            `${issue.project?._id}:${issue.task}`
          ) || "Unknown task";
      }

      return result;
    };

    // -----------------------------
    // FINAL RESPONSE
    // -----------------------------
    res.status(200).json({
      user,

      projects: myProjects,

      tasks: myTasks,

      assignedProjectIssues:
        assignedProjectIssues.map((issue) =>
          formatIssue(issue)
        ),

      referredProjectIssues:
        referredProjectIssues.map((issue) =>
          formatIssue(issue)
        ),

      assignedTaskIssues:
        assignedTaskIssues.map((issue) =>
          formatIssue(issue, true)
        ),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
};