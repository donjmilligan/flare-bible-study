const express = require("express");
const cors = require("cors");
require("dotenv").config();

const bibleDataRoutes = require("./routes/bibleData");
const oldTestamentJesus2 = require("./routes/oldTestamentJesus2");
const messageOfHope = require("./routes/messageofHope");
const empires = require("./routes/empires");
const bibleBooks = require("./routes/bibleBooks");
const authRoutes = require("./routes/auth");
const whatIsSpirit = require("./routes/whatIsSpirit");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bible", bibleDataRoutes);
app.use("/api/bible", oldTestamentJesus2);
app.use("/api/bible", messageOfHope);
app.use("/api/bible", empires);
app.use("/api/bible", bibleBooks);
app.use("/api/bible", whatIsSpirit);

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
