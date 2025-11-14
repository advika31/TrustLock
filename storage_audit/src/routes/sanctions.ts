// /src/routes/sanctions.ts

import express from 'express';
const router = express.Router();

const SAMPLE = [
  { name: 'Alice Example', score: 0.95 },
  { name: 'Bob Suspicious', score: 0.82 }
];

router.get('/check', (req, res) => {
  const name = (req.query.name || '').toString().toLowerCase();
  if (!name) return res.status(400).json({ error: 'name required' });
  for (const item of SAMPLE) {
    if (item.name.toLowerCase().includes(name) || name.includes(item.name.toLowerCase().split(' ')[0])) {
      return res.json({ name: item.name, match: true, score: item.score, source: 'local_stub' });
    }
  }
  return res.json({ name: req.query.name, match: false, score: 0, source: 'local_stub' });
});

export default router;
