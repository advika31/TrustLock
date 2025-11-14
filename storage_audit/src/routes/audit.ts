// /src/routes/audit.ts

import express from 'express';
import { appendAudit, readAudit } from '../lib/merkle';
import { SERVICE_TOKENS } from '../config';
import { canonicalize } from '../lib/canonical';

const router = express.Router();

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header('X-Service-Token') || '';
  if (!SERVICE_TOKENS.includes(token)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

router.post('/append', authMiddleware, async (req, res) => {
  const body = req.body;
  const { audit_id, actor, action, payload, prev_hash } = body;
  if (!audit_id || !actor || !action || typeof payload === 'undefined' || typeof prev_hash === 'undefined') {
    return res.status(400).json({ error: 'invalid_request' });
  }
  try {
    const result = await appendAudit({ audit_id, actor, action, payload, prev_hash });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'append_failed' });
  }
});

router.get('/read/:audit_id', authMiddleware, async (req, res) => {
  const id = req.params.audit_id;
  const records = await readAudit(id);
  res.json(records);
});

export default router;
