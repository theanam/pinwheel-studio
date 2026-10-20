// Pinwheel Studio — reading font files. Pure: no DOM.
//
// An uploaded font, or one copied from the fonts installed on the device, arrives as
// bytes. This module reads what the file says about itself (family, style, weight,
// italic, PostScript name) so that "Inter-Regular.ttf" and "Inter-Bold.ttf" become
// one family with a real bold. It also takes single faces out of a collection
// (.ttc, as macOS ships most system fonts) and unpacks WOFF to plain sfnt. WOFF2 is
// read by its file name, since unpacking it needs Brotli and a table transform.

const tag = (v, o) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
const view = buf => new DataView(buf instanceof ArrayBuffer ? buf : buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

/** What a buffer holds: 'ttf', 'otf', 'ttc', 'woff', 'woff2', or null. */
export function fontKind(buf) {
  if (!buf || buf.byteLength < 12) return null;
  const v = view(buf), t = tag(v, 0);
  if (v.getUint32(0) === 0x00010000 || t === 'true') return 'ttf';
  return { OTTO: 'otf', ttcf: 'ttc', wOFF: 'woff', wOF2: 'woff2' }[t] || null;
}
export const KIND_MIME = { ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2' };

/* ---------- style names ---------- */
const WEIGHTS = [[/\b(thin|hairline)\b/, 100], [/\b(extra|ultra)\s*light\b/, 200], [/\blight\b/, 300], [/\b(semi|demi)\s*bold\b/, 600], [/\b(extra|ultra)\s*bold\b/, 800], [/\b(heavy|black|ultra)\b/, 900], [/\bbold\b/, 700], [/\bmedium\b/, 500]];
/** Weight and italic from a style name such as "Bold Italic", "SemiBold" or "Light Oblique". */
export function styleWeight(style) {
  const s = String(style || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').toLowerCase();
  const w = WEIGHTS.find(([re]) => re.test(s));
  return { weight: w ? w[1] : 400, italic: /\b(italic|oblique|it)\b/.test(s) };
}
const STYLE_WORDS = /^(?:(?:thin|hairline|extra|ultra|semi|demi|light|regular|book|normal|roman|medium|bold|heavy|black|italic|oblique|it)[\s_-]*)+$/i;
/** Family, weight and italic guessed from a file name: "Brand-Sans_BoldItalic.woff2" → Brand Sans, 700, italic. */
export function infoFromFileName(fileName) {
  const base = String(fileName || 'Font').replace(/\.[a-z0-9]+$/i, '').replace(/\[.*?\]/g, '').trim();
  const parts = base.split(/[-_ ]+/).filter(Boolean); let cut = parts.length;
  while (cut > 1 && STYLE_WORDS.test(parts[cut - 1].replace(/([a-z])([A-Z])/g, '$1 $2'))) cut--;
  const style = parts.slice(cut).join(' ').replace(/([a-z])([A-Z])/g, '$1 $2'), family = parts.slice(0, cut).join(' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  return { family: family || 'Font', style: style || 'Regular', ...styleWeight(style) };
}

/* ---------- sfnt tables ---------- */
function tables(v, off) {
  const n = v.getUint16(off + 4), out = {};
  for (let i = 0; i < n; i++) { const r = off + 12 + i * 16; out[tag(v, r)] = { checksum: v.getUint32(r + 4), offset: v.getUint32(r + 8), length: v.getUint32(r + 12) }; }
  return out;
}
const utf16 = (v, o, len) => { let s = ''; for (let i = 0; i + 1 < len; i += 2) s += String.fromCharCode(v.getUint16(o + i)); return s; };
const latin = (v, o, len) => { let s = ''; for (let i = 0; i < len; i++) s += String.fromCharCode(v.getUint8(o + i)); return s; };
/** The name table as nameID → string, preferring Windows English, then any Windows, Unicode, Mac. */
function names(v, t) {
  if (!t.name) return {};
  const base = t.name.offset, count = v.getUint16(base + 2), strings = base + v.getUint16(base + 4), out = {}, rank = {};
  for (let i = 0; i < count; i++) {
    const r = base + 6 + i * 12, plat = v.getUint16(r), enc = v.getUint16(r + 2), lang = v.getUint16(r + 4), id = v.getUint16(r + 6), len = v.getUint16(r + 8), off = strings + v.getUint16(r + 10);
    const score = plat === 3 ? (lang === 0x409 ? 4 : 3) : plat === 0 ? 2 : plat === 1 && enc === 0 ? 1 : 0;
    if (!score || (rank[id] || 0) >= score || off + len > v.byteLength) continue;
    out[id] = (plat === 1 ? latin(v, off, len) : utf16(v, off, len)).replace(/\0/g, '').trim(); rank[id] = score;
  }
  return out;
}
/** The weight axis of a variable font, as [min, max], or null. */
function weightAxis(v, t) {
  if (!t.fvar) return null;
  const b = t.fvar.offset, axesAt = b + v.getUint16(b + 4), n = v.getUint16(b + 8), size = v.getUint16(b + 10);
  for (let i = 0; i < n; i++) { const a = axesAt + i * size; if (tag(v, a) === 'wght') return [Math.round(v.getInt32(a + 4) / 65536), Math.round(v.getInt32(a + 12) / 65536)]; }
  return null;
}

/**
 * What one face in an sfnt says about itself. `offset` is where its table directory
 * starts (0 for a plain file; a collection lists one per face). `weight` is a number,
 * or "min max" for a variable font with a weight axis.
 */
export function faceInfo(buf, offset = 0) {
  const v = view(buf), t = tables(v, offset), n = names(v, t);
  const family = n[16] || n[1] || '', style = n[17] || n[2] || 'Regular', guess = styleWeight(style);
  let weight = guess.weight, italic = guess.italic;
  if (t['OS/2'] && t['OS/2'].length >= 64) {
    const o = t['OS/2'].offset, wc = v.getUint16(o + 4), sel = v.getUint16(o + 62);
    if (wc) weight = Math.max(100, Math.min(900, wc < 10 ? wc * 100 : Math.round(wc / 100) * 100));
    italic = !!(sel & 1) || !!(sel & 0x200) || italic;
  } else if (t.head) italic = !!(v.getUint16(t.head.offset + 44) & 2) || italic;
  const axis = weightAxis(v, t);
  return { family, style, postscript: n[6] || '', full: n[4] || '', weight: axis && axis[0] !== axis[1] ? `${axis[0]} ${axis[1]}` : weight, italic, cff: !!t['CFF '] || !!t.CFF2 };
}

/** Where each face of a collection starts. */
export function collectionOffsets(buf) {
  const v = view(buf); if (tag(v, 0) !== 'ttcf') return [0];
  return Array.from({ length: v.getUint32(8) }, (_, i) => v.getUint32(12 + i * 4));
}

/** Build a standalone sfnt from a table directory and a way to read each table's bytes. */
function writeSfnt(flavor, list) {
  const n = list.length, head = 12 + n * 16; let size = head;
  for (const t of list) size += (t.data.byteLength + 3) & ~3;
  const out = new ArrayBuffer(size), v = new DataView(out), bytes = new Uint8Array(out);
  let pow = 1, lg = 0; while (pow * 2 <= n) { pow *= 2; lg++; }
  v.setUint32(0, flavor); v.setUint16(4, n); v.setUint16(6, pow * 16); v.setUint16(8, lg); v.setUint16(10, n * 16 - pow * 16);
  let at = head;
  [...list].sort((a, b) => (a.tag < b.tag ? -1 : 1)).forEach((t, i) => {
    const r = 12 + i * 16; for (let k = 0; k < 4; k++) v.setUint8(r + k, t.tag.charCodeAt(k));
    v.setUint32(r + 4, t.checksum); v.setUint32(r + 8, at); v.setUint32(r + 12, t.data.byteLength);
    bytes.set(t.data, at); at += (t.data.byteLength + 3) & ~3;
  });
  return out;
}

/** One face of a collection as a file of its own. Tables the faces share are copied into each. */
export function extractFace(buf, offset) {
  const v = view(buf), src = new Uint8Array(v.buffer), t = tables(v, offset);
  return writeSfnt(v.getUint32(offset), Object.entries(t).map(([k, x]) => ({ tag: k, checksum: x.checksum, data: src.subarray(x.offset, x.offset + x.length) })));
}

/** Every face in a file: `[{ ...faceInfo, offset }]`. One entry for a plain font. */
export function facesIn(buf) {
  return collectionOffsets(buf).map(offset => { try { return { ...faceInfo(buf, offset), offset }; } catch (e) { return null; } }).filter(Boolean);
}

/** zlib inflate with the platform's DecompressionStream, for WOFF tables. */
async function inflateZlib(data) {
  const ds = new DecompressionStream('deflate'), w = ds.writable.getWriter(); w.write(data); w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
/** WOFF (version 1) to a plain sfnt. `inflate` decompresses one zlib stream. */
export async function woffToSfnt(buf, inflate = inflateZlib) {
  const v = view(buf), src = new Uint8Array(v.buffer), n = v.getUint16(12), list = [];
  for (let i = 0; i < n; i++) {
    const r = 44 + i * 20, off = v.getUint32(r + 4), comp = v.getUint32(r + 8), orig = v.getUint32(r + 12), raw = src.subarray(off, off + comp);
    list.push({ tag: tag(v, r), checksum: v.getUint32(r + 16), data: comp < orig ? await inflate(raw) : raw });
  }
  return writeSfnt(v.getUint32(4), list);
}

/**
 * The faces worth copying from an installed family: the closest to regular, bold,
 * italic and bold italic. Each face is `{ weight, italic }` plus anything else; a
 * variable face (weight "min max") covers every weight on its own.
 */
export function pickFaces(faces) {
  const num = f => (typeof f.weight === 'number' ? f.weight : 400), varies = f => typeof f.weight === 'string';
  const best = (italic, want, min = 0) => faces.filter(f => !!f.italic === italic && (varies(f) || num(f) >= min))
    .sort((a, b) => (varies(b) - varies(a)) || Math.abs(num(a) - want) - Math.abs(num(b) - want) || num(a) - num(b))[0];
  const out = [best(false, 400), best(false, 700, 600), best(true, 400), best(true, 700, 600)].filter(Boolean);
  return [...new Set(out)];
}
