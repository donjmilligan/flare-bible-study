const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all data from oldtestamentjesus1 table
router.get("/empires", async (req, res) => {
  try {
    const query = "SELECT id, name, imports FROM empires_nodes";
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

// POST add a new node to oldtestamentjesus1
router.post("/empires", async (req, res) => {
  const { name, imports } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "Name is required" });
  }
  try {
    const query =
      "INSERT INTO empires_nodes (name, imports) VALUES ($1, $2) RETURNING *";
    const values = [name, JSON.stringify(imports || [])];
    const result = await pool.query(query, values);
    res.json({ success: true, node: result.rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add node",
      message: error.message,
    });
  }
});

// DELETE a node by name from oldtestamentjesus1
router.delete("/empires/:name", async (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ success: false, error: "Name is required" });
  }
  try {
    const query = "DELETE FROM empires_nodes WHERE name = $1";
    await pool.query(query, [name]);
    res.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete node",
      message: error.message,
    });
  }
});

// PATCH update node position by name
router.patch("/empires/:name", async (req, res) => {
  const { angle, radius } = req.body;
  const { name } = req.params;
  if (typeof angle !== "number" || typeof radius !== "number") {
    return res
      .status(400)
      .json({ success: false, error: "angle and radius must be numbers" });
  }
  try {
    const query =
      "UPDATE empires_nodes SET angle = $1, radius = $2 WHERE name = $3 RETURNING *";
    const values = [angle, radius, name];
    const result = await pool.query(query, values);
    res.json({ success: true, node: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
