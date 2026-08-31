const mongoose = require("mongoose");

const projectActivitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
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
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "TASK_ADDED",
        "TASK_UPDATED",
        "TASK_DELETED",
        "MEMBER_ADDED",
        "MEMBER_REMOVED",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ProjectActivity",
  projectActivitySchema
);