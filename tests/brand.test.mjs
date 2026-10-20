// node tests/brand.test.mjs — brand kits, logo palettes and the recents trim, all pure.
import assert from 'node:assert/strict';
import { newBrand, migrateBrand, brandForFile, brandForKit, brandFromKit, paletteFrom, textStyleFrom, ago, DEFAULT_BRAND, fontFamilyFrom, allFonts, fontFamilies, faceLabel, faceKey } from '../src/brand.js';
import { dominantColors, kitsFromColors, kitsFromPixels, ensureContrast, hsl } from '../src/palette.js';
import { beyond, RECENTS_MAX } from '../src/store.js';
import { contrast, makeTheme, catalog, build, textByKey, editedText, carryText, descFor } from '../src/presets.js';
import { PATTERNS, PATTERN, patternCSS } from '../src/patterns.js';

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

/* ---------- uploaded fonts ---------- */
assert.equal(fontFamilyFrom('Brand-Sans_Bold.woff2'), 'Brand Sans Bold');
assert.equal(fontFamilyFrom('inter.ttf', ['Inter']), 'Inter 2');
assert.equal(fontFamilyFrom('.ttf'), 'Font'); assert.equal(fontFamilyFrom('weird*name!.otf'), 'Weirdname');
const fb = newBrand({ name: 'F', fonts: { f1: { name: 'Brand Sans.woff2', family: 'Brand Sans', mime: 'font/woff2', src: 'data:font/woff2;base64,AAAA' } } });
assert.ok(fb.fonts && migrateBrand({}).fonts, 'brands carry a fonts map');
const fkit = brandForKit(fb);
assert.equal(fkit.fonts.f1.src, undefined); assert.equal(fkit.fonts.f1.family, 'Brand Sans');
const fback = brandFromKit(JSON.parse(JSON.stringify(fkit)), {}, { f1: { src: 'data:font/woff2;base64,AAAA' } });
assert.equal(fback.fonts.f1.src, 'data:font/woff2;base64,AAAA'); assert.equal(fback.fonts.f1.mime, 'font/woff2');
assert.deepEqual(Object.keys(allFonts([fb, newBrand(), fb])), ['Brand Sans|400|normal'], 'registry lists each face once');
// Faces: several files of one family, each with its weight and style.
const ff = { a: { name: 'B.ttf', family: 'Brand Sans', mime: 'font/ttf', src: 'data:x', weight: 700 }, b: { name: 'I.ttf', family: 'Brand Sans', mime: 'font/ttf', src: 'data:y', style: 'italic' }, c: { name: 'O.ttf', family: 'Other', mime: 'font/ttf', src: 'data:z' } };
assert.deepEqual(Object.keys(allFonts([newBrand({ fonts: ff })])).sort(), ['Brand Sans|400|italic', 'Brand Sans|700|normal', 'Other|400|normal']);
assert.deepEqual(fontFamilies(ff).map(x => [x.family, x.faces.map(([, f]) => faceLabel(f))]), [['Brand Sans', ['Italic', 'Bold']], ['Other', ['Regular']]], 'faces group into families, lightest first');
assert.equal(faceLabel({ weight: '100 900' }), 'Variable'); assert.equal(faceKey({ family: 'X' }), 'X|400|normal');
assert.equal(brandForKit(newBrand({ fonts: ff })).fonts.a.weight, 700, 'a kit keeps each face\'s weight'); assert.equal(brandForKit(newBrand({ fonts: ff })).fonts.b.style, 'italic');
assert.deepEqual(brandFromKit(fkit, {}, {}).fonts, {}, 'a kit missing the font bytes drops the font');

/* ---------- the font catalogue ---------- */
import { parseCatalog, mergeCatalog, filterFonts, nearestWeight, familyURL, previewURL } from '../src/fonts.js';
import { FONTS } from '../src/presets.js';
import { readFileSync } from 'node:fs';
const rows = JSON.parse(readFileSync(new URL('../public/fonts/google-fonts.json', import.meta.url), 'utf8'));
const gcat = parseCatalog(rows);
assert.ok(gcat.length > 1500, `the catalogue holds every Google Font (${gcat.length})`);
assert.ok(gcat.every(f => f.google && ['sans', 'serif', 'display', 'script', 'mono'].includes(f.cat) && f.weights.length), 'every entry is well formed');
assert.ok(gcat.some(f => f.name === 'Roboto Slab') && gcat.some(f => f.name === 'Open Sans') && gcat.some(f => f.name === 'Noto Sans'), 'well-known families are present');
assert.ok(FONTS.every(c => gcat.some(f => f.name === c.name)), 'every curated face is a Google Font too');
const merged = mergeCatalog(rows);
assert.equal(merged[0].name, FONTS[0].name, 'curated faces come first'); assert.ok(merged[0].curated && !merged[0].google);
assert.equal(new Set(merged.map(f => f.name)).size, merged.length, 'no family twice');
assert.equal(parseCatalog([['x', 'Broken', 'sans', []], ['y', 'Odd', 'unknown', [400]]]).map(f => f.cat).join(), 'sans', 'bad rows are dropped and odd categories fall back');
assert.ok(filterFonts(merged, 'robo', 'all').slice(0, 2).every(f => f.name.startsWith('Roboto')) && filterFonts(merged, 'robo', 'all').some(f => f.name === 'Roboto'), 'prefix matches rank first');
assert.ok(filterFonts(merged, 'slab', 'serif').some(f => f.name === 'Roboto Slab') && !filterFonts(merged, 'slab', 'mono').some(f => f.name === 'Roboto Slab'), 'category filter applies');
assert.equal(nearestWeight([300, 500, 800], 700), 800); assert.equal(nearestWeight([400], 700), 400); assert.equal(nearestWeight([600, 800], 700), 800, 'ties go heavier');
const rs = gcat.find(f => f.name === 'Roboto Slab');
assert.equal(familyURL(rs), 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap');
assert.ok(previewURL(rs).includes('text=Roboto%20Slab') && previewURL(rs).includes('wght@400'));
const it = gcat.find(f => f.italic && f.weights.includes(400) && f.weights.includes(700));
assert.ok(familyURL(it).includes('ital,wght@0,400;0,700;1,400;1,700'), 'italic families carry their italics ' + familyURL(it));

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

/* ---------- text carries over between templates ---------- */
const cat = catalog();
const sale = cat.filter(t => t.topic === 'sale' && t.fmt === 'ig-post');
assert.ok(sale.length >= 2, 'several sale layouts for one format');
const a = build(sale[0]), keysA = textByKey(a);
assert.ok(keysA.title, 'the title is keyed'); assert.ok(Object.keys(keysA).length >= 2, 'more than one slot is keyed');
for (const p of a.pages) for (const e of p.els) if (e.type === 'text') assert.ok(e.key === undefined || typeof e.key === 'string');
// Nothing edited → nothing carried; the next template keeps its own copy.
assert.deepEqual(editedText(build(descFor(a)), a), {});
// Edit the title and a second slot, then move to another layout: both land in their slots.
const cur = structuredClone(a); const slot2 = Object.keys(keysA).find(k => k !== 'title');
for (const p of cur.pages) for (const e of p.els) { if (e.key === 'title') e.text = 'My Shop Sale'; if (e.key === slot2) e.text = 'Changed'; }
const edits = editedText(build(descFor(cur)), cur);
assert.deepEqual(edits, { title: 'My Shop Sale', [slot2]: 'Changed' });
const next = build(sale.find(t => t.layout !== sale[0].layout) || sale[1]);
const kept = carryText(next, edits);
assert.ok(kept.includes('title'), 'title carried into the next layout');
assert.ok(next.pages.some(p => p.els.some(e => e.key === 'title' && e.text === 'My Shop Sale')));
// Across topics too: the edited title replaces the podcast title.
const pod = build(cat.find(t => t.topic === 'podcast'));
carryText(pod, edits);
assert.ok(pod.pages[0].els.some(e => e.key === 'title' && e.text === 'My Shop Sale'));
assert.equal(descFor({ tpl: 'nope~x~y~0', theme: {} }), null);

/* ---------- page patterns ---------- */
assert.ok(PATTERNS.length >= 100, `plenty of patterns (${PATTERNS.length})`);
import('../src/patterns.js').then(({ PATTERN_CATS }) => { const cats = new Set(PATTERN_CATS.map(c => c[0])); for (const p of PATTERNS) assert.ok(cats.has(p.cat), p.id + ' has a known category'); });
assert.equal(new Set(PATTERNS.map(p => p.id)).size, PATTERNS.length, 'pattern ids are unique');
for (const p of PATTERNS) {
  const css = patternCSS({ id: p.id, fg: '#AB12CD', alpha: .4, scale: 2 });
  assert.ok(css.image.startsWith('url("data:image/svg+xml;utf8,'), p.id + ' is an SVG data URL');
  const svg = decodeURIComponent(css.image.slice(28, -2));
  assert.ok(svg.includes('fill="#AB12CD"') && svg.includes('opacity="0.4"'), p.id + ' takes the colour and strength');
  assert.equal(css.size, `${p.w * 2}px ${p.h * 2}px`, p.id + ' scales its tile');
  assert.ok(p.w > 0 && p.h > 0 && p.name);
}
assert.equal(patternCSS({ id: 'nope' }), null);
assert.equal(patternCSS({ id: 'dots', scale: 99 }).size, '96px 96px', 'scale is clamped');
// The pattern layouts give their page a pattern in a theme colour, so a palette swap recolours it.
for (const L of ['pattern-card', 'pattern-band', 'pattern-corner', 'pattern-invite']) {
  const t = cat.find(x => x.layout === L); assert.ok(t, L + ' is in the catalogue');
  const b = build(t); const pg = b.pages[0];
  assert.ok(pg.pattern && PATTERN[pg.pattern.id], L + ' has a known pattern');
  assert.ok([b.theme.ink, b.theme.accent, b.theme.accent2].includes(pg.pattern.fg), L + ' colours its pattern from the theme');
  assert.ok(pg.pattern.alpha > 0 && pg.pattern.alpha <= 1 && pg.pattern.scale > 0);
}

console.log('brand: ok');
