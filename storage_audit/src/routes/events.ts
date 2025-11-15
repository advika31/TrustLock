// src/routes/events.ts
import express from 'express';
import { appendAudit } from '../lib/merkle'; // re-use appendAudit if exists, else import from merkle module used earlier or adjust to appendAudit implementation
import { SERVICE_TOKENS } from '../config';

const router = express.Router();

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header('X-Service-Token') || '';
  if (!SERVICE_TOKENS.includes(token)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

router.post('/', auth, async (req, res) => {
  const { event_type, application_id, payload } = req.body;
  if (!event_type || !application_id) return res.status(400).json({ error: 'invalid_event' });

  // Example reaction: if risk_scored and high score -> append audit automatically
  try {
    if (event_type === 'risk_scored' && typeof payload?.risk_score === 'number') {
      if (payload.risk_score >= 70) {
        // create an audit entry for the application high-risk event
        const auditRecord = {
          audit_id: String(application_id),
          actor: 'event_consumer',
          action: 'auto_flag_high_risk',
          payload: { risk_score: payload.risk_score, reason: payload.reason || null },
          prev_hash: payload.prev_audit_hash || ''
        };
        // appendAudit in your existing merkle/append implementation returns log_hash
        const result = await appendAudit(auditRecord as any);
        return res.json({ status: 'flagged', log_hash: result.log_hash });
      }
    }
    return res.json({ status: 'received' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'event_handling_failed' });
  }
});

export default router;
