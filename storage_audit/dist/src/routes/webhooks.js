"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/webhooks.ts
const express_1 = __importDefault(require("express"));
const level_1 = require("level");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = require("../config");
const router = express_1.default.Router();
fs_extra_1.default.ensureDirSync(config_1.DATA_DIR);
const dbPath = path_1.default.join(config_1.DATA_DIR, 'external_lists_db');
const db = new level_1.Level(path_1.default.join(config_1.DATA_DIR, 'external_lists_db'), { valueEncoding: 'json' });
function auth(req, res, next) {
    const token = req.header('X-Service-Token') || '';
    if (!config_1.SERVICE_TOKENS.includes(token))
        return res.status(401).json({ error: 'unauthorized' });
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
    }
    catch (err) {
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
    }
    catch (err) {
        console.error('webhook/sanctions/latest fetch failed:', err && (err.stack || err.message || err));
        if (err?.notFound)
            return res.json({ list: [] });
        return res.status(500).json({ error: 'fetch_failed', message: err?.message || 'unknown' });
    }
});
exports.default = router;
