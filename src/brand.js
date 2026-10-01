// Pinwheel Studio — brand kits.
//
// Pure helpers shared by the editor, the store and the .pinwheel brand-kit format.
// A brand is four colour roles, two fonts, a logo, and everything the user has
// saved against it: images that should always be at hand, colour schemes and text
// styles. Brands live in IndexedDB until the browser's site data is cleared, and
// travel as `.pinwheel` files with `kind: "brand"` in the manifest.

export const DEFAULT_BRAND = { bg: '#FBF7F0', ink: '#1F1B16', accent: '#1F7D62', accent2: '#2F6F73', heading: 'DM Serif Display', body: 'DM Sans', logo: null };
export const BRAND_KEYS = ['bg', 'ink', 'accent', 'accent2', 'heading', 'body', 'logo'];
let _n = 0;
export const bid = (p = 'b') => p + Date.now().toString(36) + (++_n).toString(36) + Math.random().toString(36).slice(2, 6);

/** A fresh brand with every field present. `partial` overrides the defaults. */
export function newBrand(partial = {}) {
  const now = Date.now();
  return { id: bid(), name: 'My brand', created: now, updated: now, ...DEFAULT_BRAND, assets: {}, fonts: {}, palettes: [], textStyles: [], ...partial };
}

/** Fill in whatever an older record (the v1 localStorage kit) is missing. */
export function migrateBrand(b) {
  if (!b || typeof b !== 'object') return newBrand();
  const out = { ...newBrand(), ...b };
  if (!out.assets || typeof out.assets !== 'object') out.assets = {};
  if (!out.fonts || typeof out.fonts !== 'object') out.fonts = {};
  if (!Array.isArray(out.palettes)) out.palettes = [];
  if (!Array.isArray(out.textStyles)) out.textStyles = [];
  if (out.logo && !out.assets[out.logo]) out.logo = null;
  if (!out.name) out.name = 'My brand';
  return out;
}

/** What a design file records about the brand it was made with: no asset bytes. */
export function brandForFile(b) {
  return b ? { id: b.id, name: b.name, bg: b.bg, ink: b.ink, accent: b.accent, accent2: b.accent2, heading: b.heading, body: b.body, logo: b.logo } : undefined;
}

/** The brand's own asset ids: the logo plus every saved image. */
export const brandAssetIds = b => [...new Set([...(b.logo ? [b.logo] : []), ...Object.keys(b.assets || {})])];

/** brand.json inside a brand-kit file: everything except the asset bytes, which
 *  live in assets/ and are indexed by the manifest. */
export function brandForKit(b) {
  const { assets, fonts, ...rest } = b;
  return { ...rest, assets: Object.fromEntries(Object.entries(assets || {}).map(([id, a]) => [id, { name: a.name, w: a.w, h: a.h, alpha: !!a.alpha }])),
    fonts: Object.fromEntries(Object.entries(fonts || {}).map(([id, f]) => [id, { name: f.name, family: f.family, mime: f.mime }])) };
}

/** Rebuild a brand from brand.json and the decoded assets of a kit file. */
export function brandFromKit(json, assets, fonts = {}) {
  const inline = {}, inlineFonts = {};
  for (const [id, meta] of Object.entries(json.assets || {})) if (assets[id]) inline[id] = { ...meta, ...assets[id] };
  for (const [id, meta] of Object.entries(json.fonts || {})) if (fonts[id]) inlineFonts[id] = { ...meta, ...fonts[id] };
  return migrateBrand({ ...json, assets: inline, fonts: inlineFonts });
}

/* ---------- uploaded fonts ---------- */
export const FONT_MIME = { ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2' };
export const FONT_FORMAT = { 'font/ttf': 'truetype', 'font/otf': 'opentype', 'font/woff': 'woff', 'font/woff2': 'woff2' };
/** A CSS family name from a font file name: "Brand-Sans_Bold.woff2" → "Brand Sans Bold",
 *  made unique against the names already in use. */
export function fontFamilyFrom(fileName, taken = []) {
  let base = String(fileName || 'Font').replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/[^\w ]/g, '') || 'Font';
  base = base.replace(/\b\w/g, ch => ch.toUpperCase());
  const used = new Set(taken.map(t => t.toLowerCase())); let name = base, n = 2;
  while (used.has(name.toLowerCase())) name = `${base} ${n++}`;
  return name;
}
/** Every uploaded font across all brands, by family: the editor's font registry. */
export function allFonts(brands) { const out = {}; for (const b of brands) for (const f of Object.values(b.fonts || {})) if (f.family && f.src && !out[f.family]) out[f.family] = f; return out; }

/** A palette entry for the brand's saved colour schemes. */
export const paletteFrom = (t, name) => ({ id: bid('p'), name: name || 'Scheme', bg: t.bg, ink: t.ink, accent: t.accent, accent2: t.accent2 });

/**
 * Capture a text element as a reusable style. Colours that match a theme role are
 * stored as the role so the style re-colours with whatever design it lands in;
 * shadow offsets are stored as fractions of the font size so the style scales.
 */
export function textStyleFrom(el, theme, name) {
  const roles = { ink: theme.ink, bg: theme.bg, accent: theme.accent, accent2: theme.accent2, onAccent: theme.onAccent, muted: theme.muted };
  const role = c => { if (!c) return c; const k = Object.keys(roles).find(r => roles[r] && String(roles[r]).toUpperCase() === String(c).toUpperCase()); return k || c; };
  const sh = typeof el.shadow === 'object' && el.shadow ? { x: (el.shadow.x || 0) / el.size, y: (el.shadow.y || 0) / el.size, blur: (el.shadow.blur || 0) / el.size, color: role(el.shadow.color), ...(el.shadow.long ? { long: true } : {}) } : null;
  const s = { id: bid('t'), name: name || 'Saved style', font: el.font, weight: el.weight, italic: !!el.italic, upper: !!el.upper, ls: el.ls || 0, color: role(el.color), custom: true };
  if (el.bg) s.bg = role(el.bg);
  if (el.outline) { s.outline = role(el.outline); s.outlineW = (el.outlineW || Math.max(1, el.size / 34)) * 40 / el.size; s.outlineFill = !!el.outlineFill; }
  if (sh) s.shadow = sh; else if (el.shadow === true) s.softShadow = true;
  return s;
}

/** Relative time for the recents list. */
export function ago(ts, now = Date.now()) {
  const s = Math.max(0, (now - ts) / 1000);
  if (s < 60) return 'just now';
  const m = s / 60; if (m < 60) return `${Math.floor(m)} min ago`;
  const h = m / 60; if (h < 24) return `${Math.floor(h)} h ago`;
  const d = h / 24; if (d < 7) return d < 2 ? 'yesterday' : `${Math.floor(d)} days ago`;
  const w = d / 7; if (w < 5) return `${Math.floor(w)} wk ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
