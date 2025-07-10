import pool from '../db.js';

export const getAllEmpiresNodes = async () => {
  const result = await pool.query('SELECT name, size, imports FROM empires_nodes');
  return result.rows;
};

export const createEmpireNode = async (name, size, imports) => {
  const result = await pool.query(
    'INSERT INTO empires_nodes (name, size, imports) VALUES ($1, $2, $3) RETURNING *',
    [name, size, JSON.stringify(imports)]
  );
  return result.rows[0];
};

export const patchEmpireNode = async (name, newName, size, imports) => {
  const result = await pool.query(
    'UPDATE empires_nodes SET name = $1, size = $2, imports = $3 WHERE name = $4 RETURNING *',
    [newName || name, size, JSON.stringify(imports), name]
  );
  return result.rows[0];
};

export const removeEmpireNode = async (name) => {
  await pool.query('DELETE FROM empires_nodes WHERE name = $1', [name]);
}; 