const express = require("express");

const {
  getMyProfile,
} = require("../controllers/profileController.js");

const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

module.exports = router;