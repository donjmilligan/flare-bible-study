import { fetchBibleVerses } from '../services/bibleService.js';

export async function getBibleVerses(req, res) {
  const translation = req.query.t || 't_kjv';
  const verseText = req.query.b || 'John 3:16';
  const references = verseText.split(',').map(r => r.trim());

  try {
    const results = await fetchBibleVerses(references, translation);
    res.json({ references, translation, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 