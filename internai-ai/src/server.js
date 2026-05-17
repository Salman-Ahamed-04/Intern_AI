require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const prologRoutes = require("./routes/prolog.routes");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/prolog", prologRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "internai-ai", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("AI Service Error:", err);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`🤖 InternAI AI Service running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
});
