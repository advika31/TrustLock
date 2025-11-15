// src/lib/merkle.ts
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import { MerkleTree } from 'merkletreejs';
import { canonicalize } from './canonical';
import { DATA_DIR } from '../config';

type RecordPayload = {
  audit_id: string;
  actor: string;
  action: string;
  payload: any;
  prev_hash: string;
  timestamp?: string;
};

export async function appendAudit(record: Omit<RecordPayload, 'timestamp'>) {
  const auditDir = path.join(DATA_DIR, 'audit_logs');
  await fs.ensureDir(auditDir);
  const timestamp = new Date().toISOString();
  const fullRecord = { ...record, timestamp };

  // deterministic serialization
  const canonical = canonicalize(fullRecord);
  const hash = crypto.createHash('sha256').update((record.prev_hash || '') + '|' + canonical).digest('hex');
  const log_hash = `sha256:${hash}`;

  const line = JSON.stringify({ ...fullRecord, log_hash }) + '\n';
  const filePath = path.join(auditDir, `${record.audit_id}.log`);
  await fs.appendFile(filePath, line, { encoding: 'utf8' });

  return { log_hash, timestamp };
}

export async function readAudit(audit_id: string) {
  const filePath = path.join(DATA_DIR, 'audit_logs', `${audit_id}.log`);
  if (!(await fs.pathExists(filePath))) return [];
  const lines = (await fs.readFile(filePath, 'utf8')).trim().split('\n').filter(Boolean);
  return lines.map(l => JSON.parse(l));
}

// reads all audit log files and collects log_hash entries (hex only, no prefix)
export async function collectAllLogHashes(): Promise<string[]> {
  const auditDir = path.join(DATA_DIR, 'audit_logs');
  await fs.ensureDir(auditDir);
  const files = await fs.readdir(auditDir).catch(() => []);
  const hashes: string[] = [];
  for (const f of files) {
    const filePath = path.join(auditDir, f);
    const content = await fs.readFile(filePath, 'utf8').catch(() => '');
    if (!content) continue;
    const lines = content.trim().split('\n').filter(Boolean);
    for (const l of lines) {
      try {
        const obj = JSON.parse(l);
        if (obj.log_hash) {
          hashes.push(String(obj.log_hash).replace(/^sha256:/, ''));
        }
      } catch (e) {
        // ignore parse errors in logs
      }
    }
  }
  return hashes;
}

export async function createMerkleSnapshot() {
  const leavesHex = await collectAllLogHashes();
  if (leavesHex.length === 0) {
    return { root: null, count: 0, timestamp: new Date().toISOString() };
  }

  // build buffer leaves from hex
  const leaves = leavesHex.map(h => Buffer.from(h, 'hex'));

  // merkletreejs expects either leaves as Buffers + a hash function that returns Buffer
  const tree = new MerkleTree(leaves, (data: Buffer) => {
    return crypto.createHash('sha256').update(data).digest();
  });

  const rootBuf = tree.getRoot(); // Buffer
  const rootHex = rootBuf.toString('hex');

  const snapshot = {
    root: rootHex,
    count: leaves.length,
    timestamp: new Date().toISOString()
  };
  const snapDir = path.join(DATA_DIR, 'merkle_snapshots');
  await fs.ensureDir(snapDir);
  const filePath = path.join(snapDir, `${snapshot.timestamp}.json`);
  await fs.writeJson(filePath, snapshot);
  return snapshot;
}

export async function getLatestSnapshot() {
  const snapDir = path.join(DATA_DIR, 'merkle_snapshots');
  await fs.ensureDir(snapDir);
  const files = (await fs.readdir(snapDir)).filter(Boolean).sort();
  if (!files.length) return null;
  const latest = files[files.length - 1];
  return fs.readJson(path.join(snapDir, latest));
}
