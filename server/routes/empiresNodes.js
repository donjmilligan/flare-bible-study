import express from 'express';
import { getEmpiresNodes } from '../controllers/empiresNodesController.js';

const router = express.Router();

router.get('/', getEmpiresNodes);

export default router; 