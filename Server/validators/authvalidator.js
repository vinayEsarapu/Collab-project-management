const { body } = require("express-validator");

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters"),
];

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

const resetPasswordValidator = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters"),
];

/*
|--------------------------------------------------------------------------
| Change Email
|--------------------------------------------------------------------------
*/

const changeEmailValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newEmail")
    .trim()
    .notEmpty()
    .withMessage("New email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changeEmailValidator,
};