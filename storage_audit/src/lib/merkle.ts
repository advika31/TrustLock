// src/lib/merkle.ts

import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
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

export async function appendAudit(record: Omit<RecordPayload,'timestamp'>) {
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
