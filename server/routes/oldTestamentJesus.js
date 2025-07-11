import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Example GET endpoint for oldtestamentsjesus2
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM oldtestamentsjesus2');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add other endpoints as needed

export default router;