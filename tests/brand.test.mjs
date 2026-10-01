// node tests/brand.test.mjs — brand kits, logo palettes and the recents trim, all pure.
import assert from 'node:assert/strict';
import { newBrand, migrateBrand, brandForFile, brandForKit, brandFromKit, paletteFrom, textStyleFrom, ago, DEFAULT_BRAND } from '../src/brand.js';
import { dominantColors, kitsFromColors, kitsFromPixels, ensureContrast, hsl } from '../src/palette.js';
import { beyond, RECENTS_MAX } from '../src/store.js';
import { contrast, makeTheme } from '../src/presets.js';

/* ---------- brands ---------- */
const b = newBrand({ name: 'Northwind' });
assert.equal(b.name, 'Northwind');
assert.deepEqual([b.bg, b.ink, b.accent, b.accent2, b.heading, b.body], [DEFAULT_BRAND.bg, DEFAULT_BRAND.ink, DEFAULT_BRAND.accent, DEFAULT_BRAND.accent2, DEFAULT_BRAND.heading, DEFAULT_BRAND.body]);
assert.ok(b.id && b.assets && Array.isArray(b.palettes) && Array.isArray(b.textStyles));
assert.notEqual(newBrand().id, newBrand().id, 'ids are unique');

// The v1 localStorage kit (no assets, logo id pointing nowhere) migrates cleanly.
const old = migrateBrand({ bg: '#000000', ink: '#FFFFFF', accent: '#FF0000', accent2: '#00FF00', heading: 'Anton', body: 'Work Sans', logo: 'a123' });
assert.equal(old.bg, '#000000'); assert.equal(old.logo, null, 'a logo without bytes is dropped'); assert.equal(old.name, 'My brand');
assert.deepEqual(migrateBrand(null).palettes, []);

// Design files carry the brand's values but never its asset bytes.
const withAssets = newBrand({ name: 'K', logo: 'a1', assets: { a1: { src: 'data:image/png;base64,AAAA', name: 'logo.png', w: 10, h: 10, alpha: true }, a2: { src: 'data:image/png;base64,BBBB', name: 'photo.png', w: 20, h: 20 } }, palettes: [paletteFrom({ bg: '#111111', ink: '#EEEEEE', accent: '#FF8800', accent2: '#0088FF' }, 'Night')] });
const forFile = brandForFile(withAssets);
assert.equal(forFile.logo, 'a1'); assert.ok(!('assets' in forFile) && !('palettes' in forFile));

// Brand kit round trip: brand.json has no bytes; rebuilt with the unpacked assets it is whole again.
const kit = brandForKit(withAssets);
assert.equal(kit.assets.a1.src, undefined); assert.equal(kit.assets.a1.name, 'logo.png'); assert.equal(kit.palettes[0].name, 'Night');
const back = brandFromKit(JSON.parse(JSON.stringify(kit)), { a1: { src: 'data:image/png;base64,AAAA', alpha: true }, a2: { src: 'data:image/png;base64,BBBB' } });
assert.equal(back.assets.a1.src, 'data:image/png;base64,AAAA'); assert.equal(back.assets.a1.name, 'logo.png'); assert.equal(back.logo, 'a1'); assert.equal(back.palettes[0].accent, '#FF8800');
// A kit whose logo bytes are missing does not point at nothing.
assert.equal(brandFromKit(kit, { a2: { src: 'x' } }).logo, null);

// Text styles: theme colours become roles, offsets become fractions of the size.
const theme = makeTheme({ id: 'x', name: 'x', bg: '#FFFFFF', ink: '#111111', accent: '#1F7D62', accent2: '#2F6F73' });
const el = { type: 'text', font: 'Anton', size: 80, weight: 400, upper: true, ls: .02, color: '#1F7D62', outline: '#111111', outlineW: 4, outlineFill: true, shadow: { x: 8, y: 8, blur: 0, color: '#111111', long: true } };
const ts = textStyleFrom(el, theme, 'Poster');
assert.equal(ts.color, 'accent'); assert.equal(ts.outline, 'ink'); assert.equal(ts.shadow.color, 'ink'); assert.ok(ts.shadow.long);
assert.equal(ts.shadow.x, .1); assert.equal(ts.outlineW, 2); assert.ok(ts.custom);
assert.equal(textStyleFrom({ ...el, color: '#ABCDEF', shadow: true }, theme).color, '#ABCDEF', 'a colour that is not a role stays literal');
assert.ok(textStyleFrom({ ...el, shadow: true }, theme).softShadow);

// Relative times.
const now = Date.parse('2026-10-01T12:00:00Z');
assert.equal(ago(now - 20e3, now), 'just now'); assert.equal(ago(now - 5 * 60e3, now), '5 min ago'); assert.equal(ago(now - 3 * 3600e3, now), '3 h ago');
assert.equal(ago(now - 30 * 3600e3, now), 'yesterday'); assert.equal(ago(now - 3 * 86400e3, now), '3 days ago'); assert.equal(ago(now - 15 * 86400e3, now), '2 wk ago');

/* ---------- recents trim ---------- */
const metas = Array.from({ length: 105 }, (_, i) => ({ id: 'd' + i, updated: 1000 + i }));
const drop = beyond(metas);
assert.equal(RECENTS_MAX, 100); assert.equal(drop.length, 5);
assert.deepEqual(drop.sort(), ['d0', 'd1', 'd2', 'd3', 'd4'].sort(), 'the five oldest go');
assert.deepEqual(beyond(metas.slice(0, 50)), []);

/* ---------- palettes from a logo ---------- */
// A synthetic logo: 60% white, 25% navy, 10% orange, 5% teal.
const px = [];
const put = (rgb, n) => { for (let i = 0; i < n; i++) px.push(rgb[0], rgb[1], rgb[2], 255); };
put([255, 255, 255], 600); put([20, 40, 120], 250); put([255, 120, 20], 100); put([20, 160, 150], 50);
for (let i = 0; i < 40; i++) px.push(0, 0, 0, 0); // transparent padding is ignored
const data = new Uint8ClampedArray(px);
const cols = dominantColors(data);
assert.ok(cols.length >= 3 && cols.length <= 6, `found ${cols.length} colours`);
assert.equal(cols[0].hex, '#FFFFFF', 'white dominates'); assert.ok(Math.abs(cols[0].pop - .6) < .02);
assert.ok(cols.some(c => c.hex === '#142878'), 'navy found exactly'); assert.ok(cols.some(c => c.hex === '#FF7814'), 'orange found exactly');

const kits = kitsFromColors(cols);
assert.ok(kits.length >= 5, `offers several kits (${kits.length})`);
assert.equal(new Set(kits.map(k => k.id)).size, kits.length, 'kit ids are unique');
for (const k of kits) {
  assert.ok(contrast(k.bg, k.ink) >= 4.5, `${k.name}: text reads on background (${contrast(k.bg, k.ink).toFixed(2)})`);
  assert.ok(contrast(k.bg, k.accent) >= 2.2, `${k.name}: primary visible on background`);
  assert.ok(contrast(k.bg, k.accent2) >= 2, `${k.name}: secondary visible on background`);
  assert.notEqual(k.accent, k.accent2, `${k.name}: two distinct accents`);
  for (const c of [k.bg, k.ink, k.accent, k.accent2]) assert.match(c, /^#[0-9A-F]{6}$/);
}
// The first kit keeps the logo's colours: navy leads (most of the vivid pixels), orange is the second accent.
assert.equal(kits[0].id, 'logo'); assert.equal(kits[0].accent, '#142878'); assert.equal(kits[0].accent2, '#FF7814');
assert.ok(hsl(kits[0].bg)[2] > .9, 'logo kit sits on a light page');
assert.ok(hsl(kits.find(k => k.id === 'dark').bg)[2] < .2, 'the dark kit sits on a dark page');
assert.deepEqual(kitsFromPixels(data).map(k => k.id), kits.map(k => k.id));
// A single-colour logo still yields usable kits, with a synthesised secondary.
const mono = []; for (let i = 0; i < 100; i++) mono.push(200, 30, 60, 255);
const mk = kitsFromColors(dominantColors(new Uint8ClampedArray(mono)));
assert.ok(mk.length >= 4); for (const k of mk) assert.ok(contrast(k.bg, k.ink) >= 4.5);
// Nothing opaque, nothing offered.
assert.deepEqual(kitsFromPixels(new Uint8ClampedArray([0, 0, 0, 0])), []);
assert.ok(contrast(ensureContrast('#777777', '#808080'), '#808080') >= 4.5);

console.log('brand: ok');
