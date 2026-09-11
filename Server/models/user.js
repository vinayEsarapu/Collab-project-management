const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    userCode: {
      type: String,
      unique: true,
      required: true,
      immutable: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    /*
     * =========================================
     * EMAIL CHANGE
     * =========================================
     */

    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },

    emailChangeTokenHash: {
      type: String,
      default: null
    },

    emailChangeExpiresAt: {
      type: Date,
      default: null
    },

    /*
     * =========================================
     * PASSWORD RESET
     * =========================================
     */

    passwordResetTokenHash: {
      type: String,
      default: null
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null
    },

    /*
     * =========================================
     * SESSION INVALIDATION
     * =========================================
     *
     * Increment this whenever we need to
     * invalidate previously issued refresh
     * tokens.
     */

    tokenVersion: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

module.exports = User;