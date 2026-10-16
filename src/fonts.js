// Pinwheel Studio — the font catalogue.
//
// Two tiers. The curated set in presets.js (FONTS) is what templates and type
// pairings use; those stylesheets load at start-up with the weights the layouts
// need. Every other Google Font comes from public/fonts/google-fonts.json (built
// by scripts/update-google-fonts.mjs from the Fontsource catalogue): the pickers
// list them all, previews load per family as they scroll into view, and a family
// loads in full the moment it is chosen. Pure: no DOM.
import { FONTS } from './presets.js';

const KNOWN = new Set(['sans', 'serif', 'display', 'script', 'mono']);
/** Compact rows → entries: `{ name, cat, weights, italic, google: true }`. */
export function parseCatalog(rows) {
  return (Array.isArray(rows) ? rows : []).filter(r => Array.isArray(r) && typeof r[1] === 'string' && Array.isArray(r[3]) && r[3].length)
    .map(([id, name, cat, weights, italic]) => ({ id, name, cat: KNOWN.has(cat) ? cat : 'sans', weights: [...weights].sort((a, b) => a - b), italic: !!italic, google: true }));
}
/** The full list: curated faces first (in their own order), then the rest of Google Fonts A–Z. */
export function mergeCatalog(rows) {
  const have = new Set(FONTS.map(f => f.name));
  return [...FONTS.map(f => ({ ...f, curated: true })), ...parseCatalog(rows).filter(f => !have.has(f.name))];
}
/** Case-insensitive search within a category; names that start with the query rank first. */
export function filterFonts(list, query, cat = 'all') {
  const q = String(query || '').trim().toLowerCase();
  const inCat = list.filter(f => cat === 'all' || f.cat === cat);
  if (!q) return inCat;
  const starts = [], contains = [];
  for (const f of inCat) { const n = f.name.toLowerCase(); if (n.startsWith(q)) starts.push(f); else if (n.includes(q)) contains.push(f); }
  return [...starts, ...contains];
}
/** The available weight closest to `want`, preferring the heavier one on a tie. */
export function nearestWeight(weights, want) {
  if (!weights || !weights.length) return want;
  return weights.reduce((best, w) => (Math.abs(w - want) < Math.abs(best - want) || (Math.abs(w - want) === Math.abs(best - want) && w > best) ? w : best));
}
const fam = name => encodeURIComponent(name).replace(/%20/g, '+');
/** css2 URL carrying a regular and a bold weight (and their italics where the family has them). */
export function familyURL(entry) {
  const ws = [...new Set([nearestWeight(entry.weights, 400), nearestWeight(entry.weights, 700)])].sort((a, b) => a - b);
  const spec = entry.italic ? `ital,wght@${ws.map(w => '0,' + w).join(';')};${ws.map(w => '1,' + w).join(';')}` : `wght@${ws.join(';')}`;
  return `https://fonts.googleapis.com/css2?family=${fam(entry.name)}:${spec}&display=swap`;
}
/** css2 URL with only the glyphs of the family's own name, for a picker preview. */
export function previewURL(entry) {
  return `https://fonts.googleapis.com/css2?family=${fam(entry.name)}:wght@${nearestWeight(entry.weights, 400)}&text=${encodeURIComponent(entry.name)}&display=swap`;
}
