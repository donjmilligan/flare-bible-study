const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password, first_name, last_name, profile } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }
  try {
    // Check if user already exists
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (userCheck.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, error: "Email already registered" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user
    const insertQuery = `INSERT INTO users (email, password, first_name, last_name, profile) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, profile, created_at`;
    const values = [
      email,
      hashedPassword,
      first_name,
      last_name,
      profile ? JSON.stringify(profile) : null,
    ];
    const result = await pool.query(insertQuery, values);
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to register user",
        message: error.message,
      });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password are required" });
  }
  try {
    const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userQuery.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }
    const user = userQuery.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }
    // Optionally, generate JWT here
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile: user.profile,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to login",
        message: error.message,
      });
  }
});

module.exports = router;
