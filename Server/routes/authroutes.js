const express = require("express");
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authvalidator");

const validate = require("../middleware/validationmiddleware");

const router = express.Router();

router.post("/register", registerValidator,
  validate, registerUser);
router.post("/login", loginValidator,
  validate, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);

module.exports = router;