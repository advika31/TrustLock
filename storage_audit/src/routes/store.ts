// src/routes/store.ts
import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { createStorage } from '../lib/storage';
import { SERVICE_TOKENS, MAX_UPLOAD_MB } from '../config';
import { putObjectMeta, getObjectMeta } from '../lib/metadataLevel';

const upload = multer({ limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 } });
const storage = createStorage();

const router = express.Router();

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header('X-Service-Token') || '';
  if (!SERVICE_TOKENS.includes(token)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file && !req.body.file_base64) return res.status(400).json({ error: 'file required' });

    let buffer: Buffer;
    let originalName: string | undefined;

    if (req.file) {
      buffer = req.file.buffer;
      originalName = req.file.originalname;
    } else {
      buffer = Buffer.from(req.body.file_base64, 'base64');
      originalName = req.body.filename || undefined;
    }

    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // check metadata store first (idempotency)
    const existingMeta = await getObjectMeta(sha256);
    if (existingMeta) {
      return res.json({ storage_path: existingMeta.storage_path, hash: `sha256:${sha256}`, size: existingMeta.size });
    }

    const result = await storage.put(buffer, originalName);

    // then persist metadata
    await putObjectMeta({
      sha256: result.sha256,
      storage_path: result.path,
      size: result.size,
      original_name: originalName,
      created_at: new Date().toISOString()
    });

    return res.json({ storage_path: result.path, hash: `sha256:${result.sha256}`, size: result.size });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'upload_failed' });
  }
});

export default router;
