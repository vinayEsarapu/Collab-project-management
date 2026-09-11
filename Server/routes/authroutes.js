const express = require("express");

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
    changeEmail,
  verifyEmailChange
} = require("../controllers/authcontroller");

const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changeEmailValidator
} = require("../validators/authvalidator");

const authMiddleware = require("../middleware/authMiddleware");
const authRateLimiter = require("../middleware/authRateLimiter");



const validate = require("../middleware/validationmiddleware");

const router = express.Router();


router.post(
  "/register",
  registerValidator,
  validate,
  registerUser
);


router.post(
  "/login",
   authRateLimiter,
  loginValidator,
  validate,
  loginUser
);


router.post(
  "/refresh",
  refreshAccessToken
);


router.post(
  "/logout",
  logoutUser
);


router.get(
  "/me",
  authMiddleware,
  getMe
);


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password",
   authRateLimiter,
  forgotPasswordValidator,
  validate,
  forgotPassword
);

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

router.post(
  "/reset-password/:token",
    authRateLimiter,
  resetPasswordValidator,
  validate,
  resetPassword
);

/*
|--------------------------------------------------------------------------
| Change Email
|--------------------------------------------------------------------------
*/

router.post(
  "/change-email",
  authRateLimiter,
  authMiddleware,
  changeEmailValidator,
  validate,
  changeEmail
);


/*
|--------------------------------------------------------------------------
| Verify Email Change
|--------------------------------------------------------------------------
*/

router.get(
  "/verify-email/:token",
  verifyEmailChange
);


module.exports = router;