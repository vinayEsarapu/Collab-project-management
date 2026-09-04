const Project = require("../models/Project");
const Issue = require("../models/issues");

const authorizeProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userId.toString();

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
    next(error);
  }
};

const authorizeProjectOwner = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userId.toString();

    if (project.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Only the project owner can perform this action",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeIssueMember = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

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

    const isOwner = project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to access this issue",
      });
    }

    req.issue = issue;
    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
};

const authorizeIssueCreation = async (req, res, next) => {
  try {
    const project = await Project.findById(req.body.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner = project.owner.toString() === userId;

    const isMember = project.members.some(
      (member) => member.toString() === userId
    );

    if (req.body.task) {
  const task = project.tasks.id(req.body.task);

  if (!task) {
    return res.status(400).json({
      message: "Task does not belong to this project",
    });
  }
}

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message:
          "You are not authorized to create issues in this project",
      });
    }

    const requestedAssignee = req.body.assignedTo || null;
const requestedReferral = req.body.referredTo || null;


// Actual assignment is owner-only.
if (requestedAssignee && !isOwner) {
  return res.status(403).json({
    message: "Only the project owner can assign issues",
  });
}

// Validate actual assignee.
if (requestedAssignee) {
  const isProjectMember = project.members.some(
    (member) =>
      member.toString() === requestedAssignee.toString()
  );

  const isOwnerAssignee =
    project.owner.toString() === requestedAssignee.toString();

  if (!isProjectMember && !isOwnerAssignee) {
    return res.status(403).json({
      message: "Issue can only be assigned to a member of this project",
    });
  }
}

// Referral is allowed for project members.
// It does NOT grant assignment authority.
if (requestedReferral) {
  const isReferralOwner =
    project.owner.toString() === requestedReferral.toString();

  const isReferralMember = project.members.some(
    (member) =>
      member.toString() === requestedReferral.toString()
  );

  if (!isReferralOwner && !isReferralMember) {
    return res.status(403).json({
      message: "Issue can only be referred to a member of this project",
    });
  }

  // Don't allow referring the issue back to the creator.
  if (
    requestedReferral.toString() ===
    req.user.userId.toString()
  ) {
    return res.status(400).json({
      message: "You cannot refer an issue to yourself",
    });
  }
}


    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeIssueAssignment = async (req, res, next) => {
  try {
    const issue = req.issue;
    const project = req.project;

    if (!issue || !project) {
      return res.status(500).json({
        message: "Issue or project authorization data is missing",
      });
    }

    // If assignedTo is not part of the request,
    // the assignment is not being changed.
    if (!Object.prototype.hasOwnProperty.call(req.body, "assignedTo")) {
      return next();
    }

    const requestedAssignee = req.body.assignedTo || null;

    const currentAssignee = issue.assignedTo
      ? issue.assignedTo.toString()
      : null;

    const newAssignee = requestedAssignee
      ? requestedAssignee.toString()
      : null;

    // Assignment has not actually changed.
    if (currentAssignee === newAssignee) {
      return next();
    }

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner.toString() === userId;

    // Only project owner can change assignment.
    if (!isOwner) {
      return res.status(403).json({
        message:
          "Only the project owner can assign or reassign issues",
      });
    }

    // null means Unassigned, which is allowed.
    if (newAssignee === null) {
      return next();
    }

    // The new assignee must be a member of this project.
    const isProjectMember = project.members.some(
      (member) => member.toString() === newAssignee
    );

    if (!isProjectMember) {
      return res.status(403).json({
        message:
          "Issue can only be assigned to a member of this project",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const authorizeIssueEdit = async (req, res, next) => {
  try {
    const issue = req.issue;
    const project = req.project;

    if (!issue || !project) {
      return res.status(500).json({
        message: "Issue or project authorization data is missing",
      });
    }

    const userId = req.user.userId.toString();

    const isOwner =
      project.owner.toString() === userId;

    const isCreator =
      issue.createdBy.toString() === userId;

    const isAssignee =
      issue.assignedTo &&
      issue.assignedTo.toString() === userId;

    if (!isOwner && !isCreator && !isAssignee) {
      return res.status(403).json({
        message:
          "You are not authorized to edit this issue",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorizeProjectMember,
  authorizeProjectOwner,
  authorizeIssueMember,
  authorizeIssueCreation,
   authorizeIssueAssignment,
   authorizeIssueEdit
};