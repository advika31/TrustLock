"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/store.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const storage_1 = require("../lib/storage");
const config_1 = require("../config");
const metadataLevel_1 = require("../lib/metadataLevel");
const upload = (0, multer_1.default)({ limits: { fileSize: config_1.MAX_UPLOAD_MB * 1024 * 1024 } });
const storage = (0, storage_1.createStorage)();
const router = express_1.default.Router();
function authMiddleware(req, res, next) {
    const token = req.header('X-Service-Token') || '';
    if (!config_1.SERVICE_TOKENS.includes(token))
        return res.status(401).json({ error: 'unauthorized' });
    next();
}
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file && !req.body.file_base64)
            return res.status(400).json({ error: 'file required' });
        let buffer;
        let originalName;
        if (req.file) {
            buffer = req.file.buffer;
            originalName = req.file.originalname;
        }
        else {
            buffer = Buffer.from(req.body.file_base64, 'base64');
            originalName = req.body.filename || undefined;
        }
        const sha256 = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
        // check metadata store first (idempotency)
        const existingMeta = await (0, metadataLevel_1.getObjectMeta)(sha256);
        if (existingMeta) {
            return res.json({ storage_path: existingMeta.storage_path, hash: `sha256:${sha256}`, size: existingMeta.size });
        }
        const result = await storage.put(buffer, originalName);
        // then persist metadata
        await (0, metadataLevel_1.putObjectMeta)({
            sha256: result.sha256,
            storage_path: result.path,
            size: result.size,
            original_name: originalName,
            created_at: new Date().toISOString()
        });
        return res.json({ storage_path: result.path, hash: `sha256:${result.sha256}`, size: result.size });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'upload_failed' });
    }
});
exports.default = router;
