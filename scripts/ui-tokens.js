// UI colour tokens (spec §10) — the single source for the light and dark palettes.
//
// The design prototype uses literal hex values; `dc-to-jsx.mjs` maps each one to a
// token via ALIASES when it generates the view, and `build-tokens.mjs` emits
// src/lib/tokens.css from TOKENS. Document colours (page backgrounds, brand kits,
// swatches) are deliberately not in here — they belong to the user's design.

export const TOKENS = {
  // surfaces
  app:          { light: '#F4F2EE', dark: '#1A1917' },
  panel:        { light: '#FBFAF8', dark: '#22211F' },
  canvas:       { light: '#EAE7E1', dark: '#121211' },
  surface:      { light: '#FFFFFF', dark: '#2A2927' },
  track:        { light: '#F1EEE9', dark: '#2F2D2A' },
  hover:        { light: '#F6F3EE', dark: '#302E2B' },
  'hover-2':    { light: '#DDD9D2', dark: '#3A3733' },
  // lines
  line:         { light: '#E6E1D9', dark: '#35332F' },
  'line-2':     { light: '#E0DBD2', dark: '#3D3B36' },
  'line-soft':  { light: '#EAE6DF', dark: '#2F2D2A' },
  'line-strong':{ light: '#D8D3CA', dark: '#4A4742' },
  // text
  ink:          { light: '#24211D', dark: '#F1EEE8' },
  'text-2':     { light: '#57514A', dark: '#CFC9BF' },
  muted:        { light: '#6E675E', dark: '#A8A196' },
  'muted-2':    { light: '#8A837A', dark: '#8F887D' },
  placeholder:  { light: '#9A9389', dark: '#6E675E' },
  disabled:     { light: '#C9C3B9', dark: '#57534D' },
  // accent — a darker mint. Fills keep 5:1 against white text in both modes; the
  // `-line` and `-deep` variants lift it on dark backgrounds for outlines and links.
  accent:              { light: '#1F7D62', dark: '#1F7D62' },
  'accent-hover':      { light: '#196B54', dark: '#24906F' },
  'accent-deep':       { light: '#16624C', dark: '#5CC4A0' },
  'accent-line':       { light: '#1F7D62', dark: '#5CC4A0' },
  'accent-tint':       { light: '#DDF1E8', dark: '#1E3A30' },
  'accent-tint-hover': { light: '#CBE8DB', dark: '#254A3D' },
  'accent-tint-line':  { light: '#A9D9C4', dark: '#2F6A55' },
};

/** Literal colours in the design prototype → token names. */
export const ALIASES = {
  '#F4F2EE': 'app', '#FBFAF8': 'panel', '#EAE7E1': 'canvas', '#E6E2DB': 'canvas',
  '#FFFFFF': 'surface', '#F1EEE9': 'track', '#F7F5F1': 'track',
  '#F6F3EE': 'hover', '#EFEBE5': 'hover', '#DDD9D2': 'hover-2',
  '#E6E1D9': 'line', '#E0DBD2': 'line-2', '#EAE6DF': 'line-soft', '#EEEAE3': 'line-soft',
  '#D8D3CA': 'line-strong', '#BDB6AB': 'line-strong',
  '#24211D': 'ink', '#57514A': 'text-2', '#6E675E': 'muted', '#8A837A': 'muted-2',
  '#9A9389': 'placeholder', '#C9C3B9': 'disabled',
  // the prototype's coral, retired for mint
  '#E8674A': 'accent', '#D95A3E': 'accent-hover', '#C9523A': 'accent-deep',
  '#FCEAE4': 'accent-tint', '#FADFD6': 'accent-tint-hover', '#F3C9BC': 'accent-tint-line',
};

const HEX = /#[0-9A-Fa-f]{6}\b/g;
/** Replace aliased hex literals in a CSS value or JS source string with var() references. */
export const tokenize = s => s.replace(HEX, m => {
  const t = ALIASES[m.toUpperCase()];
  return t ? `var(--pw-${t})` : m;
});
