const { body, validationResult } = require("express-validator");

const validateProject = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Project description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Project description must be between 10 and 1000 characters"),

  body("status")
    .optional()
    .isIn(["Planning", "In Progress", "Completed"])
    .withMessage("Invalid project status"),

  body("technologies")
    .optional()
    .isArray()
    .withMessage("Technologies must be an array"),

  body("technologies.*")
    .optional()
    .isString()
    .withMessage("Each technology must be a string"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    next();
  }
];

module.exports = validateProject;