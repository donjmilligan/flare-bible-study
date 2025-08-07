const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all versions
router.get("/versions", async (req, res) => {
  const result = await pool.query(
    "SELECT id, version, word_count, char_count FROM bible_versions",
  );
  res.json(result.rows);
});

// GET all sections for a version
router.get("/:version/sections", async (req, res) => {
  const { version } = req.params;
  const versionResult = await pool.query(
    "SELECT id FROM bible_versions WHERE version = $1",
    [version],
  );
  if (versionResult.rows.length === 0)
    return res.status(404).json({ error: "Version not found" });
  const versionId = versionResult.rows[0].id;
  const result = await pool.query(
    "SELECT id, name, word_count, char_count FROM bible_sections WHERE version_id = $1",
    [versionId],
  );
  res.json(result.rows);
});

// GET all books for a version
router.get("/:version/books", async (req, res) => {
  const { version } = req.params;
  const versionResult = await pool.query(
    "SELECT id FROM bible_versions WHERE version = $1",
    [version],
  );
  if (versionResult.rows.length === 0)
    return res.status(404).json({ error: "Version not found" });
  const versionId = versionResult.rows[0].id;
  const result = await pool.query(
    `SELECT b.id, b.name, b.short_name, b.word_count, b.char_count, s.name as section
     FROM bible_books b
     JOIN bible_sections s ON b.section_id = s.id
     WHERE s.version_id = $1`,
    [versionId],
  );
  res.json(result.rows);
});

// GET all chapters for a book (by book id)
router.get("/books/:bookId/chapters", async (req, res) => {
  const { bookId } = req.params;
  const result = await pool.query(
    `SELECT id, name, word_count, char_count, relative_length, verse_count
     FROM bible_chapters WHERE book_id = $1 ORDER BY name`,
    [bookId],
  );
  res.json(result.rows);
});

// GET a specific chapter (by chapter id)
router.get("/chapters/:chapterId", async (req, res) => {
  const { chapterId } = req.params;
  const result = await pool.query(
    `SELECT id, name, word_count, char_count, relative_length, verse_count, book_id
     FROM bible_chapters WHERE id = $1`,
    [chapterId],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Chapter not found" });
  res.json(result.rows[0]);
});
// ... existing code ...

router.get("/crossreferences", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, group_name, description, refs FROM cross_reference",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a specific paradox
router.put("/crossreferences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, group_name, refs } = req.body;

    const result = await pool.query(
      "UPDATE cross_reference SET description = $1, group_name = $2, refs = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
      [description, group_name, JSON.stringify(refs), id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paradox not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new paradox
router.post("/crossreferences", async (req, res) => {
  try {
    const { description, group_name, refs } = req.body;

    const result = await pool.query(
      "INSERT INTO cross_reference (description, group_name, refs) VALUES ($1, $2, $3) RETURNING *",
      [description, group_name, JSON.stringify(refs)],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a specific paradox
router.delete("/crossreferences/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM cross_reference WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paradox not found" });
    }

    res.json({ message: "Paradox deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
