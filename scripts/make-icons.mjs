// Brand mark (spec §10): four quarter-circles in coral and ink — a pinwheel built
// from the app's own shape primitives. Emits the SVG favicon plus the PNG sizes the
// install prompt needs. Run with `node scripts/make-icons.mjs`.
import fs from 'fs';
import zlib from 'zlib';

const CORAL = [0xE8, 0x67, 0x4A];
const INK = [0x24, 0x21, 0x1D];
const BG = [0xF4, 0xF2, 0xEE];

function svg() {
  const pad = 3, gap = 2, leaf = 46; // 100-unit viewBox
  const a = pad, b = pad + leaf + gap;
  // `corner` is the fully rounded corner, as in the CSS the design uses:
  // 0 = top-left, 1 = top-right, 2 = bottom-right, 3 = bottom-left. The right angle
  // therefore sits at the opposite corner, which is the one facing the middle.
  const quarter = (x, y, corner, col) => {
    const L = leaf, x1 = x + L, y1 = y + L;
    const d = {
      0: `M${x} ${y1} L${x1} ${y1} L${x1} ${y} A${L} ${L} 0 0 0 ${x} ${y1} Z`,
      1: `M${x} ${y} L${x} ${y1} L${x1} ${y1} A${L} ${L} 0 0 0 ${x} ${y} Z`,
      2: `M${x1} ${y} L${x} ${y} L${x} ${y1} A${L} ${L} 0 0 0 ${x1} ${y} Z`,
      3: `M${x1} ${y1} L${x1} ${y} L${x} ${y} A${L} ${L} 0 0 0 ${x1} ${y1} Z`,
    }[corner];
    return `<path d="${d}" fill="${col}"/>`;
  };
  const coral = '#E8674A', ink = '#24211D';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="#F4F2EE"/>
  ${quarter(a, a, 0, coral)}
  ${quarter(b, a, 1, ink)}
  ${quarter(a, b, 3, ink)}
  ${quarter(b, b, 2, coral)}
</svg>
`;
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
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x + 0.5, y + 0.5);
      raw[p++] = r; raw[p++] = g; raw[p++] = b; raw[p++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Supersampled so the quarter-circle edges stay clean at every size. */
function markPixel(size, { maskable }) {
  const pad = maskable ? size * 0.14 : size * 0.03; // maskable icons keep a safe zone
  const gap = size * 0.02;
  const leaf = (size - 2 * pad - gap) / 2;
  const SS = 3;
  const quads = [
    { col: CORAL, ox: pad, oy: pad, cx: pad + leaf, cy: pad + leaf },
    { col: INK, ox: pad + leaf + gap, oy: pad, cx: pad + leaf + gap, cy: pad + leaf },
    { col: INK, ox: pad, oy: pad + leaf + gap, cx: pad + leaf, cy: pad + leaf + gap },
    { col: CORAL, ox: pad + leaf + gap, oy: pad + leaf + gap, cx: pad + leaf + gap, cy: pad + leaf + gap },
  ];
  const radius = maskable ? 0 : size * 0.22;
  return (px, py) => {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const x = px - 0.5 + (sx + 0.5) / SS;
      const y = py - 0.5 + (sy + 0.5) / SS;
      let col = null;
      for (const q of quads) {
        if (x < q.ox || x > q.ox + leaf || y < q.oy || y > q.oy + leaf) continue;
        const dx = x - q.cx, dy = y - q.cy;
        if (dx * dx + dy * dy <= leaf * leaf) col = q.col;
        break;
      }
      if (!col) {
        // Rounded app-icon plate behind the mark.
        const inR = radius;
        const cx = Math.min(Math.max(x, inR), size - inR);
        const cy = Math.min(Math.max(y, inR), size - inR);
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy <= inR * inR) col = BG; else continue;
      }
      r += col[0]; g += col[1]; b += col[2]; a += 255;
    }
    const n = SS * SS;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n), Math.round(a / n)];
  };
}

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/icon.svg', svg());
for (const [name, size, opts] of [
  ['public/icon-192.png', 192, {}],
  ['public/icon-512.png', 512, {}],
  ['public/icon-maskable-512.png', 512, { maskable: true }],
]) {
  fs.writeFileSync(name, encodePNG(size, markPixel(size, opts)));
  console.log(name, fs.statSync(name).size, 'bytes');
}
console.log('public/icon.svg', fs.statSync('public/icon.svg').size, 'bytes');
