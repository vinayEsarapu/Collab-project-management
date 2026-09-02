const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    // Activity can belong to an issue
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },

    // Activity can also belong directly to an embedded task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "ISSUE_CREATED",
        "ISSUE_UPDATED",
        "ISSUE_ASSIGNED",
        "ISSUE_REASSIGNED",
        "ISSUE_UNASSIGNED",
        "STATUS_CHANGED",
        "PRIORITY_CHANGED",
        "COMMENT_ADDED",
        "COMMENT_UPDATED",
        "COMMENT_DELETED",

        // Task actions
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_DELETED",
        "TASK_ASSIGNED",
        "TASK_REASSIGNED",
        "TASK_UNASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_PRIORITY_CHANGED",
      ],
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Existing issue activity queries
activitySchema.index({
  issue: 1,
  createdAt: -1,
});

// Task activity queries
activitySchema.index({
  task: 1,
  createdAt: -1,
});

// Project activity queries
activitySchema.index({
  project: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Activity", activitySchema);