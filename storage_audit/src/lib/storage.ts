// src/lib/storage.ts
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { DATA_DIR } from '../config';
import { MinioStorage } from './minioStorage'; // minio adapter (optional)

export type PutResult = { path: string; size: number; sha256: string };

// LocalStorage implementation
export class LocalStorage {
  baseDir: string;
  constructor(baseDir = DATA_DIR) {
    this.baseDir = baseDir;
    fs.ensureDirSync(this.baseDir);
    fs.ensureDirSync(path.join(this.baseDir, 'objects'));
  }

  async put(buffer: Buffer, originalName?: string): Promise<PutResult> {
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = originalName ? path.extname(originalName) : '';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${(typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36))}_${sha256.slice(0, 8)}${ext}`;
    const relPath = path.join('objects', date, filename);
    const absPath = path.join(this.baseDir, relPath);

    // Idempotent: if file exists by hash, return existing path
    const existing = await this.findByHash(sha256);
    if (existing) {
      const stats = await fs.stat(existing);
      return { path: existing, size: stats.size, sha256 };
    }

    await fs.ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, buffer);
    const stats = await fs.stat(absPath);
    return { path: absPath, size: stats.size, sha256 };
  }

  async get(absPath: string): Promise<Buffer> {
    return fs.readFile(absPath);
  }

  async findByHash(sha256: string): Promise<string | null> {
    const objectsDir = path.join(this.baseDir, 'objects');
    if (!(await fs.pathExists(objectsDir))) return null;
    const dateFolders = await fs.readdir(objectsDir).catch(() => []);
    for (const dateFolder of dateFolders) {
      const folderPath = path.join(objectsDir, dateFolder);
      const files = await fs.readdir(folderPath).catch(() => []);
      for (const f of files) {
        if (f.includes(sha256.slice(0, 8))) {
          return path.join(folderPath, f);
        }
      }
    }
    return null;
  }
}

// factory
const backend = (process.env.STORAGE_BACKEND || 'local').toLowerCase();
export function createStorage() {
  if (backend === 'minio') return new MinioStorage();
  return new LocalStorage();
}
