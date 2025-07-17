const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all data from oldtestamentjesus1 table
router.get("/oldtestamentjesus1", async (req, res) => {
  try {
    const query = "SELECT * FROM oldtestamentsjesus1";
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch data from database",
      message: error.message,
    });
  }
});
module.exports = router;
