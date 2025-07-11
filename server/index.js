import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import bibleRouter from './routes/bible.js';
import authRouter from './routes/auth.js';
import oldTestamentJesusRouter from './routes/oldTestamentJesus.js';
import oldTestamentJesus1Router from './routes/oldTestamentJesus1.js';
import empiresNodesRouter from './routes/empiresNodes.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
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
app.use('/empires-nodes', empiresNodesRouter);
app.use('/auth', authRouter);
app.use('/api/oldtestamentsjesus2', oldTestamentJesusRouter);
app.use('/api/oldtestamentsjesus1', oldTestamentJesus1Router);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 