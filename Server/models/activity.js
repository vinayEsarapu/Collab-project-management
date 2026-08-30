const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
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

activitySchema.index({ issue: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);