const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");



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
        role: user.role
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
        role: user.role
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

    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role
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
        const user = await User.findById(req.user.userId).select("-password");

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


module.exports = {
  registerUser ,loginUser , getMe, refreshAccessToken, logoutUser
};