// src/lib/metadataLevel.ts
import { Level } from 'level';
import path from 'path';
import { DATA_DIR } from '../config'; // use your config file

const dbPath = path.join(DATA_DIR, 'metadata_db');
const db = new Level<string, ObjectMeta>(dbPath, {
  valueEncoding: 'json'
});

const dbOpenPromise: Promise<void> = (async () => {
  try {
    // open() will resolve if DB is ready; if already open it resolves quickly
    // Some level versions open automatically upon creation; calling open() is safe.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof db.open === 'function') {
      await db.open();
    }
  } catch (err) {
    // Log but don't crash the process here; callers will still await dbOpenPromise and see errors if fatal.
    console.warn('leveldb open failed at startup:', err);
    // rethrow so awaiting callers are aware
    throw err;
  }
})();

// metadata shape
export type ObjectMeta = {
  sha256: string;
  storage_path: string;
  size: number;
  original_name?: string;
  created_at: string;
};

export async function putObjectMeta(meta: ObjectMeta) {
  // ensure DB open
  await dbOpenPromise;
  const key = `obj:${meta.sha256}`;
  await db.put(key, meta);
  return meta;
}

export async function getObjectMeta(sha256: string): Promise<ObjectMeta | null> {
  await dbOpenPromise;
  try {
    const v = await db.get(`obj:${sha256}`);
    return v as ObjectMeta;
  } catch (err: any) {
    // level throws an error object with .notFound === true for missing keys
    if (err && err.notFound) return null;
    throw err;
  }
}

// optional helper to list all meta keys (for admin / debugging)
export async function listAllMeta(): Promise<ObjectMeta[]> {
  await dbOpenPromise;
  const out: ObjectMeta[] = [];

  for await (const value of db.values()) {
    out.push(value as ObjectMeta);
  }

  return out;
}
