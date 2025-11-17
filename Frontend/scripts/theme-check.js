#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readThemeCss() {
  const p = path.join(__dirname, '..', 'styles', 'theme.css');
  return fs.readFileSync(p, 'utf8');
}

function parseVars(css) {
  const vars = {};
  // simple regex to capture --name: value;
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(css))) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

function resolveVar(value, vars, depth = 0) {
  if (!value) return value;
  if (depth > 5) return value;
  const varRef = /var\(--([a-z0-9-]+)\)/i;
  const m = value.match(varRef);
  if (m) {
    const v = vars[m[1]];
    if (!v) return value;
    return resolveVar(value.replace(varRef, v), vars, depth + 1);
  }
  return value;
}

function parseColor(v) {
  v = v.trim();
  // hex #rgb or #rrggbb
  if (v.startsWith('#')) {
    const hex = v.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
  }
  // rgb/rgba
  const rgb = v.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(',').map((p) => p.trim());
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    const a = parts[3] !== undefined ? Number(parts[3]) : 1;
    return { r, g, b, a };
  }
  // fallback: if it's a named token or CSS function, we cannot parse.
  return null;
}

function srgbToLinear(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(c1, c2) {
  const L1 = luminance(c1);
  const L2 = luminance(c2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureColor(vars, name) {
  const raw = vars[name];
  if (!raw) return null;
  const resolved = resolveVar(raw, vars);
  const parsed = parseColor(resolved);
  if (!parsed) return null;
  return parsed;
}

function checkPairs(vars) {
  const pairs = [
    { a: '--color-surface', b: '--color-on-surface', min: 4.5 },
    { a: '--color-primary', b: '--on-primary', min: 4.5 },
    { a: '--color-card', b: '--color-on-surface', min: 4.5 },
    { a: '--color-danger', b: '--color-on-surface', min: 4.5 },
  ];

  const results = [];
  for (const p of pairs) {
    const aKey = p.a.replace(/^--/, '');
    const bKey = p.b.replace(/^--/, '');
    const A = ensureColor(vars, aKey);
    const B = ensureColor(vars, bKey);
    if (!A || !B) {
      results.push({ pair: p, ok: false, reason: 'unable to parse color' });
      continue;
    }
    const ratio = contrastRatio(A, B);
    results.push({ pair: p, ok: ratio >= p.min, ratio });
  }
  return results;
}

function main() {
  const css = readThemeCss();
  const vars = parseVars(css);
  const results = checkPairs(vars);
  let failed = 0;
  console.log('Theme contrast check:');
  for (const r of results) {
    const a = r.pair.a;
    const b = r.pair.b;
    if (!r.ok) {
      console.error(
        `✖ ${a} on ${b} — ratio: ${r.ratio ? r.ratio.toFixed(2) : 'n/a'} (required ${r.pair.min})`
      );
      failed++;
    } else {
      console.log(`✔ ${a} on ${b} — ratio: ${r.ratio.toFixed(2)}`);
    }
  }
  if (failed) {
    console.error(`\nContrast check failed for ${failed} pair(s).`);
    process.exit(2);
  }
  console.log('\nAll checked color pairs meet contrast thresholds.');
}

main();
