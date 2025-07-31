const express = require("express");
const cors = require("cors");
require("dotenv").config();

const bibleDataRoutes = require("./routes/bibleData");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/bible", bibleDataRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Bible Study API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Flare Bible Study API",
    endpoints: {
      health: "/health",
      bibleData: "/api/bible/oldtestamentjesus1",
      filteredData: "/api/bible/oldtestamentjesus1/filter",
      visualization: "/api/bible/oldtestamentjesus1/visualization",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - Health check: http://localhost:${PORT}/health`);
  console.log(
    `   - Bible data: http://localhost:${PORT}/api/bible/oldtestamentjesus1`,
  );
  console.log(
    `   - Visualization: http://localhost:${PORT}/api/bible/oldtestamentjesus1/visualization`,
  );
});
