// node tests/fonts.test.mjs — reading font files: names, weights, collections, WOFF. Pure.
// Builds small fonts in memory, so it runs anywhere; on macOS it also reads a few
// system fonts as a check against real files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';
import { fontKind, faceInfo, facesIn, collectionOffsets, extractFace, woffToSfnt, styleWeight, infoFromFileName, pickFaces } from '../src/fontfile.js';

/* ---------- a tiny sfnt builder ---------- */
const be16 = n => [(n >> 8) & 255, n & 255], be32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const ascii = s => [...s].map(c => c.charCodeAt(0));
function nameTable(names) {
  const recs = [], data = [];
  for (const [id, str] of Object.entries(names)) { const b = [...str].flatMap(c => be16(c.charCodeAt(0))); recs.push([3, 1, 0x409, +id, b.length, data.length]); data.push(...b); }
  return [...be16(0), ...be16(recs.length), ...be16(6 + recs.length * 12), ...recs.flatMap(r => r.flatMap(be16)), ...data];
}
function os2(weight, fsSelection) { const t = new Array(78).fill(0); t.splice(4, 2, ...be16(weight)); t.splice(62, 2, ...be16(fsSelection)); return t; }
function fvar(min, max) { return [...be16(1), ...be16(0), ...be16(16), ...be16(2), ...be16(1), ...be16(20), ...be16(0), ...be16(0), ...ascii('wght'), ...be32(min * 65536), ...be32(400 * 65536), ...be32(max * 65536), ...be16(0), ...be16(256)]; }
function sfnt(tables, flavor = 0x00010000) {
  const tags = Object.keys(tables).sort(); let off = 12 + tags.length * 16; const dir = [], body = [];
  for (const t of tags) { const d = tables[t]; dir.push(...ascii(t), ...be32(0), ...be32(off), ...be32(d.length)); const pad = (4 - (d.length % 4)) % 4; body.push(...d, ...new Array(pad).fill(0)); off += d.length + pad; }
  return new Uint8Array([...be32(flavor), ...be16(tags.length), 0, 0, 0, 0, 0, 0, ...dir, ...body]).buffer;
}
const font = (family, style, weight, italic, extra = {}) => sfnt({ name: nameTable({ 1: family, 2: style, 4: `${family} ${style}`, 6: `${family.replace(/ /g, '')}-${style.replace(/ /g, '')}` }), 'OS/2': os2(weight, italic ? 1 : 0), ...extra });

/* ---------- plain fonts ---------- */
const bold = font('Brand Sans', 'Bold', 700, false);
assert.equal(fontKind(bold), 'ttf');
assert.deepEqual((({ family, style, weight, italic, postscript }) => ({ family, style, weight, italic, postscript }))(faceInfo(bold)), { family: 'Brand Sans', style: 'Bold', weight: 700, italic: false, postscript: 'BrandSans-Bold' });
assert.equal(faceInfo(font('Brand Sans', 'Light Italic', 300, true)).italic, true);
assert.equal(faceInfo(font('Old', 'Bold', 7, false)).weight, 700, 'a 1–9 weight class is read as hundreds');
assert.equal(faceInfo(font('Var', 'Regular', 400, false, { fvar: fvar(100, 900) })).weight, '100 900', 'a variable font covers its weight axis');
// The typographic family (name 16) wins over the legacy one, which splits off weights.
assert.equal(faceInfo(sfnt({ name: nameTable({ 1: 'Brand Sans Semibold', 2: 'Regular', 16: 'Brand Sans', 17: 'Semibold' }), 'OS/2': os2(600, 0) })).family, 'Brand Sans');
assert.equal(fontKind(sfnt({ name: nameTable({ 1: 'X' }) }, 0x4F54544F)), 'otf');
assert.equal(fontKind(new Uint8Array(4).buffer), null);

/* ---------- collections ---------- */
const reg = new Uint8Array(font('Coll', 'Regular', 400, false)), bd = new Uint8Array(font('Coll', 'Bold', 700, false));
// A collection: header, then each face's directory with offsets rebased onto the whole file.
const rebase = (u, by) => { const c = u.slice(); const v = new DataView(c.buffer); const n = v.getUint16(4); for (let i = 0; i < n; i++) v.setUint32(12 + i * 16 + 8, v.getUint32(12 + i * 16 + 8) + by); return c; };
const head = 12 + 8, ttc = new Uint8Array(head + reg.length + bd.length);
ttc.set([...ascii('ttcf'), ...be32(0x00010000), ...be32(2), ...be32(head), ...be32(head + reg.length)]);
ttc.set(rebase(reg, head), head); ttc.set(rebase(bd, head + reg.length), head + reg.length);
assert.equal(fontKind(ttc.buffer), 'ttc');
assert.deepEqual(collectionOffsets(ttc.buffer), [head, head + reg.length]);
assert.deepEqual(facesIn(ttc.buffer).map(f => f.style), ['Regular', 'Bold'], 'every face of a collection is listed');
const one = extractFace(ttc.buffer, head + reg.length);
assert.equal(fontKind(one), 'ttf'); assert.equal(faceInfo(one).style, 'Bold', 'an extracted face stands alone');

/* ---------- WOFF ---------- */
function woff(buf) {
  const v = new DataView(buf), n = v.getUint16(4), src = new Uint8Array(buf), entries = [], data = [];
  let off = 44 + n * 20;
  for (let i = 0; i < n; i++) { const r = 12 + i * 16, o = v.getUint32(r + 8), len = v.getUint32(r + 12), raw = src.subarray(o, o + len), z = deflateSync(raw), use = z.length < len ? z : raw;
    entries.push(...src.subarray(r, r + 4), ...be32(off), ...be32(use.length), ...be32(len), ...be32(0)); const pad = (4 - (use.length % 4)) % 4; data.push(...use, ...new Array(pad).fill(0)); off += use.length + pad; }
  return new Uint8Array([...ascii('wOFF'), ...be32(v.getUint32(0)), ...be32(off), ...be16(n), 0, 0, ...new Array(28).fill(0), ...entries, ...data]).buffer;
}
const w = woff(font('Webby', 'Italic', 400, true));
assert.equal(fontKind(w), 'woff');
const unpacked = await woffToSfnt(w, async d => new Uint8Array(inflateSync(d)));
assert.deepEqual([faceInfo(unpacked).family, faceInfo(unpacked).italic], ['Webby', true], 'WOFF unpacks to a readable sfnt');

/* ---------- names and picks ---------- */
assert.deepEqual(styleWeight('SemiBold Italic'), { weight: 600, italic: true });
assert.deepEqual(styleWeight('Extra Light'), { weight: 200, italic: false });
assert.deepEqual(styleWeight('Black Oblique'), { weight: 900, italic: true });
assert.deepEqual(infoFromFileName('Brand-Sans_BoldItalic.woff2'), { family: 'Brand Sans', style: 'Bold Italic', weight: 700, italic: true });
assert.equal(infoFromFileName('Inter.woff2').family, 'Inter'); assert.equal(infoFromFileName('Inter.woff2').weight, 400);
assert.equal(infoFromFileName('InterVariable[wght].woff2').family, 'Inter Variable');
const faces = [[100, false], [300, false], [400, false], [500, false], [700, false], [900, false], [400, true], [700, true]].map(([weight, italic]) => ({ weight, italic }));
assert.deepEqual(pickFaces(faces).map(f => [f.weight, f.italic]), [[400, false], [700, false], [400, true], [700, true]], 'regular, bold, italic, bold italic');
assert.deepEqual(pickFaces([{ weight: 300, italic: false }, { weight: 600, italic: false }]).map(f => f.weight), [300, 600], 'closest available stand in');
assert.deepEqual(pickFaces([{ weight: 700, italic: false }]).length, 1, 'a lone face is picked once');
assert.deepEqual(pickFaces([{ weight: '100 900', italic: false }, { weight: 700, italic: false }]).map(f => f.weight), ['100 900'], 'a variable face covers bold');

/* ---------- real files, where the system has them ---------- */
const sys = [['/System/Library/Fonts/Supplemental/Arial Bold.ttf', 'Arial', 700, false], ['/System/Library/Fonts/Supplemental/Georgia Italic.ttf', 'Georgia', 400, true]];
for (const [p, family, weight, italic] of sys) if (fs.existsSync(p)) { const f = faceInfo(new Uint8Array(fs.readFileSync(p)).buffer); assert.deepEqual([f.family, f.weight, f.italic], [family, weight, italic], p); }
const helv = '/System/Library/Fonts/Helvetica.ttc';
if (fs.existsSync(helv)) { const b = new Uint8Array(fs.readFileSync(helv)).buffer; const all = facesIn(b); assert.ok(all.length >= 4); const picks = pickFaces(all); assert.equal(picks.length, 4); assert.equal(faceInfo(extractFace(b, picks[1].offset)).weight, 700); }

console.log('fonts: ok');
