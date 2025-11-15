"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/sanctions.ts
const express_1 = __importDefault(require("express"));
const level_1 = require("level");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const router = express_1.default.Router();
const db = new level_1.Level(path_1.default.join(config_1.DATA_DIR, 'external_lists_db'), { valueEncoding: 'json' });
const FALLBACK = [
    { name: 'Alice Example', score: 0.95, source: 'fallback' },
    { name: 'Bob Suspicious', score: 0.82, source: 'fallback' }
];
router.get('/check', async (req, res) => {
    const name = (req.query.name || '').toString().toLowerCase();
    if (!name)
        return res.status(400).json({ error: 'name required' });
    let list = FALLBACK;
    try {
        const latest = await db.get('sanctions:latest').catch(() => null);
        if (latest)
            list = latest; // ✔ now typed as SanctionRecord[]
    }
    catch (e) { }
    for (const item of list) {
        const itemName = item.name.toLowerCase();
        if (itemName.includes(name) || name.includes(itemName.split(' ')[0])) {
            return res.json({
                name: item.name,
                match: true,
                score: item.score,
                source: item.source
            });
        }
    }
    return res.json({
        name: req.query.name,
        match: false,
        score: 0,
        source: 'local_stub'
    });
});
exports.default = router;
