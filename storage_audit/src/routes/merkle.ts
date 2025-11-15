// src/routes/merkle.ts
import express from 'express';
import { createMerkleSnapshot, getLatestSnapshot } from '../lib/merkle';
import { SERVICE_TOKENS } from '../config';
const router = express.Router();

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header('X-Service-Token') || '';
  if (!SERVICE_TOKENS.includes(token)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

router.post('/snapshot', auth, async (req, res) => {
  try {
    const snap = await createMerkleSnapshot();
    res.json(snap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'snapshot_failed' });
  }
});

router.get('/latest', auth, async (req, res) => {
  try {
    const snap = await getLatestSnapshot();
    res.json(snap || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'fetch_failed'});
  }
});

export default router;
