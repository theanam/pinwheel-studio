// App icons for the brand mark (spec §10). Geometry comes from src/lib/mark-path.js;
// this rasterises it without a browser so `npm run icons` needs no extra tooling.
// Emits the SVG favicon plus the PNG sizes the install prompt needs.
import fs from 'fs';
import zlib from 'zlib';

import { SAIL, SAIL_COLORS, PIN, ACCENT, INK, CREAM, markInner } from '../src/lib/mark-path.js';

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const RGB = { [ACCENT]: hex(ACCENT), [INK]: hex(INK), [CREAM]: hex(CREAM) };

/* ---------- geometry (100-unit box, same as the SVG) ---------- */
const V = [50 + SAIL.gap, 50 - SAIL.gap];
const T = [50 + SAIL.gap, SAIL.edge];
const K = [100 - SAIL.edge, SAIL.edge];
// The arc from K to V is part of a circle of radius `bulge` whose centre sits on the
// far side of the chord from the bulge (the bulge points toward bottom-right).
const mid = [(K[0] + V[0]) / 2, (K[1] + V[1]) / 2];
const half = Math.hypot(V[0] - K[0], V[1] - K[1]) / 2;
const toCentre = Math.sqrt(SAIL.bulge ** 2 - half ** 2);
const centre = [mid[0] - toCentre / Math.SQRT2, mid[1] - toCentre / Math.SQRT2];
const side = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
const bulgeSign = Math.sign(side(K, V, [mid[0] + 1, mid[1] + 1]));

function inTriangle(p, a, b, c) {
  const s1 = side(a, b, p), s2 = side(b, c, p), s3 = side(c, a, p);
  return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
}
/** Point-in-sail test for the base (top-right) sail. */
function inSail(p) {
  if (inTriangle(p, V, T, K)) return true;
  const inCircle = Math.hypot(p[0] - centre[0], p[1] - centre[1]) <= SAIL.bulge;
  return inCircle && Math.sign(side(K, V, p)) === bulgeSign;
}
/** Which sail (0–3) covers a point, or -1. Rotates the point back into the base frame. */
function sailAt(x, y) {
  for (let i = 0; i < 4; i++) {
    const a = -i * Math.PI / 2, dx = x - 50, dy = y - 50;
    const p = [50 + dx * Math.cos(a) - dy * Math.sin(a), 50 + dx * Math.sin(a) + dy * Math.cos(a)];
    if (inSail(p)) return i;
  }
  return -1;
}

/* ---------- PNG ---------- */
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = buf => {
  let c = -1;
  for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function encodePNG(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x + 0.5, y + 0.5);
      raw[p++] = r; raw[p++] = g; raw[p++] = b; raw[p++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Supersampled pixel function. `maskable` icons keep the mark inside the platform
 * safe zone (an inner circle of 80%) and fill the whole square with the plate.
 */
function markPixel(size, { maskable }) {
  const SS = 4;
  const scale = maskable ? 0.58 : 1;           // mark box as a fraction of the icon
  const off = (1 - scale) / 2 * size;
  const radius = maskable ? 0 : size * 0.22;   // plate corner radius
  return (px, py) => {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const x = px - 0.5 + (sx + 0.5) / SS, y = py - 0.5 + (sy + 0.5) / SS;
      // Plate first: outside its rounded corners the pixel is transparent.
      const cx = Math.min(Math.max(x, radius), size - radius), cy = Math.min(Math.max(y, radius), size - radius);
      if (Math.hypot(x - cx, y - cy) > radius) continue;
      const mx = (x - off) / (size * scale) * 100, my = (y - off) / (size * scale) * 100;
      const d = Math.hypot(mx - 50, my - 50);
      let col;
      if (d <= PIN.hole) col = RGB[CREAM];
      else if (d <= PIN.r) col = RGB[INK];
      else { const s = sailAt(mx, my); col = s < 0 ? RGB[CREAM] : RGB[SAIL_COLORS[s]]; }
      r += col[0]; g += col[1]; b += col[2]; a += 255;
    }
    const n = SS * SS;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n), Math.round(a / n)];
  };
}

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="${CREAM}"/>
  ${markInner()}
</svg>
`);
for (const [name, size, opts] of [
  ['public/icon-192.png', 192, {}],
  ['public/icon-512.png', 512, {}],
  ['public/icon-maskable-512.png', 512, { maskable: true }],
]) {
  fs.writeFileSync(name, encodePNG(size, markPixel(size, opts)));
  console.log(name, fs.statSync(name).size, 'bytes');
}
console.log('public/icon.svg', fs.statSync('public/icon.svg').size, 'bytes');
