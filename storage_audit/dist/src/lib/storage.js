"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
exports.createStorage = createStorage;
// src/lib/storage.ts
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const minioStorage_1 = require("./minioStorage"); // minio adapter (optional)
// LocalStorage implementation
class LocalStorage {
    constructor(baseDir = config_1.DATA_DIR) {
        this.baseDir = baseDir;
        fs_extra_1.default.ensureDirSync(this.baseDir);
        fs_extra_1.default.ensureDirSync(path_1.default.join(this.baseDir, 'objects'));
    }
    async put(buffer, originalName) {
        const sha256 = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
        const ext = originalName ? path_1.default.extname(originalName) : '';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `${(typeof crypto_1.default.randomUUID === 'function' ? crypto_1.default.randomUUID() : Date.now().toString(36))}_${sha256.slice(0, 8)}${ext}`;
        const relPath = path_1.default.join('objects', date, filename);
        const absPath = path_1.default.join(this.baseDir, relPath);
        // Idempotent: if file exists by hash, return existing path
        const existing = await this.findByHash(sha256);
        if (existing) {
            const stats = await fs_extra_1.default.stat(existing);
            return { path: existing, size: stats.size, sha256 };
        }
        await fs_extra_1.default.ensureDir(path_1.default.dirname(absPath));
        await fs_extra_1.default.writeFile(absPath, buffer);
        const stats = await fs_extra_1.default.stat(absPath);
        return { path: absPath, size: stats.size, sha256 };
    }
    async get(absPath) {
        return fs_extra_1.default.readFile(absPath);
    }
    async findByHash(sha256) {
        const objectsDir = path_1.default.join(this.baseDir, 'objects');
        if (!(await fs_extra_1.default.pathExists(objectsDir)))
            return null;
        const dateFolders = await fs_extra_1.default.readdir(objectsDir).catch(() => []);
        for (const dateFolder of dateFolders) {
            const folderPath = path_1.default.join(objectsDir, dateFolder);
            const files = await fs_extra_1.default.readdir(folderPath).catch(() => []);
            for (const f of files) {
                if (f.includes(sha256.slice(0, 8))) {
                    return path_1.default.join(folderPath, f);
                }
            }
        }
        return null;
    }
}
exports.LocalStorage = LocalStorage;
// factory
const backend = (process.env.STORAGE_BACKEND || 'local').toLowerCase();
function createStorage() {
    if (backend === 'minio')
        return new minioStorage_1.MinioStorage();
    return new LocalStorage();
}
