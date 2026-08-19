const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

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