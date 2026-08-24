const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const projectRoutes = require("./routes/projectRoutes");
const issueRoutes = require("./routes/issueRoutes");

dotenv.config();
const app = express();
app.use(cookieParser());
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

//  Routes
app.use("/api/auth", authRoutes);

// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();