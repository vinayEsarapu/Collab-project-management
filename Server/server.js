
const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const projectRoutes = require("./routes/projectRoutes");
const issueRoutes = require("./routes/issueRoutes");
const commentRoutes = require("./routes/commentRoutes");

dotenv.config();
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured");
}

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not configured");
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is not configured");
}
const app = express();
const allowedOrigin = process.env.CLIENT_URL;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
// Middleware
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/comments", commentRoutes);
//  Routes
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;




// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();