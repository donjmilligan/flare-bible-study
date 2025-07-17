import { getAllEmpiresNodes } from '../services/empiresNodesService.js';

export const getEmpiresNodes = async (req, res) => {
  try {
    const nodes = await getAllEmpiresNodes();
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 