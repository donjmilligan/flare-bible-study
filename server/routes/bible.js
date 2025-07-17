import express from 'express';
import { getBibleVerses } from '../controllers/bibleController.js';

const router = express.Router();

router.get('/', getBibleVerses);

export default router; 