// src/lib/minioStorage.ts
import { Client } from 'minio';
import crypto from 'crypto';
import path from 'path';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
const MINIO_USE_SSL = (process.env.MINIO_USE_SSL || 'false') === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'trustlock-objects';

export type PutResult = { path: string; size: number; sha256: string };

function genId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // fallback: timestamp + random
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export class MinioStorage {
  client: Client;
  bucket: string;

  constructor() {
    this.client = new Client({
      endPoint: MINIO_ENDPOINT,
      port: MINIO_PORT,
      useSSL: MINIO_USE_SSL,
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY,
    });
    this.bucket = MINIO_BUCKET;
  }

  async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) await this.client.makeBucket(this.bucket);
    } catch (err) {
      // propagate error to caller
      throw err;
    }
  }

  async put(buffer: Buffer, originalName?: string): Promise<PutResult> {
    await this.ensureBucket();
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = originalName ? path.extname(originalName) : '';
    const filename = `${genId()}_${sha256.slice(0, 8)}${ext}`;
    const objectName = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${filename}`;

    // upload buffer as object
    await this.client.putObject(this.bucket, objectName, buffer);
    const storagePath = `s3://${this.bucket}/${objectName}`;
    return { path: storagePath, size: buffer.length, sha256 };
  }

  // optional helper: get presigned URL for direct uploads (not used now)
  presignedPut(objectName: string, expirySec = 60 * 5) {
    return this.client.presignedPutObject(this.bucket, objectName, expirySec);
  }
}
