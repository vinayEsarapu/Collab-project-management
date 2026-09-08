const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const issueRoutes = require("./routes/issueRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const profileRoutes = require("./routes/profileRoutes.js");

const app = express();

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

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* =========================
   Global Middleware
========================= */

app.use(express.json());
app.use(cookieParser());

/* =========================
   API Routes
========================= */

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/activities", activityRoutes);

app.use("/api/profile", profileRoutes);

/* =========================
   Health Route
========================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
  });
});

/* =========================
   Error Handling
========================= */

app.use(notFound);

app.use(errorHandler);

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();