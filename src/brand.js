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
  return { id: bid(), name: 'My brand', created: now, updated: now, ...DEFAULT_BRAND, assets: {}, palettes: [], textStyles: [], ...partial };
}

/** Fill in whatever an older record (the v1 localStorage kit) is missing. */
export function migrateBrand(b) {
  if (!b || typeof b !== 'object') return newBrand();
  const out = { ...newBrand(), ...b };
  if (!out.assets || typeof out.assets !== 'object') out.assets = {};
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
  const { assets, ...rest } = b;
  return { ...rest, assets: Object.fromEntries(Object.entries(assets || {}).map(([id, a]) => [id, { name: a.name, w: a.w, h: a.h, alpha: !!a.alpha }])) };
}

/** Rebuild a brand from brand.json and the decoded assets of a kit file. */
export function brandFromKit(json, assets) {
  const inline = {};
  for (const [id, meta] of Object.entries(json.assets || {})) if (assets[id]) inline[id] = { ...meta, ...assets[id] };
  return migrateBrand({ ...json, assets: inline });
}

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
