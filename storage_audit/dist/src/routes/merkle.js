"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/merkle.ts
const express_1 = __importDefault(require("express"));
const merkle_1 = require("../lib/merkle");
const config_1 = require("../config");
const router = express_1.default.Router();
function auth(req, res, next) {
    const token = req.header('X-Service-Token') || '';
    if (!config_1.SERVICE_TOKENS.includes(token))
        return res.status(401).json({ error: 'unauthorized' });
    next();
}
router.post('/snapshot', auth, async (req, res) => {
    try {
        const snap = await (0, merkle_1.createMerkleSnapshot)();
        res.json(snap);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'snapshot_failed' });
    }
});
router.get('/latest', auth, async (req, res) => {
    try {
        const snap = await (0, merkle_1.getLatestSnapshot)();
        res.json(snap || {});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'fetch_failed' });
    }
});
exports.default = router;
