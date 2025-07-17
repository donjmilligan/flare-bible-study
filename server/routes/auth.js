import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, profile } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, profile) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, profile',
      [email, hash, firstName, lastName, profile ? JSON.stringify(profile) : null]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Signin Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  // Create a JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    'your_jwt_secret', // Replace with a secure secret in production!
    { expiresIn: '1h' }
  );
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profile: user.profile
    }
  });
});

export default router;