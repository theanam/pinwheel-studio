// Template baselines (spec §6, "Quality rules every layout must pass").
//
// The preset system is pure and DOM-free, so the check runs without a browser: for
// every (format × layout) pair in the catalogue it builds the design, normalises it
// (ids and float noise removed) and compares a hash against the committed baseline.
// A layout edit that changes hundreds of templates shows up as a list of changed
// pairs rather than as a silent regression.
//
//   node scripts/visual-baselines.mjs            check
//   node scripts/visual-baselines.mjs --update   accept the current output
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { catalog, build } from '../src/presets.js';
import { renderEl } from '../src/render.js';

const BASELINE = 'tests/baselines/layouts.json';
const update = process.argv.includes('--update');

/** Element ids are random per build, and floats carry irrelevant noise. */
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) {
      // `key` names the copy field a text came from; it never changes what is drawn.
      if (k === 'id' || k === 'groupId' || k === 'created' || k === 'key') continue;
      out[k] = normalize(value[k]);
    }
    return out;
  }
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  return value;
}

const hash = o => crypto.createHash('sha256').update(JSON.stringify(normalize(o))).digest('hex').slice(0, 16);

// One template per (format, layout) pair — the first, so the pick is stable.
const pairs = new Map();
for (const t of catalog()) {
  const key = `${t.fmt}/${t.layout}`;
  if (!pairs.has(key)) pairs.set(key, t);
}

// A stub createElement: the renderer is a pure function of the model, so running it
// here catches shapes, charts and QR codes that throw on their own element data.
const h = (type, props, ...kids) => ({ type, props, kids: kids.flat().filter(Boolean) });

const current = {};
const renderFailures = [];
const overflows = [];
for (const [key, tpl] of [...pairs].sort(([a], [b]) => a.localeCompare(b))) {
  const doc = build(tpl);
  current[key] = hash(doc);
  // Quality rule: text a layout places stays on the page. Off the bottom it is cut
  // off and cannot be clicked. Rotated text is skipped; its box is not its glyphs.
  for (const page of doc.pages) for (const el of page.els) if (el.type === 'text' && !el.rot && (el.y + el.h > doc.h + 2 || el.y < -2)) overflows.push(`${key} · ${el.name || 'text'} ends ${Math.round(el.y + el.h - doc.h)}px past the page`);
  for (const page of doc.pages) {
    for (const el of page.els) {
      try { renderEl(h, el, {}); }
      catch (err) { renderFailures.push(`${key} · ${el.type} · ${err.message}`); }
    }
  }
}

if (update) {
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n');
  console.log(`Wrote ${Object.keys(current).length} baselines to ${BASELINE}`);
  process.exit(0);
}

if (!fs.existsSync(BASELINE)) {
  console.error(`No baselines at ${BASELINE}. Run: npm run test:visual -- --update`);
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const changed = Object.keys(current).filter(k => baseline[k] && baseline[k] !== current[k]);
const added = Object.keys(current).filter(k => !baseline[k]);
const removed = Object.keys(baseline).filter(k => !current[k]);

for (const f of renderFailures) console.error(`render error: ${f}`);
for (const f of overflows) console.error(`off the page: ${f}`);
for (const k of changed) console.error(`changed:     ${k}`);
for (const k of added) console.log(`new:         ${k}`);
for (const k of removed) console.error(`removed:     ${k}`);

const bad = renderFailures.length + overflows.length + changed.length + removed.length;
console.log(`\n${Object.keys(current).length} format × layout pairs · ${changed.length} changed · ${added.length} new · ${removed.length} removed`);
if (bad) {
  console.error('\nIf these changes are intended, re-run with --update and commit the baselines.');
  process.exit(1);
}
console.log('Baselines match.');
