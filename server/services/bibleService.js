import pool from '../db.js';

// Helper to parse a reference like 'John 3:16' into book, chapter, verse
function parseReference(ref) {
  // Very basic parser, can be improved
  const match = ref.match(/^(.*?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return {
    book: match[1],
    chapter: match[2],
    verse: match[3],
  };
}

export async function fetchBibleVerses(references, translation) {
  const results = [];
  for (const ref of references) {
    const parsed = parseReference(ref);
    if (!parsed) {
      results.push({ reference: ref, error: 'Invalid reference format' });
      continue;
    }
    // Example query, adjust table/column names as needed
    const query = `SELECT * FROM ${translation} WHERE b = (SELECT b FROM key_abbreviations_english WHERE a = $1 OR n = $1 LIMIT 1) AND c = $2 AND v = $3`;
    try {
      const { rows } = await pool.query(query, [parsed.book, parsed.chapter, parsed.verse]);
      results.push({ reference: ref, verses: rows });
    } catch (err) {
      results.push({ reference: ref, error: err.message });
    }
  }
  return results;
} 