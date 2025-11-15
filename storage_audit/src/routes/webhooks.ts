// src/routes/webhooks.ts
import express from 'express';
import { Level } from 'level';
import path from 'path';
import fs from 'fs-extra';
import { DATA_DIR, SERVICE_TOKENS } from '../config';

const router = express.Router();
fs.ensureDirSync(DATA_DIR);

const dbPath = path.join(DATA_DIR, 'external_lists_db');
const db = new Level(path.join(DATA_DIR, 'external_lists_db'), { valueEncoding: 'json' });

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header('X-Service-Token') || '';
  if (!SERVICE_TOKENS.includes(token)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// Expected payload: { list: [ { name: 'Name', score: 0.9, source: 'provider' }, ... ] }
router.post('/sanctions', auth, async (req, res) => {
  const body = req.body;
  if (!body || !Array.isArray(body.list)) {
    return res.status(400).json({ error: 'invalid_payload', hint: 'payload must be { "list": [ { name, score, source? }, ... ] }' });
  }

  // Basic item validation (fail fast)
  for (const item of body.list) {
    if (!item || typeof item.name !== 'string' || typeof item.score !== 'number') {
      return res.status(400).json({ error: 'invalid_item', hint: 'each list item must have { name: string, score: number }' });
    }
  }

  try {
    // store as 'sanctions:latest'
    await db.put('sanctions:latest', body.list);
    return res.json({ status: 'ok', count: body.list.length });
  } catch (err: any) {
    // Log full error for debugging (server console)
    console.error('webhook/sanctions store failed:', err && (err.stack || err.message || err));
    // Return helpful error message to caller (debug). Remove or mask in prod.
    const message = err?.message || 'unknown';
    return res.status(500).json({ error: 'store_failed', message });
  }
});

router.get('/sanctions/latest', auth, async (req, res) => {
  try {
    const data = await db.get('sanctions:latest').catch(() => []);
    return res.json({ list: data });
  } catch (err: any) {
    console.error('webhook/sanctions/latest fetch failed:', err && (err.stack || err.message || err));
    if (err?.notFound) return res.json({ list: [] });
    return res.status(500).json({ error: 'fetch_failed', message: err?.message || 'unknown' });
  }
});

export default router;
