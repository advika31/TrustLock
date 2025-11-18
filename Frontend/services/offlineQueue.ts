import { openDB } from 'idb';

const DB_NAME = 'trustlock_offline';
const STORE = 'queue';

export interface OfflineRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: unknown;
  headers?: Record<string, string>;
  createdAt: number;
}

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    },
  });
}

export async function enqueueRequest(request: Omit<OfflineRequest, 'id' | 'createdAt'>) {
  const db = await getDb();
  const entry: OfflineRequest = {
    ...request,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await db.put(STORE, entry);
  return entry;
}

export async function removeRequest(id: string) {
  const db = await getDb();
  await db.delete(STORE, id);
}

export async function listRequests() {
  const db = await getDb();
  return db.getAll(STORE) as Promise<OfflineRequest[]>;
}

export async function clearQueue() {
  const db = await getDb();
  await db.clear(STORE);
}

export async function flushQueue(
  sender: (request: OfflineRequest) => Promise<Response>
): Promise<{ success: number; failed: number }> {
  const queued = await listRequests();
  let success = 0;
  let failed = 0;

  for (const entry of queued) {
    try {
      const response = await sender(entry);
      if (!response.ok) {
        failed += 1;
        continue;
      }
      await removeRequest(entry.id);
      success += 1;
    } catch (error) {
      console.warn('[offline-queue] replay failed', error);
      failed += 1;
    }
  }

  return { success, failed };
}



