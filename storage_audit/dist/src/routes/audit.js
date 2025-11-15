"use strict";
// /src/routes/audit.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const merkle_1 = require("../lib/merkle");
const config_1 = require("../config");
const router = express_1.default.Router();
function authMiddleware(req, res, next) {
    const token = req.header('X-Service-Token') || '';
    if (!config_1.SERVICE_TOKENS.includes(token))
        return res.status(401).json({ error: 'unauthorized' });
    next();
}
router.post('/append', authMiddleware, async (req, res) => {
    const body = req.body;
    const { audit_id, actor, action, payload, prev_hash } = body;
    if (!audit_id || !actor || !action || typeof payload === 'undefined' || typeof prev_hash === 'undefined') {
        return res.status(400).json({ error: 'invalid_request' });
    }
    try {
        const result = await (0, merkle_1.appendAudit)({ audit_id, actor, action, payload, prev_hash });
        return res.json(result);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'append_failed' });
    }
});
router.get('/read/:audit_id', authMiddleware, async (req, res) => {
    const id = req.params.audit_id;
    const records = await (0, merkle_1.readAudit)(id);
    res.json(records);
});
exports.default = router;
