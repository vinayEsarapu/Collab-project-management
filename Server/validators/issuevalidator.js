const { body } = require("express-validator");

const createIssueValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("status")
    .optional()
    .isIn(["Open", "In Progress", "Resolved", "Closed"])
    .withMessage("Invalid status"),

  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High", "Critical"])
    .withMessage("Invalid priority"),

  body("labels")
    .optional()
    .isArray()
    .withMessage("Labels must be an array"),

  body("project")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Invalid project ID"),

  body("assignedTo")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid assignee ID"),
];


const updateIssueValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),

  body("status")
    .optional()
    .isIn(["Open", "In Progress", "Resolved", "Closed"])
    .withMessage("Invalid status"),

  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High", "Critical"])
    .withMessage("Invalid priority"),

  body("labels")
    .optional()
    .isArray()
    .withMessage("Labels must be an array"),

  body("assignedTo")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid assignee ID"),
];


module.exports = {
  createIssueValidator,
  updateIssueValidator,
};