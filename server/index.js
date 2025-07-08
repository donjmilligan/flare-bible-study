import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import bibleRouter from './routes/bible.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'not connected', error: err.message });
  }
});

app.use('/bible', bibleRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 