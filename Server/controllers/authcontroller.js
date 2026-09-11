const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const {
  generateSecureToken,
  hashToken
} = require("../services/authTokenService.js");

const {
  sendPasswordResetEmail
} = require("../services/emailService.js");


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lastUser = await User.findOne({})
      .sort({ createdAt: -1 })
      .select("userCode");

    let nextNumber = 101;

    if (lastUser?.userCode) {
      const number = parseInt(
        lastUser.userCode.replace("USR-", ""),
        10
      );

      if (!Number.isNaN(number)) {
        nextNumber = number + 1;
      }
    }

    const userCode = `USR-${nextNumber}`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userCode
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        userCode: user.userCode,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Short-lived access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m"
      }
    );

    // Long-lived refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // Store refresh token in an HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        userCode: user.userCode,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found"
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(403).json({
        message: "Invalid or expired refresh token"
      });
    }

    // Reject refresh tokens created before a password/email security change
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({
        message: "Session expired. Please login again."
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m"
      }
    );

    res.status(200).json({
      accessToken
    });

  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired refresh token"
    });
  }
};


const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });

  res.status(200).json({
    message: "Logout successful"
  });
};


const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};


/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    /*
     * Always return the same response whether the email
     * exists or not.
     *
     * This prevents email-account enumeration.
     */
    const genericResponse = {
      message:
        "If an account exists with this email, a password reset link has been sent."
    };

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    /*
     * Generate a cryptographically secure random token.
     * The raw token is sent only through the email link.
     */
    const resetToken = generateSecureToken();

    /*
     * Store only the SHA-256 hash in MongoDB.
     */
    const resetTokenHash = hashToken(resetToken);

    /*
     * Reset link expires after 15 minutes.
     */
    const resetExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpiresAt = resetExpiresAt;

    await user.save();

    /*
     * Raw token is placed in the frontend URL.
     * It is never stored in the database.
     */
    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(
        user.email,
        user.name,
        resetUrl
      );
    } catch (emailError) {
      /*
       * Do not reveal email-service failure to the user.
       * Also remove the token because the email was not sent.
       */
      console.error(
        "Password reset email failed:",
        emailError
      );

      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;

      await user.save();
    }

    return res.status(200).json(genericResponse);

  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    /*
     * Keep the response generic even if something fails.
     */
    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent."
    });
  }
};

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Invalid or expired password reset link"
      });
    }

    /*
     * Hash the token received from the URL.
     *
     * MongoDB only contains the hash, never the raw token.
     */
    const resetTokenHash = hashToken(token);

    /*
     * Find the user whose reset token matches
     * and whose token has not expired.
     */
    const user = await User.findOne({
      passwordResetTokenHash: resetTokenHash,
      passwordResetExpiresAt: {
        $gt: new Date()
      }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset link"
      });
    }

    /*
     * Hash the new password before storing it.
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    /*
     * Token can be used only once.
     */
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    /*
     * Invalidate existing refresh sessions.
     *
     * Any refresh token created with the previous
     * tokenVersion will now be rejected.
     */
    user.tokenVersion += 1;

    await user.save();

    /*
     * Clear any existing refresh cookie from this browser.
     */
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({
      message:
        "Password reset successful. Please login with your new password."
    });

  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Change Email - Request Verification
|--------------------------------------------------------------------------
*/

const changeEmail = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /*
     * Verify the user's current password.
     */
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    /*
     * Don't allow the same email.
     */
    if (user.email === newEmail) {
      return res.status(400).json({
        message: "New email must be different from your current email"
      });
    }

    /*
     * Check whether another account already uses
     * the requested email.
     */
    const existingUser = await User.findOne({
      email: newEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered"
      });
    }

    /*
     * Generate a secure random verification token.
     */
    const emailChangeToken = generateSecureToken();

    /*
     * Store only the hash in MongoDB.
     */
    const emailChangeTokenHash =
      hashToken(emailChangeToken);

    /*
     * Verification link expires after 15 minutes.
     */
    const emailChangeExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    user.pendingEmail = newEmail;
    user.emailChangeTokenHash = emailChangeTokenHash;
    user.emailChangeExpiresAt = emailChangeExpiresAt;

    await user.save();

    /*
     * The raw token is sent only through the email.
     */
    const verificationUrl =
      `${process.env.CLIENT_URL}/verify-email/${emailChangeToken}`;

    try {
      await sendEmailChangeVerification(
        newEmail,
        user.name,
        verificationUrl
      );
    } catch (emailError) {
      console.error(
        "Email change verification failed:",
        emailError
      );

      /*
       * Don't leave an unusable pending email/token
       * in the database if the email could not be sent.
       */
      user.pendingEmail = null;
      user.emailChangeTokenHash = null;
      user.emailChangeExpiresAt = null;

      await user.save();

      return res.status(500).json({
        message:
          "Unable to send verification email. Please try again later."
      });
    }

    return res.status(200).json({
      message:
        "Verification email sent to your new email address."
    });

  } catch (error) {
    console.error(
      "Change email error:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Verify Email Change
|--------------------------------------------------------------------------
*/

const verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Invalid or expired email verification link"
      });
    }

    /*
     * Hash the token received from the URL.
     */
    const emailChangeTokenHash =
      hashToken(token);

    /*
     * Find the user with:
     * - matching token
     * - unexpired token
     * - pending email
     */
    const user = await User.findOne({
      emailChangeTokenHash,
      emailChangeExpiresAt: {
        $gt: new Date()
      },
      pendingEmail: {
        $ne: null
      }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired email verification link"
      });
    }

    /*
     * Check again before changing the email.
     *
     * Another account could have registered this email
     * after the verification request was created.
     */
    const emailAlreadyUsed = await User.findOne({
      email: user.pendingEmail,
      _id: { $ne: user._id }
    });

    if (emailAlreadyUsed) {
      user.pendingEmail = null;
      user.emailChangeTokenHash = null;
      user.emailChangeExpiresAt = null;

      await user.save();

      return res.status(409).json({
        message:
          "This email is no longer available. Please choose another email."
      });
    }

    /*
     * Apply the verified email.
     */
    user.email = user.pendingEmail;

    /*
     * Clear pending email data.
     *
     * This also makes the verification link one-time use.
     */
    user.pendingEmail = null;
    user.emailChangeTokenHash = null;
    user.emailChangeExpiresAt = null;

    /*
     * Invalidate existing refresh sessions.
     */
    user.tokenVersion += 1;

    await user.save();

    /*
     * Clear the current browser's refresh cookie.
     */
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({
      message:
        "Email changed successfully. Please login again with your new email."
    });

  } catch (error) {
    console.error(
      "Verify email change error:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
   resetPassword,
     changeEmail,
  verifyEmailChange
};