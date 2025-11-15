"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/events.ts
const express_1 = __importDefault(require("express"));
const merkle_1 = require("../lib/merkle"); // re-use appendAudit if exists, else import from merkle module used earlier or adjust to appendAudit implementation
const config_1 = require("../config");
const router = express_1.default.Router();
function auth(req, res, next) {
    const token = req.header('X-Service-Token') || '';
    if (!config_1.SERVICE_TOKENS.includes(token))
        return res.status(401).json({ error: 'unauthorized' });
    next();
}
router.post('/', auth, async (req, res) => {
    const { event_type, application_id, payload } = req.body;
    if (!event_type || !application_id)
        return res.status(400).json({ error: 'invalid_event' });
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
                const result = await (0, merkle_1.appendAudit)(auditRecord);
                return res.json({ status: 'flagged', log_hash: result.log_hash });
            }
        }
        return res.json({ status: 'received' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'event_handling_failed' });
    }
});
exports.default = router;
