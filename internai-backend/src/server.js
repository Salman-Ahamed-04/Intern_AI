require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "InternAI API is running",
    mode: "MongoDB",
    timestamp: new Date(),
  });
});

// Routes
app.use("/api/auth",         require("./routes/auth.routes"));
app.use("/api/dashboard",    require("./routes/dashboard.routes"));
app.use("/api/candidates",   require("./routes/candidate.routes"));
app.use("/api/companies",    require("./routes/company.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/matches",      require("./routes/match.routes"));
app.use("/api/interviews",   require("./routes/interview.routes"));
app.use("/api/analytics",    require("./routes/analytics.routes"));
app.use("/api/internships",  require("./routes/internship.routes"));
app.use("/api/prolog",       require("./routes/prolog.routes"));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 InternAI API  →  http://localhost:${PORT}`);
  console.log(`🍃 Mode: MongoDB`);
  console.log(`🌱 Seed DB: node src/data/seed.js\n`);
});
