"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendAudit = appendAudit;
exports.readAudit = readAudit;
exports.collectAllLogHashes = collectAllLogHashes;
exports.createMerkleSnapshot = createMerkleSnapshot;
exports.getLatestSnapshot = getLatestSnapshot;
// src/lib/merkle.ts
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const crypto_1 = __importDefault(require("crypto"));
const merkletreejs_1 = require("merkletreejs");
const canonical_1 = require("./canonical");
const config_1 = require("../config");
async function appendAudit(record) {
    const auditDir = path_1.default.join(config_1.DATA_DIR, 'audit_logs');
    await fs_extra_1.default.ensureDir(auditDir);
    const timestamp = new Date().toISOString();
    const fullRecord = { ...record, timestamp };
    // deterministic serialization
    const canonical = (0, canonical_1.canonicalize)(fullRecord);
    const hash = crypto_1.default.createHash('sha256').update((record.prev_hash || '') + '|' + canonical).digest('hex');
    const log_hash = `sha256:${hash}`;
    const line = JSON.stringify({ ...fullRecord, log_hash }) + '\n';
    const filePath = path_1.default.join(auditDir, `${record.audit_id}.log`);
    await fs_extra_1.default.appendFile(filePath, line, { encoding: 'utf8' });
    return { log_hash, timestamp };
}
async function readAudit(audit_id) {
    const filePath = path_1.default.join(config_1.DATA_DIR, 'audit_logs', `${audit_id}.log`);
    if (!(await fs_extra_1.default.pathExists(filePath)))
        return [];
    const lines = (await fs_extra_1.default.readFile(filePath, 'utf8')).trim().split('\n').filter(Boolean);
    return lines.map(l => JSON.parse(l));
}
// reads all audit log files and collects log_hash entries (hex only, no prefix)
async function collectAllLogHashes() {
    const auditDir = path_1.default.join(config_1.DATA_DIR, 'audit_logs');
    await fs_extra_1.default.ensureDir(auditDir);
    const files = await fs_extra_1.default.readdir(auditDir).catch(() => []);
    const hashes = [];
    for (const f of files) {
        const filePath = path_1.default.join(auditDir, f);
        const content = await fs_extra_1.default.readFile(filePath, 'utf8').catch(() => '');
        if (!content)
            continue;
        const lines = content.trim().split('\n').filter(Boolean);
        for (const l of lines) {
            try {
                const obj = JSON.parse(l);
                if (obj.log_hash) {
                    hashes.push(String(obj.log_hash).replace(/^sha256:/, ''));
                }
            }
            catch (e) {
                // ignore parse errors in logs
            }
        }
    }
    return hashes;
}
async function createMerkleSnapshot() {
    const leavesHex = await collectAllLogHashes();
    if (leavesHex.length === 0) {
        return { root: null, count: 0, timestamp: new Date().toISOString() };
    }
    // build buffer leaves from hex
    const leaves = leavesHex.map(h => Buffer.from(h, 'hex'));
    // merkletreejs expects either leaves as Buffers + a hash function that returns Buffer
    const tree = new merkletreejs_1.MerkleTree(leaves, (data) => {
        return crypto_1.default.createHash('sha256').update(data).digest();
    });
    const rootBuf = tree.getRoot(); // Buffer
    const rootHex = rootBuf.toString('hex');
    const snapshot = {
        root: rootHex,
        count: leaves.length,
        timestamp: new Date().toISOString()
    };
    const snapDir = path_1.default.join(config_1.DATA_DIR, 'merkle_snapshots');
    await fs_extra_1.default.ensureDir(snapDir);
    const filePath = path_1.default.join(snapDir, `${snapshot.timestamp}.json`);
    await fs_extra_1.default.writeJson(filePath, snapshot);
    return snapshot;
}
async function getLatestSnapshot() {
    const snapDir = path_1.default.join(config_1.DATA_DIR, 'merkle_snapshots');
    await fs_extra_1.default.ensureDir(snapDir);
    const files = (await fs_extra_1.default.readdir(snapDir)).filter(Boolean).sort();
    if (!files.length)
        return null;
    const latest = files[files.length - 1];
    return fs_extra_1.default.readJson(path_1.default.join(snapDir, latest));
}
