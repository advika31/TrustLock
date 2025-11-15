"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioStorage = void 0;
// src/lib/minioStorage.ts
const minio_1 = require("minio");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
const MINIO_USE_SSL = (process.env.MINIO_USE_SSL || 'false') === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'trustlock-objects';
function genId() {
    if (typeof crypto_1.default.randomUUID === 'function')
        return crypto_1.default.randomUUID();
    // fallback: timestamp + random
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
class MinioStorage {
    constructor() {
        this.client = new minio_1.Client({
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
            if (!exists)
                await this.client.makeBucket(this.bucket);
        }
        catch (err) {
            // propagate error to caller
            throw err;
        }
    }
    async put(buffer, originalName) {
        await this.ensureBucket();
        const sha256 = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
        const ext = originalName ? path_1.default.extname(originalName) : '';
        const filename = `${genId()}_${sha256.slice(0, 8)}${ext}`;
        const objectName = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${filename}`;
        // upload buffer as object
        await this.client.putObject(this.bucket, objectName, buffer);
        const storagePath = `s3://${this.bucket}/${objectName}`;
        return { path: storagePath, size: buffer.length, sha256 };
    }
    // optional helper: get presigned URL for direct uploads (not used now)
    presignedPut(objectName, expirySec = 60 * 5) {
        return this.client.presignedPutObject(this.bucket, objectName, expirySec);
    }
}
exports.MinioStorage = MinioStorage;
