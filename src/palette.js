// Pinwheel Studio — brand colours from a logo.
//
// Pure and DOM-free: takes the RGBA bytes of a small (≈48 px) copy of the logo,
// finds the colours that dominate it and turns them into several candidate brand
// kits (background, text, primary, secondary) for the user to choose between. The
// kits are contrast-checked the same way the preset palettes are, so whichever one
// is picked produces readable templates.
import { mix, contrast } from './presets.js';

/* ---------- colour maths ---------- */
export const hexToRgb = h => { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0); };
export const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l];
}
export function hslToRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360 / 360; if (!s) return [l * 255, l * 255, l * 255];
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
export const hsl = hex => rgbToHsl(hexToRgb(hex));
export const fromHsl = (h, s, l) => rgbToHex(hslToRgb([h, Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, l))]));
/** Same hue and saturation at another lightness. */
export const withL = (hex, l) => { const [h, s] = hsl(hex); return fromHsl(h, s, l); };
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** Nudge `fg` lighter or darker until it reads on `bg` at the given ratio. */
export function ensureContrast(fg, bg, ratio = 4.5) {
  if (contrast(fg, bg) >= ratio) return fg;
  const [h, s, l0] = hsl(fg), dark = hsl(bg)[2] > .5;
  for (let i = 1; i <= 20; i++) { const l = dark ? l0 - i * .05 : l0 + i * .05; if (l < 0 || l > 1) break; const c = fromHsl(h, s, l); if (contrast(c, bg) >= ratio) return c; }
  return dark ? '#111111' : '#FFFFFF';
}

/* ---------- dominant colours ---------- */
/**
 * k-means over the opaque pixels. `data` is RGBA bytes (an ImageData.data array).
 * Returns up to `k` colours, most common first, each with its share of the pixels
 * and its HSL so callers can tell neutrals from vivid colours.
 */
export function dominantColors(data, { k = 6, minAlpha = 128 } = {}) {
  const px = [];
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] >= minAlpha) px.push([data[i], data[i + 1], data[i + 2]]);
  if (!px.length) return [];
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  // k-means++ seeding, deterministic: start from the first pixel, then the farthest.
  const cents = [px[0]];
  while (cents.length < Math.min(k, px.length)) { let best = null, bd = -1; for (const p of px) { const d = Math.min(...cents.map(c => d2(p, c))); if (d > bd) { bd = d; best = p; } } if (bd <= 0) break; cents.push(best); }
  let assign = new Array(px.length).fill(0);
  for (let it = 0; it < 10; it++) {
    let moved = false;
    px.forEach((p, i) => { let bi = 0, bd = Infinity; cents.forEach((c, j) => { const d = d2(p, c); if (d < bd) { bd = d; bi = j; } }); if (assign[i] !== bi) { assign[i] = bi; moved = true; } });
    const sums = cents.map(() => [0, 0, 0, 0]); px.forEach((p, i) => { const s = sums[assign[i]]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
    sums.forEach((s, j) => { if (s[3]) cents[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
    if (!moved) break;
  }
  const counts = cents.map(() => 0); assign.forEach(j => counts[j]++);
  let out = cents.map((c, j) => ({ rgb: c, pop: counts[j] / px.length })).filter(c => c.pop > 0);
  // Merge clusters that are visually the same colour.
  out.sort((a, b) => b.pop - a.pop);
  const merged = [];
  for (const c of out) { const near = merged.find(m => d2(m.rgb, c.rgb) < 28 * 28); if (near) near.pop += c.pop; else merged.push({ ...c }); }
  return merged.map(c => { const hex = rgbToHex(c.rgb); const [h, s, l] = rgbToHsl(c.rgb); return { hex, pop: c.pop, h, s, l }; });
}

/* ---------- candidate kits ---------- */
const isNeutral = c => c.s < .14 || c.l > .94 || c.l < .07;
const pick = (colors, test) => colors.find(test) || null;

/**
 * Several brand kits built from a logo's dominant colours. Each kit is
 * `{ id, name, note, bg, ink, accent, accent2 }` with bg/ink at ≥ 4.5:1 and both
 * accents readable on the background. The first kit stays closest to the logo.
 */
export function kitsFromColors(colors) {
  if (!colors.length) return [];
  const vivid = colors.filter(c => !isNeutral(c)).sort((a, b) => (b.pop * (.4 + b.s)) - (a.pop * (.4 + a.s)));
  const neutrals = colors.filter(isNeutral);
  const primary = vivid[0] || [...colors].sort((a, b) => b.pop - a.pop)[0];
  let secondary = pick(vivid.slice(1), c => hueDist(c.h, primary.h) >= 25) || vivid[1] || null;
  if (!secondary) secondary = { hex: fromHsl(primary.h + 150, Math.max(.35, primary.s * .8), .45), h: primary.h + 150, s: .5, l: .45, pop: 0, synthetic: true };
  const darkN = pick([...neutrals].sort((a, b) => a.l - b.l), c => c.l < .3);
  const lightN = pick([...neutrals].sort((a, b) => b.l - a.l), c => c.l > .8);
  const dark = darkN ? darkN.hex : fromHsl(primary.h, Math.min(.5, primary.s), .12);
  const light = lightN ? mix(lightN.hex, '#FFFFFF', .5) : fromHsl(primary.h, Math.min(.35, primary.s), .97);
  const P = primary.hex, S = secondary.hex;
  const kits = [];
  const add = (id, name, note, bg, ink, accent, accent2) => {
    ink = ensureContrast(ink, bg, 4.5); accent = ensureContrast(accent, bg, 2.2); accent2 = ensureContrast(accent2, bg, 2);
    if (accent2.toUpperCase() === accent.toUpperCase()) accent2 = ensureContrast(withL(accent2, hsl(bg)[2] > .5 ? .3 : .75), bg, 2);
    const kit = { id, name, note, bg: bg.toUpperCase(), ink: ink.toUpperCase(), accent: accent.toUpperCase(), accent2: accent2.toUpperCase() };
    if (!kits.some(k => k.bg === kit.bg && k.ink === kit.ink && k.accent === kit.accent && k.accent2 === kit.accent2)) kits.push(kit);
  };
  add('logo', 'Logo colours', 'Your logo on a light page', light, dark, P, S);
  add('bold', 'Bold', 'Primary colour fills the page', P, hsl(P)[2] > .55 ? dark : light, S, hsl(P)[2] > .55 ? dark : light);
  add('dark', 'Dark', 'Light type on a deep ground', fromHsl(primary.h, Math.min(.45, primary.s), .1), fromHsl(primary.h, .15, .95), withL(P, Math.max(.55, primary.l)), withL(S, Math.max(.6, secondary.l)));
  add('soft', 'Soft', 'Pastel tint with deep accents', fromHsl(primary.h, Math.max(.25, primary.s * .6), .91), fromHsl(primary.h, Math.min(.6, primary.s + .1), .18), withL(P, Math.min(.42, primary.l)), withL(S, Math.min(.45, secondary.l)));
  add('mono', 'Minimal', 'Neutral page, one accent', '#FFFFFF', '#1C1B19', P, mix(P, '#1C1B19', .55));
  add('swap', 'Secondary lead', 'Secondary colour takes the lead', light, dark, S, P);
  add('contrast', 'High contrast', 'Dark neutral page, both accents bright', '#17161A', '#F6F3EE', withL(S, Math.max(.6, secondary.l)), withL(P, Math.max(.6, primary.l)));
  return kits;
}

/** Convenience: pixels → kits. `data` is ImageData.data of a small copy of the logo. */
export const kitsFromPixels = (data, opts) => kitsFromColors(dominantColors(data, opts));
