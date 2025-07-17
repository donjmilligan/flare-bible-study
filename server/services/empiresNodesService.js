import pool from '../db.js';

export const getAllEmpiresNodes = async () => {
  const result = await pool.query('SELECT name, size, imports FROM empires_nodes');
  return result.rows;
}; 