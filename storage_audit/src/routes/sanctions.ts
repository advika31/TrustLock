// src/routes/sanctions.ts
import express from 'express';
import { Level } from 'level';
import path from 'path';
import { DATA_DIR } from '../config';

type SanctionRecord = {
  name: string;
  score: number;
  source: string;
};

const router = express.Router();

const db = new Level<string, SanctionRecord[]>(
  path.join(DATA_DIR, 'external_lists_db'),
  { valueEncoding: 'json' }
);

const FALLBACK: SanctionRecord[] = [
  { name: 'Alice Example', score: 0.95, source: 'fallback' },
  { name: 'Bob Suspicious', score: 0.82, source: 'fallback' }
];

function normalizeForCompare(s: string): string {
  if (!s) return '';
  // NFKD normalize then remove diacritics
  const n = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  // replace non-word (keep letters/numbers) with space, collapse spaces
  const cleaned = n.replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.toLowerCase();
}

router.get('/check', async (req, res) => {
  const raw = req.query.name;
  if (!raw) return res.status(400).json({ error: 'name required' });

  const queryRaw = String(raw);
  const nameNormalized = normalizeForCompare(queryRaw);

  try {
    // read stored list; if not present, fall back to FALLBACK
    let list: Array<{ name: string; score?: number; source?: string }> = FALLBACK;
    const latest = await db.get('sanctions:latest').catch(() => null);
    if (latest && Array.isArray(latest)) {
      list = latest;
    } else if (latest && typeof latest === 'object') {
      list = [latest];
    }

    // debug info - helps identify normalization issues (remove or lower verbosity later)
    console.debug('[sanctions.check] queryRaw:', JSON.stringify(queryRaw));
    console.debug('[sanctions.check] nameNormalized:', JSON.stringify(nameNormalized));
    console.debug('[sanctions.check] list length:', list.length);

    for (const item of list) {
      const itemRaw = String(item.name || '');
      const itemNormalized = normalizeForCompare(itemRaw);

      // debug each candidate (comment out later)
      console.debug('[sanctions.check] candidate:', JSON.stringify({ itemRaw, itemNormalized }));

      // 1) exact normalized match
      if (itemNormalized === nameNormalized && itemNormalized !== '') {
        return res.json({ name: queryRaw, match: true, score: item.score ?? 1, source: item.source ?? 'external', matched_item: item });
      }

      // 2) candidate contains query or vice versa
      if (itemNormalized.includes(nameNormalized) || nameNormalized.includes(itemNormalized)) {
        return res.json({ name: queryRaw, match: true, score: item.score ?? 1, source: item.source ?? 'external', matched_item: item });
      }

      // 3) token-based match (first token or any token)
      const itemTokens = itemNormalized.split(' ').filter(Boolean);
      const queryTokens = nameNormalized.split(' ').filter(Boolean);
      if (itemTokens.some(tok => queryTokens.includes(tok)) || queryTokens.some(tok => itemTokens.includes(tok))) {
        return res.json({ name: queryRaw, match: true, score: item.score ?? 1, source: item.source ?? 'external', matched_item: item });
      }
    }

    // no match
    console.debug('[sanctions.check] no match found for', JSON.stringify({ queryRaw, nameNormalized }));
    return res.json({ name: queryRaw, match: false, score: 0, source: 'local_stub' });
  } catch (err) {
    console.error('sanctions.check error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
