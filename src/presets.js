// Pinwheel Studio — preset system.
// Catalog = formats × layouts × topics, each themed with a palette + type pairing.
import { MOTIFS, SCATTER } from './motifs.js';
import { PATTERN } from './patterns.js';

let _n = 0;
export const nid = () => 'e' + (++_n).toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- color ---------- */
const hx = h => { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0); };
const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const lum = h => { const [r, g, b] = hx(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const onColor = (bg, prefs) => prefs.find(c => contrast(bg, c) >= 4.5) || [...prefs, '#FFFFFF', '#111111'].reduce((b, c) => contrast(bg, c) > contrast(bg, b) ? c : b);

/* ---------- fonts ---------- */
export const FONTS = [
  ['Anton', 'Anton', 'display'], ['Bebas Neue', 'Bebas+Neue', 'display'], ['Archivo Black', 'Archivo+Black', 'display'], ['Abril Fatface', 'Abril+Fatface', 'display'],
  ['DM Serif Display', 'DM+Serif+Display:ital@0;1', 'serif'], ['Pacifico', 'Pacifico', 'script'], ['Instrument Serif', 'Instrument+Serif:ital@0;1', 'serif'],
  ['Permanent Marker', 'Permanent+Marker', 'script'], ['Work Sans', 'Work+Sans:ital,wght@0,400;0,600;0,800;1,400', 'sans'],
  ['Karla', 'Karla:ital,wght@0,400;0,700;1,400', 'sans'], ['Playfair Display', 'Playfair+Display:ital,wght@0,400;0,700;0,900;1,400', 'serif'],
  ['Source Sans 3', 'Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400', 'sans'], ['DM Sans', 'DM+Sans:ital,wght@0,400;0,700;1,400', 'sans'],
  ['Archivo', 'Archivo:ital,wght@0,400;0,700;0,900;1,400', 'sans'], ['Space Grotesk', 'Space+Grotesk:wght@400;700', 'sans'],
  ['Syne', 'Syne:wght@400;700;800', 'display'], ['Manrope', 'Manrope:wght@400;700;800', 'sans'],
  ['Cormorant Garamond', 'Cormorant+Garamond:ital,wght@0,400;0,700;1,400', 'serif'], ['Montserrat', 'Montserrat:ital,wght@0,400;0,700;0,900;1,400', 'sans'],
  ['Lato', 'Lato:ital,wght@0,400;0,700;0,900;1,400', 'sans'], ['Oswald', 'Oswald:wght@400;700', 'display'], ['Nunito Sans', 'Nunito+Sans:ital,wght@0,400;0,700;1,400', 'sans'],
  ['Unbounded', 'Unbounded:wght@400;700;900', 'display'], ['Outfit', 'Outfit:wght@400;700', 'sans'],
  ['Libre Caslon Text', 'Libre+Caslon+Text:ital,wght@0,400;0,700;1,400', 'serif'], ['Libre Franklin', 'Libre+Franklin:ital,wght@0,400;0,700;1,400', 'sans'],
  ['Quicksand', 'Quicksand:wght@400;700', 'sans'], ['Instrument Sans', 'Instrument+Sans:ital,wght@0,400;0,700;1,400', 'sans'],
  ['Caveat', 'Caveat:wght@400;700', 'script'], ['Space Mono', 'Space+Mono:ital,wght@0,400;0,700;1,400', 'mono'],
  ['Poppins', 'Poppins:ital,wght@0,400;0,700;0,900;1,400', 'sans'], ['Lora', 'Lora:ital,wght@0,400;0,700;1,400', 'serif'],
  ['Big Shoulders Display', 'Big+Shoulders+Display:wght@400;700;900', 'display'], ['Rubik', 'Rubik:ital,wght@0,400;0,700;0,900;1,400', 'sans'],
  ['Fraunces', 'Fraunces:ital,wght@0,400;0,700;0,900;1,400', 'serif'], ['Inter', 'Inter:wght@400;600;700', 'sans'], ['Alfa Slab One', 'Alfa+Slab+One', 'display'], ['Nunito', 'Nunito:wght@400;700', 'sans'],
  ['Cinzel', 'Cinzel:wght@400;700', 'serif'], ['Raleway', 'Raleway:ital,wght@0,400;0,700;1,400', 'sans'], ['Righteous', 'Righteous', 'display'],
  ['Josefin Sans', 'Josefin+Sans:wght@400;700', 'sans'], ['Lobster', 'Lobster', 'script'], ['Merriweather', 'Merriweather:ital,wght@0,400;0,700;1,400', 'serif'], ['Barlow Condensed', 'Barlow+Condensed:wght@400;700;800', 'display'],
  ['Zilla Slab', 'Zilla+Slab:wght@400;700', 'serif'], ['Comfortaa', 'Comfortaa:wght@400;700', 'sans'], ['Dancing Script', 'Dancing+Script:wght@400;700', 'script'], ['Bricolage Grotesque', 'Bricolage+Grotesque:wght@400;700;800', 'sans']
].map(([name, q, cat]) => ({ name, q, cat }));
// Picker categories, in display order.
export const FONT_CATS = [['all', 'All'], ['display', 'Display'], ['serif', 'Serif'], ['sans', 'Sans'], ['script', 'Script'], ['mono', 'Mono']];
export const fontURL = f => `https://fonts.googleapis.com/css2?family=${f.q}&display=swap`;

/* ---------- palettes ---------- */
export const PALETTES = [
  ['paper', 'Paper & Ink', '#F4EFE6', '#1B1A17', '#E4572E', '#2E86AB', '#FFFFFF'],
  ['midnight', 'Midnight', '#0F1226', '#F3F1EA', '#FFB84D', '#7A83FF', '#1C2140'],
  ['mint', 'Mint Club', '#D6F0E3', '#0E3B2E', '#FF6F59', '#0E3B2E', '#F2FBF6'],
  ['tomato', 'Tomato', '#E8412C', '#FFF4E6', '#1D1D1B', '#FFD166', '#F25A45'],
  ['lavender', 'Lavender', '#E9E3F7', '#2A1E4A', '#7B5CFA', '#F28CB1', '#F7F4FD'],
  ['forest', 'Forest', '#1F3A2E', '#F1E9D2', '#D9A441', '#8FB996', '#2A4A3B'],
  ['citrus', 'Citrus', '#FFE45E', '#1A1A1A', '#FF4F79', '#3A86FF', '#FFF3A8'],
  ['mono', 'Mono', '#FFFFFF', '#111111', '#111111', '#8C8C8C', '#F2F2F2'],
  ['terracotta', 'Terracotta', '#F2E3D5', '#3B2418', '#C8553D', '#588B8B', '#FBF3EA'],
  ['ocean', 'Ocean', '#0B3C5D', '#F5F9FA', '#3FD1C9', '#F2B134', '#124A70'],
  ['blush', 'Blush', '#F8D8D3', '#4A1C24', '#B8336A', '#FFFFFF', '#FDEDEA'],
  ['electric', 'Electric', '#111111', '#FFFFFF', '#C6FF3D', '#FF3DA5', '#1E1E1E'],
  ['sand', 'Sand & Sea', '#EFE6D8', '#1E3D59', '#F5A65B', '#1E3D59', '#F8F3EA'],
  ['plum', 'Plum', '#3D1F3A', '#FCE9DB', '#F58F7C', '#F2C14E', '#4E2A4A'],
  ['sky', 'Sky', '#CFE8FF', '#0A2342', '#FF7B54', '#2CA58D', '#EAF4FF'],
  ['gold', 'Charcoal & Gold', '#1E1E1E', '#F2EDE4', '#C9A227', '#6B6B6B', '#2A2A2A'],
  ['cobalt', 'Cobalt', '#1F3FD1', '#FFFFFF', '#FFD23F', '#FF8FA3', '#3452DB'],
  ['sage', 'Sage', '#E4E8DC', '#2F3A2B', '#8A9A5B', '#D98E5F', '#F1F4EC'],
  ['festive', 'Festive Red', '#7A1F2B', '#FFF3E0', '#E8B04B', '#2F6B3A', '#8C2A37'],
  ['emerald', 'Emerald & Gold', '#0F3D3E', '#F5EFE0', '#D4AF37', '#6BB39A', '#154A4B'],
  ['marigold', 'Marigold', '#FFF1CC', '#4A1E12', '#E4572E', '#F2B134', '#FFF8E6'],
  ['pastel', 'Pastel', '#FFF8E7', '#3D3A4B', '#F28CB1', '#8FD3C7', '#FFFFFF'],
  ['ivory', 'Ivory', '#F6F3EE', '#2B2B2B', '#7A8B7E', '#B8B0A2', '#FFFFFF'],
  ['crimson', 'Crimson & Pine', '#FFF8F0', '#4A1418', '#B3202E', '#2F6B3A', '#FFFFFF'],
  ['eidnight', 'Eid Night', '#0E2A47', '#F7EFD8', '#E1B84B', '#6BB39A', '#173A5E'],
  ['puja', 'Lal Paar', '#FFF7EC', '#7A1F1F', '#D62828', '#F4A300', '#FFFFFF'],
  ['diwali', 'Diwali Night', '#2B1B4E', '#FFF3D6', '#F2B134', '#E4572E', '#3A2766'],
  ['halloween', 'Halloween', '#1B1230', '#FFF4E0', '#F26B1D', '#8E44AD', '#261A40'],
  ['harvest', 'Harvest', '#FBF1E3', '#4A2C17', '#C8552A', '#E0A526', '#FFFFFF'],
  ['babyblue', 'Nursery', '#EAF4FB', '#2C3E50', '#7FB3E0', '#F4B6C2', '#FFFFFF'],
  ['valentine', 'Valentine', '#FFF0F3', '#5A1E2E', '#E63950', '#F7A1B0', '#FFFFFF']
].map(([id, name, bg, ink, accent, accent2, surface]) => ({ id, name, bg, ink, accent, accent2, surface }));
export const THEME_KEYS = ['bg', 'ink', 'accent', 'accent2', 'surface', 'muted', 'onAccent', 'onAccent2', 'hi', 'line', 'tint', 'onSurface'];
export function makeTheme(p) {
  const t = { id: p.id, name: p.name, bg: p.bg, ink: p.ink, accent: p.accent, accent2: p.accent2, surface: p.surface || mix(p.bg, '#FFFFFF', .5) };
  t.muted = mix(p.ink, p.bg, .3); if (contrast(t.muted, p.bg) < 4.5) t.muted = mix(p.ink, p.bg, .16);
  t.onAccent = onColor(p.accent, [p.bg, p.ink]);
  t.onAccent2 = onColor(p.accent2, [p.bg, p.ink]);
  t.hi = contrast(p.accent, p.bg) >= 3 ? p.accent : contrast(p.accent2, p.bg) >= 3 ? p.accent2 : p.ink;
  t.line = mix(p.ink, p.bg, .78); t.tint = mix(p.accent2, p.bg, .55); t.onSurface = onColor(t.surface, [p.ink, p.bg]);
  return t;
}

/* ---------- type pairings ---------- */
// wf = average glyph width (em) of display face; lh = display line-height
export const PAIRINGS = [
  { id: 'impact', name: 'Impact', display: 'Anton', body: 'Work Sans', dw: 400, wf: .46, bwf: .52, upper: true, track: .01, lh: 1.02 },
  { id: 'poster', name: 'Poster', display: 'Bebas Neue', body: 'Karla', dw: 400, wf: .40, bwf: .5, upper: true, track: .02, lh: .95 },
  { id: 'editorial', name: 'Editorial', display: 'Playfair Display', body: 'Source Sans 3', dw: 700, wf: .53, bwf: .48, upper: false, track: -.01, lh: 1.08 },
  { id: 'modern-serif', name: 'Modern Serif', display: 'DM Serif Display', body: 'DM Sans', dw: 400, wf: .5, bwf: .52, upper: false, track: -.01, lh: 1.05 },
  { id: 'heavy', name: 'Heavy', display: 'Archivo Black', body: 'Archivo', dw: 400, wf: .64, bwf: .52, upper: true, track: -.02, lh: 1.0 },
  { id: 'grotesk', name: 'Grotesk', display: 'Space Grotesk', body: 'Space Grotesk', dw: 700, wf: .56, bwf: .54, upper: false, track: -.03, lh: 1.02 },
  { id: 'art', name: 'Art School', display: 'Syne', body: 'Manrope', dw: 800, wf: .62, bwf: .52, upper: false, track: -.02, lh: 1.02 },
  { id: 'luxe', name: 'Luxe', display: 'Cormorant Garamond', body: 'Montserrat', dw: 700, wf: .44, bwf: .56, upper: false, track: 0, lh: 1.0 },
  { id: 'fatface', name: 'Fat Face', display: 'Abril Fatface', body: 'Lato', dw: 400, wf: .55, bwf: .5, upper: false, track: 0, lh: 1.05 },
  { id: 'condensed', name: 'Condensed', display: 'Oswald', body: 'Nunito Sans', dw: 700, wf: .45, bwf: .52, upper: true, track: .01, lh: 1.02 },
  { id: 'round', name: 'Wide Round', display: 'Unbounded', body: 'Outfit', dw: 700, wf: .7, bwf: .5, upper: false, track: -.02, lh: 1.05 },
  { id: 'classic', name: 'Classic', display: 'Libre Caslon Text', body: 'Libre Franklin', dw: 400, wf: .53, bwf: .52, upper: false, track: -.01, lh: 1.1 },
  { id: 'script', name: 'Script', display: 'Pacifico', body: 'Quicksand', dw: 400, wf: .58, bwf: .52, upper: false, track: 0, lh: 1.25 },
  { id: 'instrument', name: 'Instrument', display: 'Instrument Serif', body: 'Instrument Sans', dw: 400, wf: .42, bwf: .5, upper: false, track: -.02, lh: 1.0 },
  { id: 'sports', name: 'Sports', display: 'Big Shoulders Display', body: 'Poppins', dw: 900, wf: .42, bwf: .56, upper: true, track: .01, lh: .92 },
  { id: 'marker', name: 'Marker', display: 'Permanent Marker', body: 'Poppins', dw: 400, wf: .6, bwf: .56, upper: false, track: 0, lh: 1.1 },
  { id: 'geo', name: 'Geometric', display: 'Poppins', body: 'Poppins', dw: 900, wf: .62, bwf: .56, upper: false, track: -.03, lh: 1.02 },
  { id: 'rubik', name: 'Chunky', display: 'Rubik', body: 'Rubik', dw: 900, wf: .6, bwf: .54, upper: false, track: -.02, lh: 1.0 },
  { id: 'bookish', name: 'Bookish', display: 'Lora', body: 'Lato', dw: 700, wf: .52, bwf: .5, upper: false, track: -.01, lh: 1.1 },
  { id: 'fraunces', name: 'Soft Serif', display: 'Fraunces', body: 'Inter', dw: 700, wf: .52, bwf: .5, upper: false, track: -.01, lh: 1.05 },
  { id: 'slab', name: 'Slab', display: 'Alfa Slab One', body: 'Nunito', dw: 400, wf: .6, bwf: .5, upper: false, track: 0, lh: 1.05 },
  { id: 'roman', name: 'Roman', display: 'Cinzel', body: 'Raleway', dw: 700, wf: .62, bwf: .52, upper: true, track: .08, lh: 1.1 },
  { id: 'hand', name: 'Handwritten', display: 'Caveat', body: 'Nunito', dw: 700, wf: .42, bwf: .5, upper: false, track: 0, lh: 1.1 },
  { id: 'retro', name: 'Retro', display: 'Righteous', body: 'Josefin Sans', dw: 400, wf: .56, bwf: .48, upper: true, track: .04, lh: 1 },
  { id: 'diner', name: 'Diner', display: 'Lobster', body: 'Merriweather', dw: 400, wf: .5, bwf: .55, upper: false, track: 0, lh: 1.15 },
  { id: 'barlow', name: 'Barlow', display: 'Barlow Condensed', body: 'Inter', dw: 800, wf: .42, bwf: .5, upper: true, track: .02, lh: .98 },
  { id: 'zilla', name: 'Zilla', display: 'Zilla Slab', body: 'Comfortaa', dw: 700, wf: .5, bwf: .56, upper: false, track: -.01, lh: 1.08 },
  { id: 'dancing', name: 'Dancing', display: 'Dancing Script', body: 'Raleway', dw: 700, wf: .44, bwf: .52, upper: false, track: 0, lh: 1.15 },
  { id: 'bricolage', name: 'Bricolage', display: 'Bricolage Grotesque', body: 'Inter', dw: 800, wf: .55, bwf: .5, upper: false, track: -.03, lh: 1 }
];

/* ---------- formats ---------- */
// kind: t thumbnail · s social · d deck · p print · b banner · c card
export const FORMATS = [
  // Social
  { id: 'yt-thumb', name: 'YouTube Thumbnail', cat: 'YouTube', w: 1280, h: 720, kind: 't' },
  { id: 'ig-post', name: 'Instagram Post', cat: 'Instagram', w: 1080, h: 1080, kind: 's' },
  { id: 'ig-portrait', name: 'Instagram Portrait', cat: 'Instagram', w: 1080, h: 1350, kind: 's' },
  { id: 'ig-story', name: 'Instagram Story', cat: 'Instagram', w: 1080, h: 1920, kind: 's' },
  { id: 'ig-carousel', name: 'Instagram Carousel', cat: 'Instagram', w: 1080, h: 1350, kind: 's', pages: 5, arc: 'carousel' },
  { id: 'tiktok', name: 'TikTok / Reels Cover', cat: 'TikTok', w: 1080, h: 1920, kind: 's' },
  { id: 'fb-post', name: 'Facebook Post', cat: 'Facebook', w: 1200, h: 630, kind: 's' },
  { id: 'li-post', name: 'LinkedIn Post', cat: 'LinkedIn', w: 1200, h: 1200, kind: 's' },
  { id: 'pin', name: 'Pinterest Pin', cat: 'Pinterest', w: 1000, h: 1500, kind: 's' },
  { id: 'x-post', name: 'X Post', cat: 'X', w: 1600, h: 900, kind: 's' },
  { id: 'pres', name: 'Presentation 16:9', cat: 'Presentation', w: 1920, h: 1080, kind: 'd', pages: 6, arc: 'deck' },
  { id: 'a4', name: 'A4 Flyer', cat: 'Flyer', w: 794, h: 1123, kind: 'p' },
  { id: 'ig-reel', name: 'Instagram Reel Cover', cat: 'Instagram', w: 1080, h: 1920, kind: 's' },
  { id: 'li-carousel', name: 'LinkedIn Carousel', cat: 'LinkedIn', w: 1080, h: 1080, kind: 's', pages: 5, arc: 'carousel' },
  { id: 'li-banner', name: 'LinkedIn Banner', cat: 'LinkedIn', w: 1584, h: 396, kind: 'b' },
  { id: 'fb-event', name: 'Facebook Event Cover', cat: 'Facebook', w: 1920, h: 1005, kind: 's' },
  { id: 'fb-cover', name: 'Facebook Cover', cat: 'Facebook', w: 1640, h: 624, kind: 'b' },
  { id: 'x-header', name: 'X Header', cat: 'X', w: 1500, h: 500, kind: 'b' },
  { id: 'yt-shorts', name: 'YouTube Shorts Cover', cat: 'YouTube', w: 1080, h: 1920, kind: 's' },
  // YouTube crops channel art to a 1546×423 strip on desktop; the layout runs inside that.
  { id: 'yt-banner', name: 'YouTube Channel Art', cat: 'YouTube', w: 2560, h: 1440, kind: 'b', safe: [1546, 423] },
  { id: 'twitch-banner', name: 'Twitch Banner', cat: 'Twitch', w: 1200, h: 480, kind: 'b' },
  { id: 'twitch-offline', name: 'Twitch Offline Screen', cat: 'Twitch', w: 1920, h: 1080, kind: 't' },
  { id: 'discord-banner', name: 'Discord Banner', cat: 'Discord', w: 960, h: 540, kind: 's' },
  { id: 'podcast', name: 'Podcast Cover', kw: 'podcast episode audio show interview', cat: 'Podcast', w: 1400, h: 1400, kind: 's' },
  { id: 'album', name: 'Album Cover', cat: 'Music', w: 3000, h: 3000, kind: 's' },
  // Web & marketing
  { id: 'og-image', name: 'Link Preview Image', cat: 'Web', w: 1200, h: 630, kind: 's' },
  { id: 'web-hero', name: 'Website Hero', cat: 'Web', w: 1920, h: 800, kind: 'b' },
  { id: 'email-header', name: 'Email Header', cat: 'Web', w: 1200, h: 400, kind: 'b' },
  { id: 'email-news', name: 'Email Newsletter', cat: 'Web', w: 600, h: 1500, kind: 's' },
  { id: 'infographic', name: 'Infographic', cat: 'Web', w: 800, h: 2000, kind: 'p' },
  { id: 'etsy-banner', name: 'Etsy Shop Banner', cat: 'Ecommerce', w: 1200, h: 300, kind: 'b' },
  { id: 'product-img', name: 'Product Listing Image', cat: 'Ecommerce', w: 2000, h: 2000, kind: 's' },
  { id: 'app-shot', name: 'App Store Screenshot', cat: 'App', w: 1290, h: 2796, kind: 's' },
  // Video & screens
  { id: 'title-card', name: 'Video Title Card', cat: 'Video', w: 1920, h: 1080, kind: 't' },
  { id: 'zoom-bg', name: 'Video Call Background', cat: 'Video', w: 1920, h: 1080, kind: 's' },
  { id: 'wallpaper-phone', name: 'Phone Wallpaper', cat: 'Wallpaper', w: 1170, h: 2532, kind: 's' },
  { id: 'wallpaper-desktop', name: 'Desktop Wallpaper', cat: 'Wallpaper', w: 2560, h: 1440, kind: 's' },
  // Presentations
  { id: 'pitch', name: 'Pitch Deck', cat: 'Presentation', w: 1920, h: 1080, kind: 'd', pages: 8, arc: 'deck' },
  { id: 'pres-43', name: 'Presentation 4:3', cat: 'Presentation', w: 1600, h: 1200, kind: 'd', pages: 5, arc: 'deck' },
  { id: 'pres-mobile', name: 'Mobile Presentation', cat: 'Presentation', w: 1080, h: 1920, kind: 'd', pages: 5, arc: 'deck' },
  // Posters, flyers & signage
  { id: 'poster', name: 'Poster 18×24 in', cat: 'Poster', w: 1728, h: 2304, kind: 'p' },
  { id: 'poster-24x36', name: 'Poster 24×36 in', cat: 'Poster', w: 2304, h: 3456, kind: 'p' },
  { id: 'a3', name: 'A3 Poster', cat: 'Poster', w: 1123, h: 1587, kind: 'p' },
  { id: 'a5', name: 'A5 Flyer', cat: 'Flyer', w: 559, h: 794, kind: 'p' },
  { id: 'letter', name: 'US Letter Flyer', cat: 'Flyer', w: 816, h: 1056, kind: 'p' },
  { id: 'rack-card', name: 'Rack Card 4×9 in', cat: 'Flyer', w: 1200, h: 2700, kind: 'p' },
  { id: 'door-hanger', name: 'Door Hanger 4.25×11 in', cat: 'Flyer', w: 1275, h: 3300, kind: 'p' },
  { id: 'yard-sign', name: 'Yard Sign 24×18 in', cat: 'Signage', w: 2304, h: 1728, kind: 'p' },
  { id: 'banner-sign', name: 'Banner 72×24 in', cat: 'Signage', w: 3456, h: 1152, kind: 'b' },
  // Documents & multi-page print
  { id: 'resume', name: 'Résumé', cat: 'Documents', w: 816, h: 1056, kind: 'p', pages: 2, arc: 'resume', only: ['resume'] },
  { id: 'letterhead', name: 'Letterhead', cat: 'Documents', w: 816, h: 1056, kind: 'p', only: ['letterhead'] },
  { id: 'report', name: 'Report / Proposal', cat: 'Documents', w: 816, h: 1056, kind: 'p', pages: 4, arc: 'report' },
  { id: 'newsletter', name: 'Print Newsletter', cat: 'Documents', w: 816, h: 1056, kind: 'p', pages: 2, arc: 'newsletter' },
  { id: 'booklet', name: 'Booklet A5', cat: 'Brochure', w: 559, h: 794, kind: 'p', pages: 4, arc: 'booklet' },
  { id: 'brochure', name: 'Brochure (Letter)', cat: 'Brochure', w: 816, h: 1056, kind: 'p', pages: 4, arc: 'booklet' },
  { id: 'menu-letter', name: 'Menu (Letter)', cat: 'Menu', w: 816, h: 1056, kind: 'p', pages: 2, arc: 'menu' },
  { id: 'table-tent', name: 'Table Tent 4×6 in', cat: 'Menu', w: 1200, h: 1800, kind: 'p', pages: 2, arc: 'menu' },
  { id: 'photo-book', name: 'Photo Book 8×8 in', cat: 'Photo', w: 2400, h: 2400, kind: 'p', pages: 4, arc: 'photobook' },
  // Cards & small print
  { id: 'postcard', name: 'Postcard 6×4 in', cat: 'Print', w: 1800, h: 1200, kind: 'p' },
  { id: 'certificate', name: 'Certificate A4 Landscape', cat: 'Print', w: 1123, h: 794, kind: 'p' },
  { id: 'gift-cert', name: 'Gift Certificate 7×3.5 in', cat: 'Print', w: 2100, h: 1050, kind: 'p' },
  { id: 'invite', name: 'Invitation 5×7 in', cat: 'Invitation', w: 1050, h: 1470, kind: 'p' },
  { id: 'greeting', name: 'Greeting Card 5×7 in', cat: 'Cards', w: 1500, h: 2100, kind: 'p', pages: 2, arc: 'greeting' },
  { id: 'recipe-card', name: 'Recipe Card 4×6 in', cat: 'Cards', w: 1200, h: 1800, kind: 'p' },
  { id: 'bookmark', name: 'Bookmark 2.5×7 in', cat: 'Cards', w: 750, h: 2100, kind: 'p' },
  { id: 'ticket', name: 'Event Ticket 5×2.5 in', cat: 'Cards', w: 1500, h: 750, kind: 'p' },
  { id: 'name-badge', name: 'Name Badge 4×3 in', cat: 'Cards', w: 1200, h: 900, kind: 'p', only: ['badge', 'label', 'minimal-corner'] },
  { id: 'label', name: 'Product Label 3×3 in', cat: 'Cards', w: 900, h: 900, kind: 'p', only: ['label', 'concentric', 'centered-badge', 'sale-burst', 'minimal-corner', 'framed-poster', 'outline-type'] },
  { id: 'bizcard', name: 'Business Card', cat: 'Business Card', w: 1050, h: 600, kind: 'c', pages: 2 },
  // Publishing
  { id: 'book-cover', name: 'Book Cover 6×9 in', cat: 'Publishing', w: 1800, h: 2700, kind: 'p' },
  { id: 'ebook', name: 'eBook Cover', cat: 'Publishing', w: 1600, h: 2560, kind: 'p' },
  { id: 'magazine-cover', name: 'Magazine Cover 8.5×11 in', cat: 'Publishing', w: 2550, h: 3300, kind: 'p' }
];
export const FORMAT = Object.fromEntries(FORMATS.map(f => [f.id, f]));

/* ---------- topics (copy packs) ---------- */
const TOPICS = [
  { id: 'sale', name: 'Retail sale', kw: 'sale discount promo retail shop offer deal', brand: 'Northfield', kicker: 'This weekend only', title: 'The Big Summer Sale', short: 'Up to 50% off', word: 'Sale', sub: 'Everything in store and online. No code, no catch — just good things for less.', cta: 'Shop the sale', handle: '@northfieldgoods', url: 'northfield.shop', stat: ['50%', 'off everything'], items: ['Free shipping over $50', '30-day easy returns', 'Members shop first', 'New drops daily'], date: ['21', 'Jun', 'June 21 – 23', '10am – 8pm'], place: 'All stores & online', price: '$29', badge: 'Hot deal', quote: 'Best sale of the year, hands down. I stocked up on everything I’d been eyeing.', author: 'Priya Nair', role: 'Customer since 2019', tags: ['Apparel', 'Home', 'Outdoor', 'Gifts'], chart: [['Mon', 18], ['Tue', 26], ['Wed', 35], ['Thu', 50]], vs: ['Full price', 'Sale price'], count: ['3', 'days left'], ep: 'Drop 07', menu: [['Linen shirt', '$29'], ['Canvas tote', '$14'], ['Stoneware mug', '$9'], ['Wool throw', '$48']], person: 'Jordan Blake', job: 'Store Manager', pairs: ['heavy', 'impact', 'round', 'condensed', 'geo', 'rubik', 'slab'], pals: ['tomato', 'citrus', 'electric', 'mono', 'sky', 'cobalt'] },
  { id: 'podcast', name: 'Podcast', kw: 'podcast youtube episode show audio interview', brand: 'Late Signals', kicker: 'New episode', title: 'How Great Ideas Actually Happen', short: 'Ideas are cheap?', word: 'Listen', sub: 'Designer Mara Ellis on patience, taste, and the unglamorous art of shipping.', cta: 'Listen now', handle: '@latesignals', url: 'latesignals.fm', stat: ['42', 'episodes and counting'], items: ['Why taste is a skill', 'The 100-draft rule', 'Shipping before you’re ready', 'Staying curious'], date: ['12', 'Mar', 'Every Tuesday', '6am PT'], place: 'Wherever you listen', price: 'Free', badge: 'Ep. 42', quote: 'Good ideas don’t arrive. They get dragged out of a hundred bad ones.', author: 'Mara Ellis', role: 'Product designer', tags: ['Design', 'Craft', 'Careers'], chart: [['S1', 12], ['S2', 20], ['S3', 31], ['S4', 44]], vs: ['Instinct', 'Process'], count: ['42', 'episode'], ep: 'EP. 42', menu: [['Intro', '0:00'], ['Taste', '6:40'], ['Drafts', '21:15'], ['Shipping', '38:02']], person: 'Sam Okafor', job: 'Host & Producer', pairs: ['grotesk', 'art', 'impact', 'instrument', 'round', 'bricolage'], pals: ['midnight', 'electric', 'plum', 'citrus', 'lavender'] },
  // Podcast packs beyond the first are `niche`: they only appear through the layouts
  // that name them, so adding one does not reshuffle every other template.
  { id: 'podcast-interview', name: 'Interview podcast', niche: true, kw: 'podcast youtube episode interview guest founder conversation show', brand: 'The Founder Hour', kicker: 'Guest episode', title: 'What Nobody Tells You About Raising Money', short: 'Raising money, honestly', word: 'Guest', sub: 'Investor Priya Shah on term sheets, bad advice and the round she almost walked away from.', cta: 'Watch the episode', handle: '@founderhour', url: 'founderhour.tv', stat: ['1.2M', 'downloads this year'], items: ['The one slide that matters', 'Why warm intros are overrated', 'Negotiating from no', 'Life after the round'], date: ['03', 'Oct', 'New every Thursday', '7am ET'], place: 'YouTube & Spotify', price: 'Free', badge: 'Full episode', quote: 'The best founders I’ve backed were the ones who could say no in a room full of yes.', author: 'Priya Shah', role: 'Partner, Northline Ventures', tags: ['Startups', 'Fundraising', 'Interviews'], chart: [['Q1', 180], ['Q2', 260], ['Q3', 410], ['Q4', 520]], vs: ['Bootstrapped', 'Funded'], count: ['87', 'episode'], ep: 'EP. 87', menu: [['Cold open', '0:00'], ['The pitch', '4:10'], ['Term sheets', '19:30'], ['Walking away', '41:05']], person: 'Daniel Reyes', job: 'Host', pairs: ['grotesk', 'impact', 'instrument', 'geo', 'barlow', 'bricolage'], pals: ['midnight', 'cobalt', 'electric', 'mono', 'sand'] },
  { id: 'podcast-crime', name: 'True crime podcast', niche: true, kw: 'podcast youtube episode true crime mystery case investigation series', brand: 'Dark Water', kicker: 'New case', title: 'The Vanishing at Pine Lake', short: 'Pine Lake', word: 'Case', sub: 'A quiet town, a locked cabin and a thirty-year silence. Part one of three.', cta: 'Listen to part one', handle: '@darkwaterpod', url: 'darkwater.fm', stat: ['3', 'part series'], items: ['The last phone call', 'A witness who waited', 'The sheriff’s notebook', 'What the lake gave back'], date: ['31', 'Oct', 'New episodes Mondays', 'Midnight'], place: 'Everywhere you listen', price: 'Free', badge: 'Part 1 of 3', quote: 'Everyone in that town knew something. Nobody knew everything.', author: 'Lena Ortiz', role: 'Host & investigator', tags: ['True crime', 'Mystery', 'Series'], chart: [['Ep 1', 50], ['Ep 2', 72], ['Ep 3', 95], ['Ep 4', 130]], vs: ['The story', 'The evidence'], count: ['12', 'cases this season'], ep: 'CASE 12', menu: [['The call', '0:00'], ['The cabin', '8:45'], ['The witness', '22:10'], ['The lake', '39:00']], person: 'Lena Ortiz', job: 'Host', pairs: ['condensed', 'impact', 'editorial', 'heavy', 'slab', 'instrument'], pals: ['midnight', 'mono', 'plum', 'forest', 'tomato'] },
  { id: 'podcast-tech', name: 'Tech podcast', niche: true, kw: 'podcast youtube episode tech ai software startup gadgets show', brand: 'Stack & Signal', kicker: 'This week in tech', title: 'Is AI Coming for Your Job?', short: 'AI vs your job', word: 'Tech', sub: 'Two engineers, one skeptic, and a very long list of things that still break in production.', cta: 'Watch now', handle: '@stacksignal', url: 'stacksignal.dev', stat: ['250K', 'subscribers'], items: ['What actually shipped this week', 'The hype-to-reality ratio', 'Our tools of the month', 'Listener questions'], date: ['18', 'Sep', 'Every Wednesday', '9am PT'], place: 'YouTube', price: 'Free', badge: 'Ep. 118', quote: 'The model is impressive. The demo is a lie. Both things are true.', author: 'Noah Kim', role: 'Staff engineer', tags: ['AI', 'Dev tools', 'Careers'], chart: [['Jan', 20], ['Feb', 35], ['Mar', 48], ['Apr', 70]], vs: ['Hype', 'Reality'], count: ['118', 'episode'], ep: 'EP. 118', menu: [['Intro', '0:00'], ['Agents', '5:30'], ['Layoffs', '24:00'], ['Q&A', '47:15']], person: 'Ava Lindqvist', job: 'Co-host', pairs: ['grotesk', 'geo', 'rubik', 'impact', 'barlow', 'modern-serif'], pals: ['electric', 'midnight', 'cobalt', 'mono', 'citrus'] },
  { id: 'podcast-comedy', name: 'Comedy podcast', niche: true, kw: 'podcast youtube episode comedy funny friends banter show', brand: 'Two Idiots, One Mic', kicker: 'New episode', title: 'We Ranked Every Breakfast Cereal', short: 'Cereal, ranked', word: 'LOL', sub: 'A ninety-minute argument nobody asked for, with a special guest who regrets agreeing to this.', cta: 'Watch the chaos', handle: '@twoidiotsonemic', url: 'twoidiots.fm', stat: ['200', 'episodes of nonsense'], items: ['The tier list', 'Hot takes hotline', 'Guest humiliation', 'The apology segment'], date: ['05', 'Nov', 'Fridays', 'Whenever we remember'], place: 'YouTube, Spotify, your car', price: 'Free', badge: 'Ep. 200', quote: 'If you disagree with this ranking you are wrong and we love you.', author: 'Jordan Blake', role: 'Co-host', tags: ['Comedy', 'Rankings', 'Chaos'], chart: [['Mon', 10], ['Tue', 14], ['Wed', 22], ['Thu', 30]], vs: ['Team Crunch', 'Team Flakes'], count: ['200', 'episode'], ep: 'EP. 200', menu: [['Intro', '0:00'], ['The list', '3:00'], ['Guest', '31:20'], ['Apologies', '78:00']], person: 'Sam Okafor', job: 'Co-host', pairs: ['heavy', 'impact', 'round', 'bricolage', 'poster', 'rubik'], pals: ['citrus', 'tomato', 'electric', 'lavender', 'sky'] },
  { id: 'podcast-wellness', name: 'Wellness podcast', niche: true, kw: 'podcast youtube episode wellness health sleep mindfulness habits show', brand: 'Slow Mornings', kicker: 'Episode 56', title: 'How to Actually Sleep Better', short: 'Sleep, fixed', word: 'Rest', sub: 'Sleep scientist Dr. Hana Ito on light, caffeine and the one habit that beats every gadget.', cta: 'Listen now', handle: '@slowmornings', url: 'slowmornings.co', stat: ['8', 'hours, for once'], items: ['Morning light, not screens', 'Caffeine has a curfew', 'The wind-down hour', 'When to see a doctor'], date: ['21', 'Jan', 'New every Sunday', '7am'], place: 'Wherever you listen', price: 'Free', badge: 'Ep. 56', quote: 'You can’t out-supplement a bedroom that’s lit like an office.', author: 'Dr. Hana Ito', role: 'Sleep scientist', tags: ['Sleep', 'Habits', 'Health'], chart: [['Wk1', 5.5], ['Wk2', 6.2], ['Wk3', 7], ['Wk4', 7.8]], vs: ['Before', 'After'], count: ['56', 'episode'], ep: 'EP. 56', menu: [['Intro', '0:00'], ['Light', '6:00'], ['Caffeine', '18:30'], ['Wind-down', '35:00']], person: 'Maya Chen', job: 'Host', pairs: ['editorial', 'instrument', 'fraunces', 'bookish', 'classic', 'round'], pals: ['sage', 'sand', 'paper', 'lavender', 'ocean'] },
  { id: 'travel', name: 'Travel', kw: 'travel trip guide tourism vacation holiday city', brand: 'Wanderfolk', kicker: 'Field notes', title: '48 Hours in Lisbon', short: 'Lisbon in 48 hours', word: 'Lisbon', sub: 'Tiled alleys, custard tarts at 8am and the best sunset in Europe — our slow guide.', cta: 'Read the guide', handle: '@wanderfolk', url: 'wanderfolk.co', stat: ['7', 'hills, one city'], items: ['Sunrise at Miradouro da Graça', 'Pastéis still warm at 8am', 'Tram 28 at golden hour', 'Fado in Alfama'], date: ['14', 'Jun', 'June 14 – 16', 'Departs 7:40am'], place: 'Lisbon, Portugal', price: '$1,290', badge: 'New guide', quote: 'Lisbon doesn’t ask you to hurry. It hands you a coffee and points at the river.', author: 'Inês Duarte', role: 'Local guide', tags: ['City break', 'Food', 'Sunsets'], chart: [['Jun', 24], ['Jul', 28], ['Aug', 29], ['Sep', 26]], vs: ['Tourist route', 'Local route'], count: ['12', 'days to go'], ep: 'Guide 03', menu: [['Pastel de nata', '€1.40'], ['Bifana', '€3.50'], ['Vinho verde', '€4'], ['Grilled sardines', '€9']], person: 'Lena Moreau', job: 'Travel Editor', pairs: ['editorial', 'instrument', 'script', 'modern-serif', 'poster', 'luxe', 'fraunces'], pals: ['sand', 'ocean', 'terracotta', 'sky', 'paper'] },
  { id: 'food', name: 'Food & dining', kw: 'food dinner restaurant menu recipe supper pasta chef', brand: 'Sunday Table', kicker: 'Supper club', title: 'Sunday Pasta Night', short: 'Fresh pasta Sunday', word: 'Pasta', sub: 'Hand-rolled pasta, natural wine and one long table. Bring a friend, leave with ten.', cta: 'Reserve a seat', handle: '@sundaytable', url: 'sundaytable.kitchen', stat: ['12', 'seats a night'], items: ['Burrata & charred peaches', 'Cacio e pepe, made tableside', 'Brown butter gnocchi', 'Olive oil cake'], date: ['09', 'Nov', 'Sunday, Nov 9', '7:00 pm'], place: '118 Mercer St', price: '$65', badge: 'Chef’s pick', quote: 'The kind of dinner where you forget to check your phone for three hours.', author: 'Dana Whitfield', role: 'Regular guest', tags: ['Vegetarian', 'Wine', 'Communal'], chart: [['Jan', 30], ['Feb', 42], ['Mar', 55], ['Apr', 71]], vs: ['Dried', 'Fresh'], count: ['4', 'seats left'], ep: 'Menu 11', menu: [['Burrata', '$16'], ['Cacio e pepe', '$22'], ['Gnocchi', '$24'], ['Olive oil cake', '$11']], person: 'Marco Bellini', job: 'Head Chef', pairs: ['fatface', 'modern-serif', 'script', 'classic', 'bookish', 'instrument', 'fraunces'], pals: ['terracotta', 'tomato', 'paper', 'sage', 'forest'] },
  { id: 'fitness', name: 'Fitness', kw: 'fitness gym workout training health strength', brand: 'Ironline', kicker: '30-day program', title: 'The Strength Reset', short: '30 days stronger', word: 'Lift', sub: 'Three sessions a week, 40 minutes each. Progressive, simple, built to stick.', cta: 'Start free', handle: '@ironline.fit', url: 'ironline.fit', stat: ['+38%', 'average strength gain'], items: ['Squat, hinge, push, pull', 'Train 3× a week', 'Log every set', 'Sleep like it’s your job'], date: ['01', 'Sep', 'Starts Sept 1', '6:30 am'], place: 'Ironline Studio, Floor 2', price: '$49/mo', badge: 'Beginner friendly', quote: 'I finally stopped program-hopping. Thirty days in, my deadlift is up 40 pounds.', author: 'Chris Tan', role: 'Member', tags: ['Strength', 'Mobility', 'Coaching'], chart: [['Wk1', 60], ['Wk2', 68], ['Wk3', 77], ['Wk4', 83]], vs: ['Day 1', 'Day 30'], count: ['7', 'days to go'], ep: 'Week 01', menu: [['Drop-in', '$22'], ['10-pack', '$180'], ['Monthly', '$49'], ['Coaching', '$99']], person: 'Alex Rivera', job: 'Head Coach', pairs: ['sports', 'impact', 'heavy', 'condensed', 'rubik', 'barlow'], pals: ['electric', 'citrus', 'mono', 'cobalt', 'tomato'] },
  { id: 'tech', name: 'Product launch', kw: 'tech app product launch startup software saas', brand: 'Orbit', kicker: 'Introducing', title: 'Meet Orbit 2.0', short: 'Orbit 2.0 is here', word: 'Orbit', sub: 'Your team’s calendar, tasks and docs finally talking to each other. Faster than ever.', cta: 'Try it free', handle: '@orbitapp', url: 'orbit.app', stat: ['3×', 'faster planning'], items: ['Shared timelines', 'Offline-first sync', 'Keyboard everything', 'Private by default'], date: ['30', 'Oct', 'Launch day · Oct 30', '9:00 am PT'], place: 'Live stream', price: '$8/seat', badge: 'New', quote: 'We replaced four tools with Orbit in a week. Planning meetings got 20 minutes shorter.', author: 'Nadia Hassan', role: 'Head of Ops, Fieldwork', tags: ['Productivity', 'Teams', 'AI'], chart: [['Q1', 22], ['Q2', 35], ['Q3', 51], ['Q4', 78]], vs: ['Before', 'After'], count: ['5', 'days to launch'], ep: 'v2.0', menu: [['Free', '$0'], ['Team', '$8'], ['Business', '$16'], ['Enterprise', 'Talk to us']], person: 'Riya Shah', job: 'Product Lead', pairs: ['grotesk', 'round', 'art', 'geo', 'instrument', 'bricolage'], pals: ['midnight', 'cobalt', 'lavender', 'mono', 'electric', 'sky'] },
  { id: 'wedding', name: 'Wedding', occasion: true, kw: 'wedding marriage save the date invitation bride groom', brand: 'Ana & Theo', kicker: 'Together with their families', title: 'Ana & Theo', short: 'Save the date', word: 'Forever', sub: 'request the pleasure of your company as they celebrate their marriage.', cta: 'RSVP by August 1', handle: '#AnaAndTheo', url: 'anaandtheo.love', stat: ['10', 'years in the making'], items: ['Ceremony at 4pm', 'Dinner & dancing to follow', 'Garden attire', 'Shuttle from the inn'], date: ['20', 'Sep', 'Saturday, September 20', 'Four o’clock'], place: 'Rosewood Estate, Sonoma', price: '', badge: 'Save the date', quote: 'Whatever our souls are made of, his and mine are the same.', author: 'Emily Brontë', role: '', tags: ['Ceremony', 'Dinner', 'Dancing'], chart: [['2015', 1], ['2018', 3], ['2022', 6], ['2025', 10]], vs: ['Ana', 'Theo'], count: ['60', 'days to go'], ep: 'No. 01', menu: [['Oysters', 'first'], ['Heirloom salad', 'second'], ['Short rib', 'main'], ['Olive oil cake', 'sweet']], person: 'Ana Costa', job: 'Bride-to-be', pairs: ['luxe', 'script', 'classic', 'instrument', 'editorial', 'roman'], pals: ['blush', 'sand', 'gold', 'ivory', 'blush', 'paper'], motifs: ['ring', 'heart', 'flower'] },
  { id: 'realestate', name: 'Real estate', kw: 'real estate home house property listing open house', brand: 'Keystone Homes', kicker: 'Open house', title: 'Light-Filled Corner Home', short: 'Just listed', word: 'Home', sub: '3 bed · 2 bath · 1,840 sq ft with a south-facing garden and original oak floors.', cta: 'Book a viewing', handle: '@keystonehomes', url: 'keystone.homes', stat: ['$840K', 'asking price'], items: ['South-facing garden', 'Chef’s kitchen', 'Walk to the park', 'EV-ready garage'], date: ['18', 'Oct', 'Saturday, Oct 18', '11am – 2pm'], place: '42 Alder Lane', price: '$840K', badge: 'Just listed', quote: 'They found us a home we didn’t know we could afford — in a week.', author: 'The Parkers', role: 'Happy homeowners', tags: ['3 bed', '2 bath', 'Garden'], chart: [['2022', 690], ['2023', 735], ['2024', 790], ['2025', 840]], vs: ['Before reno', 'After reno'], count: ['2', 'days only'], ep: 'Listing 118', menu: [['Studio', '$2,100'], ['1 bed', '$2,800'], ['2 bed', '$3,600'], ['Penthouse', '$6,900']], person: 'Grace Liu', job: 'Listing Agent', pairs: ['classic', 'modern-serif', 'grotesk', 'luxe', 'bookish', 'zilla'], pals: ['sand', 'gold', 'sage', 'mono', 'paper'] },
  { id: 'music', name: 'Live music', kw: 'music concert gig band live show tour', brand: 'Neon Tides', kicker: 'Live · one night only', title: 'Neon Tides', short: 'Neon Tides live', word: 'Live', sub: 'With special guests Paper Moons. Doors at 8. Dance until the lights come on.', cta: 'Get tickets', handle: '@neontides', url: 'neontides.band', stat: ['1', 'night only'], items: ['Doors 8pm', 'Paper Moons 8:45', 'Neon Tides 10pm', 'Afterparty in the loft'], date: ['27', 'Nov', 'Thursday, Nov 27', 'Doors 8pm'], place: 'The Foundry, Brooklyn', price: '$25', badge: 'Sold out soon', quote: 'The loudest, sweatiest, happiest two hours I’ve had all year.', author: 'Kai Monroe', role: 'Local Sound', tags: ['Synth pop', 'All ages', 'Late show'], chart: [['NYC', 90], ['CHI', 72], ['LA', 85], ['ATX', 64]], vs: ['Studio', 'Live'], count: ['9', 'days to go'], ep: 'Tour ’25', menu: [['GA', '$25'], ['Balcony', '$40'], ['VIP', '$90'], ['Merch bundle', '$55']], person: 'Remy Vance', job: 'Booking Agent', pairs: ['poster', 'art', 'round', 'marker', 'sports', 'retro'], pals: ['electric', 'plum', 'midnight', 'cobalt', 'citrus'] },
  { id: 'education', name: 'Workshop', kw: 'workshop class course education school lesson learn', brand: 'Studio Class', kicker: 'Weekend workshop', title: 'Intro to Watercolor', short: 'Learn watercolor', word: 'Paint', sub: 'Two relaxed afternoons. All materials included. No experience needed — just curiosity.', cta: 'Save your spot', handle: '@studioclass', url: 'studioclass.org', stat: ['8', 'students per class'], items: ['Wet-on-wet washes', 'Mixing a limited palette', 'Painting light', 'Take-home sketchbook'], date: ['04', 'Oct', 'Oct 4 & 5', '1 – 4pm'], place: 'The Annex, 3rd floor', price: '$120', badge: 'All levels', quote: 'I came in unable to draw a circle and left with a painting on my fridge.', author: 'Tom Becker', role: 'Past student', tags: ['Beginner', 'Materials included', 'Small group'], chart: [['Wk1', 20], ['Wk2', 45], ['Wk3', 70], ['Wk4', 92]], vs: ['First try', 'Day two'], count: ['6', 'spots left'], ep: 'Lesson 01', menu: [['Single class', '$65'], ['Weekend', '$120'], ['Monthly', '$220'], ['Private', '$90/h']], person: 'Hana Sato', job: 'Instructor', pairs: ['script', 'modern-serif', 'bookish', 'round', 'instrument', 'fraunces'], pals: ['sky', 'lavender', 'mint', 'paper', 'blush'] },
  { id: 'beauty', name: 'Beauty', kw: 'beauty skincare cosmetics salon glow', brand: 'Soft Glow', kicker: 'The routine', title: 'Glow in Four Steps', short: 'My 4-step glow', word: 'Glow', sub: 'A simple morning ritual for skin that looks rested — even when you’re not.', cta: 'Shop the set', handle: '@softglow', url: 'softglow.co', stat: ['4', 'steps, 5 minutes'], items: ['Gentle cleanse', 'Vitamin C serum', 'Barrier cream', 'SPF, always'], date: ['15', 'May', 'Launching May 15', ''], place: 'Online & in select stores', price: '$58', badge: 'Bestseller', quote: 'My skin has never looked this calm. I actually look forward to mornings now.', author: 'Aisha Bello', role: 'Verified buyer', tags: ['Vegan', 'Fragrance-free', 'Refillable'], chart: [['Wk1', 30], ['Wk2', 52], ['Wk3', 71], ['Wk4', 88]], vs: ['Before', 'After'], count: ['24', 'hours only'], ep: 'Step 01', menu: [['Cleanser', '$18'], ['Serum', '$32'], ['Cream', '$26'], ['SPF 50', '$22']], person: 'Chloe Martin', job: 'Founder', pairs: ['luxe', 'modern-serif', 'instrument', 'editorial', 'script'], pals: ['blush', 'lavender', 'sand', 'mono', 'terracotta'] },
  { id: 'gaming', name: 'Gaming', kw: 'gaming game stream esports twitch', brand: 'PixelRush', kicker: 'Season 9', title: 'Ranked Grind: Day 1 to Diamond', short: 'Bronze to Diamond', word: 'GG', sub: 'Every mistake, every clutch, every rage-quit. Twelve hours, one goal.', cta: 'Watch now', handle: '@pixelrush', url: 'pixelrush.gg', stat: ['12h', 'stream'], items: ['Warm-up aim drills', 'Duo queue with Vex', 'The 1v4 clutch', 'Diamond or bust'], date: ['08', 'Aug', 'Friday, Aug 8', '7pm ET'], place: 'Live on stream', price: 'Free', badge: 'Live', quote: 'Absolutely unhinged stream. That final round had chat going nuclear.', author: 'Vex', role: 'Duo partner', tags: ['FPS', 'Ranked', 'Tips'], chart: [['Bronze', 10], ['Silver', 35], ['Gold', 60], ['Diamond', 95]], vs: ['Noob', 'Pro'], count: ['1', 'hour to go'], ep: 'S9 · E14', menu: [['Sub', '$4.99'], ['VIP', '$9.99'], ['Merch', '$29'], ['Coaching', '$40']], person: 'Leo Park', job: 'Streamer', pairs: ['marker', 'sports', 'impact', 'heavy', 'rubik', 'round', 'slab'], pals: ['electric', 'cobalt', 'citrus', 'midnight', 'plum'] },
  { id: 'coffee', name: 'Café', kw: 'coffee café cafe roaster espresso brew', brand: 'Slow Morning', kicker: 'Now roasting', title: 'Slow Morning Roasters', short: 'New roast drop', word: 'Brew', sub: 'Single-origin Ethiopian beans with notes of apricot, jasmine and honey.', cta: 'Order beans', handle: '@slowmorning', url: 'slowmorning.coffee', stat: ['86', 'cupping score'], items: ['Apricot & jasmine', 'Light roast', 'Washed process', 'Roasted Mondays'], date: ['02', 'Feb', 'Every Saturday', '8am – noon'], place: 'Pier 9 Market', price: '$18', badge: 'Small batch', quote: 'The only coffee that makes me slow down and actually taste the morning.', author: 'Ben Carter', role: 'Subscriber', tags: ['Single origin', 'Direct trade', 'Fresh'], chart: [['Mon', 120], ['Tue', 140], ['Wed', 132], ['Thu', 176]], vs: ['Supermarket', 'Fresh roast'], count: ['2', 'bags left'], ep: 'Lot 21', menu: [['Espresso', '$3.50'], ['Flat white', '$4.75'], ['Pour over', '$5.50'], ['Cardamom bun', '$4']], person: 'Mei Lin', job: 'Head Roaster', pairs: ['bookish', 'classic', 'fatface', 'instrument', 'poster', 'fraunces'], pals: ['terracotta', 'forest', 'paper', 'sand', 'gold'] },
  { id: 'nonprofit', name: 'Nonprofit', kw: 'nonprofit charity volunteer community fundraiser donate', brand: 'Greenroots', kicker: 'Community drive', title: 'Plant 10,000 Trees', short: '10,000 trees', word: 'Plant', sub: 'Join neighbors across the city for a morning of planting, coffee and fresh air.', cta: 'Volunteer', handle: '@greenroots', url: 'greenroots.org', stat: ['10K', 'trees this year'], items: ['Gloves & tools provided', 'Family friendly', 'Free breakfast', 'Every tree is mapped'], date: ['22', 'Apr', 'Earth Day · April 22', '9am – 1pm'], place: 'Riverside Park, North Lawn', price: 'Free', badge: 'Join us', quote: 'My kids check on “their” tree every weekend. That’s the whole point.', author: 'Rosa Jiménez', role: 'Volunteer', tags: ['Climate', 'Community', 'Family'], chart: [['2022', 1800], ['2023', 4200], ['2024', 7300], ['2025', 10000]], vs: ['2020', 'Today'], count: ['10', 'days to go'], ep: 'Drive 05', menu: [['Plant a tree', '$10'], ['Grove of 10', '$90'], ['Street trees', '$250'], ['Sponsor', '$1,000']], person: 'Omar Haddad', job: 'Program Director', pairs: ['round', 'geo', 'bookish', 'condensed', 'grotesk'], pals: ['forest', 'mint', 'sage', 'sky', 'citrus'] },
  { id: 'finance', name: 'Finance tips', kw: 'finance money budget savings investing bank', brand: 'Clearbook', kicker: 'Money, simply', title: '5 Money Habits That Actually Work', short: '5 money habits', word: 'Save', sub: 'Small, boring, automatic. The habits that quietly add up to real wealth.', cta: 'Get the guide', handle: '@clearbook', url: 'clearbook.money', stat: ['$4,200', 'saved in year one'], items: ['Pay yourself first', 'Automate everything', 'One fun budget', 'Review every Sunday'], date: ['01', 'Jan', 'Start January 1', ''], place: 'Free online course', price: 'Free', badge: 'Save this', quote: 'Automating my savings did more in six months than a decade of good intentions.', author: 'Daniel Kim', role: 'Reader', tags: ['Budgeting', 'Investing', 'Habits'], chart: [['Y1', 4200], ['Y2', 9100], ['Y3', 14800], ['Y4', 21000]], vs: ['Spending', 'Saving'], count: ['5', 'minutes a week'], ep: 'Tip 05', menu: [['Emergency fund', '3 mo'], ['Retirement', '15%'], ['Fun money', '10%'], ['Investing', 'monthly']], person: 'Elena Petrova', job: 'Financial Planner', pairs: ['grotesk', 'geo', 'condensed', 'editorial', 'rubik', 'zilla'], pals: ['mint', 'cobalt', 'mono', 'midnight', 'sage'] },
  { id: 'fashion', name: 'Fashion', kw: 'fashion clothing apparel style boutique collection', brand: 'Maison Vale', kicker: 'The autumn edit', title: 'Quiet Layers', short: 'Autumn edit', word: 'Edit', sub: 'Wool, suede and soft tailoring in the colors of late October.', cta: 'Shop the edit', handle: '@maisonvale', url: 'maisonvale.com', stat: ['24', 'new pieces'], items: ['Double-faced wool coat', 'Suede ankle boots', 'Merino rollneck', 'Wide-leg trousers'], date: ['10', 'Oct', 'Available Oct 10', ''], place: 'Flagship & online', price: '$340', badge: 'New season', quote: 'Clothes that feel like a deep breath. I wear the coat every single day.', author: 'Sofia Laurent', role: 'Stylist', tags: ['Outerwear', 'Knitwear', 'Tailoring'], chart: [['Aug', 14], ['Sep', 22], ['Oct', 37], ['Nov', 41]], vs: ['Day', 'Night'], count: ['48', 'hours early access'], ep: 'Look 07', menu: [['Coat', '$340'], ['Boots', '$220'], ['Rollneck', '$140'], ['Trousers', '$180']], person: 'Julien Vale', job: 'Creative Director', pairs: ['luxe', 'instrument', 'editorial', 'poster', 'classic'], pals: ['gold', 'terracotta', 'mono', 'sand', 'plum'] },
  { id: 'hiring', name: 'Hiring', kw: 'hiring jobs careers recruiting we are hiring job', brand: 'Fieldwork', kicker: 'We’re hiring', title: 'Build the Future of Field Science', short: 'We’re hiring!', word: 'Join', sub: 'Remote-friendly, four-day weeks, and teammates who care about the craft.', cta: 'See open roles', handle: '@fieldwork', url: 'fieldwork.io/jobs', stat: ['14', 'open roles'], items: ['Senior Product Designer', 'Staff Backend Engineer', 'Data Scientist', 'Customer Success Lead'], date: ['31', 'Jul', 'Apply by July 31', ''], place: 'Remote · Berlin · Toronto', price: '', badge: 'Remote OK', quote: 'The first job where I’m trusted to do my best work — and given the time to do it.', author: 'Tariq Malik', role: 'Senior Engineer', tags: ['Design', 'Engineering', 'Data', 'Support'], chart: [['2022', 12], ['2023', 28], ['2024', 47], ['2025', 70]], vs: ['Old way', 'Our way'], count: ['14', 'open roles'], ep: 'Role 03', menu: [['Design', '3 roles'], ['Engineering', '6 roles'], ['Data', '2 roles'], ['Support', '3 roles']], person: 'Maya Chen', job: 'Head of Talent', pairs: ['grotesk', 'geo', 'art', 'round', 'rubik', 'barlow'], pals: ['cobalt', 'citrus', 'lavender', 'mint', 'paper'] }
,
  // Social occasions. `kw` widens search; `only` keeps solemn copy out of loud layouts.
  { id: 'birthday', name: 'Birthday', occasion: true, kw: 'birthday party bday celebration invite', brand: 'Maya’s 30th', kicker: 'You’re invited', title: 'Maya Turns Thirty', short: 'Maya turns 30', word: 'Party', sub: 'Cake, karaoke and questionable dancing. Come celebrate three decades of Maya.', cta: 'RSVP by June 1', handle: '#MayaTurns30', url: 'mayaturns30.party', stat: ['30', 'years young'], items: ['Drinks from 7pm', 'Cake at 9', 'Karaoke till late', 'Dress: sparkly'], date: ['14', 'Jun', 'Saturday, June 14', '7:00 pm'], place: 'The Rooftop, 22 Pine St', price: '', badge: 'Save the date', quote: 'Growing old is mandatory. Growing up is optional.', author: 'Walt Disney', role: '', tags: ['Rooftop', 'Cocktails', 'Karaoke'], chart: [['Cake', 9], ['Dancing', 8], ['Sleep', 2], ['Regrets', 0]], vs: ['20s', '30s'], count: ['7', 'days to go'], ep: 'No. 30', menu: [['Welcome drink', '7pm'], ['Dinner', '8pm'], ['Cake', '9pm'], ['Karaoke', '10pm']], person: 'Maya Rodriguez', job: 'Birthday girl', pairs: ['round', 'marker', 'script', 'art', 'geo', 'fatface'], pals: ['citrus', 'pastel', 'cobalt', 'lavender', 'citrus', 'tomato'], motifs: ['balloon', 'cake', 'gift', 'sparkle'], decor: 'confetti' },
  { id: 'engagement', name: 'Engagement', occasion: true, kw: 'engagement engaged proposal party', brand: 'Sara & Omar', kicker: 'She said yes', title: 'Sara & Omar Are Engaged', short: 'We’re engaged!', word: 'Yes', sub: 'Join us for an evening of dinner and dancing as we celebrate our engagement.', cta: 'RSVP by May 10', handle: '#SaraAndOmar', url: 'saraandomar.love', stat: ['2', 'rings, one yes'], items: ['Cocktails at 6', 'Dinner at 7', 'Toasts at 8', 'Dancing after'], date: ['24', 'May', 'Saturday, May 24', '6:00 pm'], place: 'The Glasshouse, Riverside', price: '', badge: 'Save the date', quote: 'Whatever our souls are made of, yours and mine are the same.', author: 'Emily Brontë', role: '', tags: ['Cocktails', 'Dinner', 'Dancing'], chart: [['Met', 1], ['Dated', 3], ['Moved in', 5], ['Engaged', 7]], vs: ['Before', 'After'], count: ['30', 'days to go'], ep: 'Est. 2019', menu: [['Cocktails', '6pm'], ['Dinner', '7pm'], ['Toasts', '8pm'], ['Dancing', '9pm']], person: 'Sara Haddad', job: 'Bride-to-be', pairs: ['luxe', 'script', 'instrument', 'editorial', 'classic', 'dancing'], pals: ['blush', 'valentine', 'gold', 'blush', 'sand', 'pastel'], motifs: ['ring', 'heart', 'sparkle'], decor: 'sparkle' },
  { id: 'christmas', name: 'Christmas', occasion: true, kw: 'christmas xmas holiday season greetings noel', brand: 'The Okafor Family', kicker: 'Season’s greetings', title: 'Merry Christmas & Happy New Year', short: 'Merry Christmas', word: 'Joy', sub: 'Wishing you warm nights, full tables and a little magic this holiday season.', cta: 'Join us Dec 24', handle: '#OkaforChristmas', url: 'okafor.family', stat: ['25', 'days of cheer'], items: ['Mulled wine at 5', 'Carols by the fire', 'Secret Santa (under $20)', 'Ugly sweaters welcome'], date: ['24', 'Dec', 'Christmas Eve, Dec 24', '5:00 pm'], place: '18 Holly Lane', price: '', badge: 'Ho ho ho', quote: 'Christmas isn’t a season. It’s a feeling.', author: 'Edna Ferber', role: '', tags: ['Family', 'Carols', 'Feast'], chart: [['Cookies', 40], ['Carols', 12], ['Presents', 18], ['Naps', 3]], vs: ['Naughty', 'Nice'], count: ['12', 'days to Christmas'], ep: 'Dec 25', menu: [['Roast turkey', 'main'], ['Honey ham', 'main'], ['Mince pies', 'sweet'], ['Eggnog', 'drink']], person: 'Grace Okafor', job: 'Host', pairs: ['script', 'luxe', 'classic', 'fatface', 'editorial', 'diner'], pals: ['crimson', 'festive', 'crimson', 'forest', 'festive', 'crimson', 'gold'], motifs: ['tree', 'snowflake', 'holly', 'reindeer', 'gift', 'bell'], decor: 'snow', scene: 'winter' },
  { id: 'eid', name: 'Eid', occasion: true, kw: 'eid mubarak ramadan iftar eid al-fitr eid al-adha', brand: 'The Rahman Family', kicker: 'Eid Mubarak', title: 'Eid Mubarak to You & Yours', short: 'Eid Mubarak', word: 'Eid', sub: 'May this Eid bring peace to your home, joy to your table and light to your days.', cta: 'Join us for Eid lunch', handle: '#EidMubarak', url: 'rahman.family', stat: ['1', 'month of reflection'], items: ['Eid prayer at 8am', 'Lunch from 1pm', 'Sweets & sheer khurma', 'Eidi for the kids'], date: ['31', 'Mar', 'Eid al-Fitr, March 31', '1:00 pm'], place: '42 Crescent Road', price: '', badge: 'Eid Mubarak', quote: 'Whoever is generous, Allah is generous to him.', author: 'Hadith', role: '', tags: ['Family', 'Feast', 'Gratitude'], chart: [['Dates', 30], ['Sweets', 24], ['Guests', 40], ['Hugs', 99]], vs: ['Ramadan', 'Eid'], count: ['3', 'days to Eid'], ep: '1447 AH', menu: [['Biryani', 'main'], ['Haleem', 'main'], ['Sheer khurma', 'sweet'], ['Chai', 'drink']], person: 'Ayesha Rahman', job: 'Host', pairs: ['luxe', 'instrument', 'classic', 'editorial', 'modern-serif'], pals: ['emerald', 'eidnight', 'emerald', 'gold', 'eidnight', 'emerald'], motifs: ['crescent', 'lantern', 'star8', 'sparkle'], decor: 'stars', scene: 'night' },
  { id: 'puja', name: 'Puja', occasion: true, kw: 'puja durga pooja navratri dussehra pandal festival', brand: 'Sarbojanin Committee', kicker: 'Sharadiya shubhechha', title: 'Durga Puja 2026', short: 'Durga Puja', word: 'Puja', sub: 'Five days of dhak, dhunuchi and bhog. Join us at the pandal for aarti every evening.', cta: 'See the schedule', handle: '#DurgaPuja2026', url: 'parkstreetpuja.org', stat: ['5', 'days of celebration'], items: ['Shashthi: pandal opens', 'Saptami: morning anjali', 'Ashtami: sandhi puja', 'Dashami: sindoor khela'], date: ['18', 'Oct', 'October 18 – 22', 'Aarti at 7pm'], place: 'Park Street Pandal', price: 'Free', badge: 'Shubho Sharodiya', quote: 'Ya Devi sarvabhuteshu shakti-rupena samsthita.', author: 'Devi Mahatmya', role: '', tags: ['Pandal', 'Bhog', 'Dhunuchi'], chart: [['Day 1', 30], ['Day 2', 55], ['Day 3', 80], ['Day 4', 95]], vs: ['Anjali', 'Aarti'], count: ['5', 'days to go'], ep: 'Sharad 1433', menu: [['Khichuri bhog', '1pm'], ['Labra', '1pm'], ['Payesh', 'sweet'], ['Cha', 'all day']], person: 'Ritwik Sen', job: 'Committee Secretary', pairs: ['fatface', 'editorial', 'classic', 'poster', 'bookish'], pals: ['puja', 'marigold', 'puja', 'tomato', 'puja', 'festive'], motifs: ['diya', 'lotus', 'marigold'], decor: 'garland' },
  { id: 'diwali', name: 'Diwali', occasion: true, kw: 'diwali deepavali festival of lights lakshmi', brand: 'The Mehta Family', kicker: 'Happy Diwali', title: 'A Festival of Lights', short: 'Happy Diwali', word: 'Diya', sub: 'May the lamps light your way to a year of prosperity, health and sweetness.', cta: 'Join our Diwali night', handle: '#HappyDiwali', url: 'mehta.family', stat: ['108', 'diyas lit'], items: ['Lakshmi puja at 6', 'Dinner at 8', 'Fireworks at 9', 'Mithai to take home'], date: ['08', 'Nov', 'Sunday, Nov 8', '6:00 pm'], place: '9 Lotus Court', price: '', badge: 'Shubh Deepavali', quote: 'Light a lamp for someone else and it will also brighten your path.', author: 'Buddha', role: '', tags: ['Lights', 'Sweets', 'Family'], chart: [['Diyas', 108], ['Sweets', 60], ['Guests', 45], ['Sparklers', 200]], vs: ['Darkness', 'Light'], count: ['10', 'days to Diwali'], ep: 'Kartik 2083', menu: [['Kaju katli', 'sweet'], ['Chole bhature', 'main'], ['Jalebi', 'sweet'], ['Masala chai', 'drink']], person: 'Priya Mehta', job: 'Host', pairs: ['luxe', 'fatface', 'editorial', 'classic', 'script'], pals: ['diwali', 'marigold', 'diwali', 'gold', 'diwali', 'plum'], motifs: ['diya', 'rangoli', 'fireworks', 'lotus'], decor: 'sparkle', scene: 'night' },
  { id: 'easter', name: 'Easter', occasion: true, kw: 'easter egg hunt spring bunny', brand: 'Willow Farm', kicker: 'Hop on over', title: 'The Great Easter Egg Hunt', short: 'Easter egg hunt', word: 'Hop', sub: 'Two hundred hidden eggs, a petting zoo and hot cross buns. All ages welcome.', cta: 'Reserve a basket', handle: '@willowfarm', url: 'willowfarm.co', stat: ['200', 'eggs hidden'], items: ['Hunt starts 10am', 'Petting zoo till 2', 'Bunny photos', 'Hot cross buns'], date: ['05', 'Apr', 'Easter Sunday, April 5', '10:00 am'], place: 'Willow Farm, Meadow Field', price: '$8', badge: 'All ages', quote: 'Spring: a lovely reminder of how beautiful change can truly be.', author: 'Unknown', role: '', tags: ['Kids', 'Farm', 'Spring'], chart: [['Eggs', 200], ['Kids', 80], ['Buns', 120], ['Bunnies', 6]], vs: ['Hidden', 'Found'], count: ['200', 'eggs'], ep: 'Spring ’26', menu: [['Egg hunt', '10am'], ['Petting zoo', '11am'], ['Bun stand', 'noon'], ['Photos', '1pm']], person: 'Hannah Willow', job: 'Farm Manager', pairs: ['round', 'script', 'geo', 'bookish', 'fatface', 'hand'], pals: ['pastel', 'mint', 'pastel', 'sky', 'blush', 'pastel'], motifs: ['egg', 'bunny', 'flower'], decor: 'dots' },
  { id: 'thanksgiving', name: 'Thanksgiving', occasion: true, kw: 'thanksgiving friendsgiving gratitude harvest turkey', brand: 'The Nguyen Table', kicker: 'Give thanks', title: 'Friendsgiving at Ours', short: 'Friendsgiving', word: 'Thanks', sub: 'Bring a dish, a story and stretchy pants. We’ll handle the turkey.', cta: 'Claim a dish', handle: '#Friendsgiving', url: 'nguyentable.com', stat: ['22', 'pounds of turkey'], items: ['Doors at 3pm', 'Turkey at 5', 'Pie at 7', 'Leftovers for all'], date: ['27', 'Nov', 'Thursday, Nov 27', '3:00 pm'], place: '7 Maple Drive', price: '', badge: 'Potluck', quote: 'Gratitude turns what we have into enough.', author: 'Anonymous', role: '', tags: ['Potluck', 'Family', 'Pie'], chart: [['Turkey', 22], ['Pies', 6], ['Guests', 18], ['Naps', 18]], vs: ['Hungry', 'Full'], count: ['4', 'days to go'], ep: 'Nov 27', menu: [['Roast turkey', 'main'], ['Stuffing', 'side'], ['Pumpkin pie', 'sweet'], ['Cider', 'drink']], person: 'Linh Nguyen', job: 'Host', pairs: ['bookish', 'classic', 'fatface', 'editorial', 'script', 'diner'], pals: ['harvest', 'terracotta', 'harvest', 'marigold', 'harvest', 'forest'], motifs: ['leaf', 'pumpkin'], decor: 'leaves' },
  { id: 'memorial', name: 'Memorial', occasion: true, kw: 'funeral memorial obituary in memoriam remembrance rip service celebration of life', only: ['memorial', 'quote', 'minimal-corner', 'framed-poster', 'circle-portrait', 'photo-quote', 'invitation-classic', 'event-date', 'polaroid', 'photo-caption', 'testimonial', 'card-classic', 'card-split', 'card-qr', 'banner-center', 'banner-type', 'title-slide', 'closing', 'photo-card', 'offset-frame', 'arch-window', 'big-type', 'swiss'], brand: 'The Bennett Family', kicker: 'In loving memory', title: 'Eleanor Grace Bennett', short: 'In loving memory', word: 'Remember', sub: 'Beloved mother, grandmother and friend. Please join us to celebrate a life well lived.', cta: 'Share a memory', handle: '', url: 'rememberingeleanor.com', stat: ['88', 'years of grace'], items: ['Service at 11am', 'Reception to follow', 'In lieu of flowers, donate', 'Wear something blue'], date: ['12', 'Mar', 'Thursday, March 12', '11:00 am'], place: 'St. Andrew’s Chapel, Elm St', price: '', badge: '1938 – 2026', quote: 'To live in hearts we leave behind is not to die.', author: 'Thomas Campbell', role: '', tags: ['Service', 'Reception', 'Memories'], chart: [['1938', 1], ['1962', 2], ['1990', 3], ['2026', 4]], vs: ['Then', 'Always'], count: ['88', 'years'], ep: '1938 – 2026', menu: [['Service', '11am'], ['Eulogies', '11:30'], ['Reception', '12:30'], ['Garden', '2pm']], person: 'Eleanor Grace Bennett', job: '1938 – 2026', pairs: ['classic', 'luxe', 'instrument', 'editorial', 'bookish'], pals: ['ivory', 'sage', 'ivory', 'paper', 'ivory', 'mono'], motifs: ['dove', 'candle', 'flower'] },
  { id: 'baby', name: 'Baby shower', occasion: true, kw: 'baby shower newborn sprinkle gender reveal', brand: 'Baby Cole', kicker: 'Oh baby', title: 'A Shower for Baby Cole', short: 'Baby shower', word: 'Baby', sub: 'Tiny socks, big cake. Help us welcome the newest member of the family.', cta: 'RSVP by Aug 1', handle: '#BabyCole', url: 'babycole.family', stat: ['1', 'tiny human'], items: ['Brunch at 11', 'Games at noon', 'Gifts at 1', 'Cake at 2'], date: ['16', 'Aug', 'Saturday, Aug 16', '11:00 am'], place: 'The Garden Room, 5 Oak St', price: '', badge: 'It’s a girl', quote: 'A baby fills a place in your heart you never knew was empty.', author: 'Anonymous', role: '', tags: ['Brunch', 'Games', 'Gifts'], chart: [['Wk 20', 20], ['Wk 28', 28], ['Wk 34', 34], ['Wk 40', 40]], vs: ['Sleep', 'Baby'], count: ['6', 'weeks to go'], ep: 'Due Sept', menu: [['Brunch', '11am'], ['Games', 'noon'], ['Gifts', '1pm'], ['Cake', '2pm']], person: 'Jess & Sam Cole', job: 'Parents-to-be', pairs: ['script', 'round', 'bookish', 'instrument', 'geo', 'hand'], pals: ['babyblue', 'pastel', 'babyblue', 'blush', 'mint', 'babyblue'], motifs: ['rattle', 'onesie', 'sparkle', 'crescent'], decor: 'stars' },
  { id: 'graduation', name: 'Graduation', occasion: true, kw: 'graduation grad commencement class of', brand: 'Class of 2026', kicker: 'We did it', title: 'Class of 2026 Graduation Party', short: 'Grad party', word: 'Grad', sub: 'Four years, one cap toss. Come celebrate Aisha before she takes on the world.', cta: 'RSVP', handle: '#ClassOf2026', url: 'aishagrads.com', stat: ['4', 'years of late nights'], items: ['Ceremony at 10', 'Photos on the lawn', 'BBQ from 1pm', 'Speeches (short ones)'], date: ['20', 'Jun', 'Saturday, June 20', '1:00 pm'], place: 'Backyard, 31 Birch Ave', price: '', badge: 'Cap & gown', quote: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', role: '', tags: ['BBQ', 'Photos', 'Speeches'], chart: [['Y1', 60], ['Y2', 70], ['Y3', 82], ['Y4', 95]], vs: ['Freshman', 'Graduate'], count: ['1', 'diploma'], ep: '’26', menu: [['Ceremony', '10am'], ['Photos', 'noon'], ['BBQ', '1pm'], ['Toast', '3pm']], person: 'Aisha Khan', job: 'Graduate, B.Sc.', pairs: ['heavy', 'condensed', 'geo', 'poster', 'grotesk', 'roman'], pals: ['cobalt', 'gold', 'midnight', 'cobalt', 'gold', 'sky'], motifs: ['cap', 'sparkle'], decor: 'confetti' },
  { id: 'anniversary', name: 'Anniversary', occasion: true, kw: 'anniversary golden silver wedding anniversary', brand: 'Ruth & David', kicker: 'Fifty years', title: 'Ruth & David’s Golden Anniversary', short: '50 years together', word: 'Fifty', sub: 'Half a century of Sunday roasts and bad puns. Join us to celebrate the two of them.', cta: 'RSVP by Sept 1', handle: '#RuthAndDavid50', url: 'ruthanddavid.family', stat: ['50', 'years married'], items: ['Reception at 4', 'Dinner at 6', 'Slideshow at 7', 'Dancing till 10'], date: ['27', 'Sep', 'Saturday, Sept 27', '4:00 pm'], place: 'Lakeside Pavilion', price: '', badge: 'Golden', quote: 'Grow old along with me! The best is yet to be.', author: 'Robert Browning', role: '', tags: ['Dinner', 'Slideshow', 'Dancing'], chart: [['1976', 1], ['1990', 2], ['2010', 3], ['2026', 4]], vs: ['1976', '2026'], count: ['50', 'years'], ep: 'Since 1976', menu: [['Reception', '4pm'], ['Dinner', '6pm'], ['Slideshow', '7pm'], ['Dancing', '8pm']], person: 'Ruth & David Miller', job: 'Married 1976', pairs: ['luxe', 'classic', 'script', 'editorial', 'instrument', 'roman'], pals: ['gold', 'ivory', 'blush', 'gold', 'sand', 'valentine'], motifs: ['ring', 'heart', 'sparkle'] },
  { id: 'newyear', name: 'New Year', occasion: true, kw: 'new year nye countdown party 2027', brand: 'Midnight Society', kicker: 'Countdown', title: 'New Year’s Eve Rooftop Party', short: 'NYE party', word: '2027', sub: 'Champagne, a live band and the best view of the fireworks in the city.', cta: 'Get tickets', handle: '#NYE2027', url: 'midnightsociety.nyc', stat: ['10', '9 8 7…'], items: ['Doors at 9pm', 'Live band at 10', 'Champagne at midnight', 'Fireworks over the river'], date: ['31', 'Dec', 'Wednesday, Dec 31', '9:00 pm'], place: 'Skyline Rooftop, 40th floor', price: '$60', badge: 'Limited', quote: 'Cheers to a new year and another chance for us to get it right.', author: 'Oprah Winfrey', role: '', tags: ['Rooftop', 'Champagne', 'Fireworks'], chart: [['9pm', 20], ['10pm', 55], ['11pm', 85], ['12am', 100]], vs: ['2026', '2027'], count: ['1', 'night'], ep: 'NYE ’26', menu: [['GA', '$60'], ['VIP', '$120'], ['Table', '$600'], ['Bottle service', '$300']], person: 'Dev Patel', job: 'Host', pairs: ['poster', 'luxe', 'art', 'sports', 'impact', 'retro'], pals: ['gold', 'midnight', 'gold', 'electric', 'midnight', 'plum'], motifs: ['fireworks', 'glass', 'clock', 'sparkle'], decor: 'sparkle', scene: 'night' },
  { id: 'halloween', name: 'Halloween', occasion: true, kw: 'halloween spooky costume trick or treat', brand: 'Hollow House', kicker: 'If you dare', title: 'The Hollow House Halloween', short: 'Halloween party', word: 'Boo', sub: 'Costumes mandatory, screams optional. A haunted maze, a DJ and a cauldron of punch.', cta: 'Get tickets', handle: '#HollowHouse', url: 'hollowhouse.party', stat: ['13', 'rooms of fright'], items: ['Doors at 8pm', 'Costume contest at 10', 'Haunted maze all night', 'Best costume wins $500'], date: ['31', 'Oct', 'Friday, Oct 31', '8:00 pm'], place: 'The Old Mill, Hollow Rd', price: '$25', badge: 'Sold out soon', quote: 'There is magic in the night when pumpkins glow by moonlight.', author: 'Unknown', role: '', tags: ['Costumes', 'Maze', 'DJ'], chart: [['Ghosts', 13], ['Pumpkins', 66], ['Screams', 99], ['Candy', 500]], vs: ['Trick', 'Treat'], count: ['13', 'days to go'], ep: 'Oct 31', menu: [['GA', '$25'], ['Maze pass', '$10'], ['Punch', '$6'], ['VIP crypt', '$80']], person: 'Morgan Blake', job: 'Host', pairs: ['marker', 'poster', 'heavy', 'fatface', 'sports', 'retro'], pals: ['halloween', 'midnight', 'halloween', 'plum', 'halloween', 'citrus'], motifs: ['pumpkin', 'bat', 'ghost', 'crescent'], decor: 'bats', scene: 'night' }
,
  { id: 'birthday-kid', name: 'Kids’ birthday', occasion: true, kw: 'birthday kids party first birthday toddler child balloons', brand: 'Leo’s 5th', kicker: 'Roar! You’re invited', title: 'Leo Is Turning Five', short: 'Leo turns 5', word: 'Five', sub: 'A dinosaur party with cake, games and a bouncy castle. Grown-ups welcome too.', cta: 'RSVP to Mum & Dad', handle: '#LeoTurnsFive', url: 'leoturns5.party', stat: ['5', 'years of mischief'], items: ['Games from 2pm', 'Cake at 3', 'Bouncy castle all afternoon', 'Party bags to take home'], date: ['09', 'Aug', 'Saturday, August 9', '2:00 pm'], place: 'Meadow Park Pavilion', price: '', badge: 'Dino party', quote: 'You are never too old to make a wish and blow out the candles.', author: 'Unknown', role: '', tags: ['Dinosaurs', 'Cake', 'Games'], chart: [['Cake', 5], ['Games', 8], ['Bounces', 99], ['Naps', 0]], vs: ['Four', 'Five'], count: ['5', 'candles'], ep: 'Age 5', menu: [['Games', '2pm'], ['Cake', '3pm'], ['Pass the parcel', '3:30'], ['Party bags', '4:30']], person: 'Leo Martin', job: 'Birthday boy', pairs: ['round', 'rubik', 'marker', 'geo', 'script', 'hand'], pals: ['pastel', 'citrus', 'sky', 'babyblue', 'mint', 'pastel'], motifs: ['balloon', 'cake', 'gift', 'sparkle'], decor: 'confetti' },
  { id: 'birthday-wish', name: 'Birthday wishes', occasion: true, kw: 'happy birthday card wishes greeting', brand: 'From all of us', kicker: 'Happy birthday', title: 'Happy Birthday, Nadia!', short: 'Happy birthday!', word: 'Cheers', sub: 'Wishing you a year full of good coffee, better company and the best surprises.', cta: 'With love', handle: '#HappyBirthdayNadia', url: 'nadia.day', stat: ['1', 'wonderful you'], items: ['Cake for breakfast', 'No meetings', 'Long lunch', 'Early night (optional)'], date: ['03', 'Mar', 'Tuesday, March 3', ''], place: 'Wherever you are', price: '', badge: 'Make a wish', quote: 'Count your life by smiles, not tears. Count your age by friends, not years.', author: 'John Lennon', role: '', tags: ['Cake', 'Friends', 'Wishes'], chart: [['Cake', 10], ['Hugs', 20], ['Candles', 32], ['Wishes', 100]], vs: ['Yesterday', 'Today'], count: ['32', 'candles'], ep: 'Mar 3', menu: [['Coffee', '8am'], ['Cake', 'noon'], ['Drinks', '6pm'], ['Wishes', 'all day']], person: 'Nadia Farouk', job: 'Birthday star', pairs: ['script', 'round', 'fatface', 'art', 'geo'], pals: ['citrus', 'blush', 'lavender', 'pastel', 'cobalt', 'citrus'], motifs: ['cake', 'balloon', 'sparkle'], decor: 'confetti' },
  { id: 'valentine', name: 'Valentine’s', occasion: true, kw: 'valentine valentines love romance galentines', brand: 'The Corner Café', kicker: 'Be mine', title: 'Valentine’s Dinner for Two', short: 'Valentine’s', word: 'Love', sub: 'Four courses, candlelight and a playlist that isn’t embarrassing. Book before it fills.', cta: 'Book a table', handle: '@cornercafe', url: 'cornercafe.co', stat: ['2', 'seats, one table'], items: ['Oysters to start', 'Handmade tagliatelle', 'Chocolate fondant', 'A rose to take home'], date: ['14', 'Feb', 'Saturday, February 14', 'Seatings 6 & 8:30 pm'], place: 'The Corner Café, 4 Rose St', price: '$120', badge: 'Two seatings', quote: 'You are my today and all of my tomorrows.', author: 'Leo Christopher', role: '', tags: ['Dinner', 'Candlelight', 'Wine'], chart: [['Roses', 24], ['Candles', 40], ['Courses', 4], ['Hearts', 2]], vs: ['Single', 'Taken'], count: ['3', 'days to go'], ep: 'Feb 14', menu: [['Oysters', 'first'], ['Tagliatelle', 'main'], ['Fondant', 'sweet'], ['Prosecco', 'drink']], person: 'Elena Rossi', job: 'Owner', pairs: ['script', 'luxe', 'editorial', 'instrument', 'fatface', 'dancing'], pals: ['valentine', 'blush', 'valentine', 'festive', 'plum', 'valentine'], motifs: ['heart', 'sparkle', 'flower'], decor: 'hearts' },
  { id: 'mothers-day', name: 'Mother’s Day', occasion: true, kw: 'mothers day mum mom brunch flowers', brand: 'Bloom & Co', kicker: 'For mum', title: 'Happy Mother’s Day', short: 'For the best mum', word: 'Mum', sub: 'Brunch, flowers and the whole morning off. Because she has earned all three.', cta: 'Book brunch', handle: '@bloomandco', url: 'bloomandco.shop', stat: ['1', 'in a million'], items: ['Bottomless brunch 10 – 1', 'A bouquet for every mum', 'Kids eat free', 'Live acoustic set'], date: ['10', 'May', 'Sunday, May 10', '10:00 am'], place: 'Bloom & Co Garden Room', price: '$45', badge: 'Sunday special', quote: 'A mother’s arms are more comforting than anyone else’s.', author: 'Princess Diana', role: '', tags: ['Brunch', 'Flowers', 'Family'], chart: [['Tulips', 60], ['Peonies', 40], ['Roses', 80], ['Hugs', 99]], vs: ['Any day', 'Her day'], count: ['1', 'day for her'], ep: 'May 10', menu: [['Brunch', '$45'], ['Bouquet', '$30'], ['Kids', 'free'], ['Mimosa', '$9']], person: 'Rosa Alvarez', job: 'Florist', pairs: ['script', 'luxe', 'bookish', 'editorial', 'instrument', 'hand'], pals: ['blush', 'pastel', 'valentine', 'sage', 'blush', 'sand'], motifs: ['flower', 'heart'], decor: 'dots' }
].map(t => ({ ...t, email: 'hello@' + t.url.split('/')[0], phone: '+1 (415) 555-0' + (100 + t.id.length * 37).toString().slice(0, 3) }));
// What the pictures in a pack depict: `obj` fills wide and product frames with a
// drawn object (or scenery), `prop` is what the person in a portrait frame holds or
// wears — so a roaster's templates show coffee, not a stranger.
const SUBJECTS = {
  sale: ['bag', null], podcast: ['mic', 'headphones'], 'podcast-interview': ['mic', 'headphones'], 'podcast-crime': ['mic', null], 'podcast-tech': ['laptop', 'headphones'], 'podcast-comedy': ['mic', 'partyhat'], 'podcast-wellness': ['coffee', null], travel: ['landscape', 'sunhat'], food: ['plate', 'chefhat'], fitness: ['dumbbell', 'headband'], tech: ['laptop', null], wedding: ['ring', 'crown'], realestate: ['house', null], music: ['guitar', 'headphones'], education: ['palette', 'beret'], beauty: ['bottle', 'flower'], gaming: ['controller', 'headphones'], coffee: ['coffee', 'cup'], nonprofit: ['sapling', null], finance: ['piggy', null], fashion: ['hanger', 'sunglasses'], hiring: ['briefcase', 'lanyard'],
  birthday: ['cake', 'partyhat'], 'birthday-kid': ['cake', 'partyhat'], 'birthday-wish': ['cake', 'partyhat'], engagement: ['ring', 'crown'], anniversary: ['ring', null], christmas: ['landscape', 'santahat'], eid: ['lantern', null], puja: ['diya', 'flower'], diwali: ['diya', null], easter: ['egg', 'bunnyears'], thanksgiving: ['pumpkin', null], memorial: ['candle', null], baby: ['rattle', null], graduation: ['cap', 'mortarboard'], newyear: ['fireworks', 'partyhat'], halloween: ['pumpkin', 'witchhat'], valentine: ['heart', 'heart'], 'mothers-day': ['flower', 'flower'],
};
TOPICS.forEach(t => { const [obj, prop] = SUBJECTS[t.id] || ['landscape', null]; t.subject = { obj, prop }; });
export const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const LOUD = ['reaction', 'versus', 'before-after', 'sale-burst', 'product-spot', 'episode'];
const PODCASTS = TOPICS.filter(t => t.id.startsWith('podcast')).map(t => t.id);
const CALM = ['wedding', 'engagement', 'anniversary', 'christmas', 'eid', 'puja', 'diwali', 'easter', 'thanksgiving', 'baby', 'mothers-day', 'valentine'];
TOPICS.forEach(t => { if (CALM.includes(t.id)) t.avoid = LOUD; });
export const OCCASIONS = TOPICS.filter(t => t.occasion).map(t => t.id);
const FESTIVE = OCCASIONS.filter(id => id !== 'memorial');
export { TOPICS };

/* ---------- text metrics ---------- */
function estLines(text, size, w, wf) {
  const cw = size * wf; let n = 0;
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean); n++;
    let cur = -1;
    for (const wd of words) { const L = wd.length * cw; if (cur < 0) cur = L; else if (cur + cw * .9 + L <= w) cur += cw * .9 + L; else { n++; cur = L; } }
  }
  return Math.max(1, n);
}
function fitSize(text, w, max, maxLines, maxH, wf, lh) {
  let s = max; const longest = Math.max(1, ...String(text).split(/\s+/).map(x => x.length));
  for (let i = 0; i < 90; i++) { const n = estLines(text, s, w, wf); if (n <= maxLines && n * s * lh <= maxH && longest * s * wf <= w) break; s *= .95; }
  return s;
}
function splitLines(text, n) {
  const words = String(text).split(/\s+/); if (words.length <= n) return words;
  const total = text.length, target = total / n, out = []; let cur = '';
  for (const w of words) { if (cur && (cur + ' ' + w).length > target * 1.15 && out.length < n - 1) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }
  out.push(cur); return out;
}
function seeded(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const r1 = v => Math.round(v * 10) / 10;
export const NOFILTER = { b: 1, c: 1, s: 1, bl: 0, g: 0, se: 0, hu: 0 };

/* ---------- sample imagery ---------- */
// Every frame a template places is filled with a small procedural illustration in
// the palette's own colours — a cartoon portrait, a landscape or a product — chosen
// from the frame's label and shape. It is drawn by the renderer as inline SVG, so
// nothing binary ships and it vanishes the moment a real photo lands in the frame.
function sampleFor(label, w, h, mask, P, rng, idx = 0, scene = null, subject = { obj: 'landscape', prop: null }) {
  const l = String(label).toLowerCase();
  // A tall or portrait-labelled frame gets a person; a wide one gets the pack's object
  // (or scenery); a product frame gets the object, falling back to a bottle.
  const wantsPerson = /portrait|cutout|headshot|speaker|host|face/.test(l) || mask === 'circle' || h > w * 1.05;
  const obj = /product|bottle|pack|item/.test(l) ? (subject.obj === 'landscape' ? 'bottle' : subject.obj) : subject.obj;
  const kind = wantsPerson ? 'portrait' : obj === 'landscape' ? 'landscape' : 'object';
  // Offset by the frame's index so two frames in one design never draw the same person.
  const v = (Math.floor(rng() * 4) + idx) % 4;
  // The shirt must read against what the figure sits on: the tint, or for a cutout the
  // accent stage behind it — on a gold stage a gold shirt leaves a floating neck.
  const ground = /cutout/.test(l) ? P.accent : P.tint;
  const shirt = [P.accent, P.accent2, P.ink, P.bg].find(x => contrast(x, ground) >= 1.8) || P.ink;
  const c = kind === 'portrait' ? { bg: /cutout/.test(l) ? 'none' : P.tint, halo: mix(P.accent, P.bg, .3), shirt, ink: P.ink }
    : kind === 'object' ? { bg: P.tint, halo: mix(P.accent, P.bg, .3), a: P.accent, b: P.accent2, ink: P.ink, light: P.bg, plinth: mix(P.ink, P.tint, .82) }
    : scene === 'winter' ? { sky: mix('#DCE9F5', P.accent2, .18), sun: '#F6D98A', far: '#F3F6F8', near: '#FFFFFF', tree: lum(P.accent2) < .3 ? P.accent2 : '#2F6B3A', cloud: '#FFFFFF' }
    : scene === 'night' ? { sky: mix('#0E1730', P.accent2, .22), sun: '#FFF1BF', far: mix('#0E1730', P.accent2, .42), near: mix('#0E1730', P.accent2, .58), tree: '#0A1020', cloud: '#FFFFFF' }
    : { sky: mix(P.accent2, P.bg, .72), sun: lum(P.accent) < .08 ? (lum(P.accent2) < .08 ? P.bg : P.accent2) : P.accent, far: mix(P.accent2, P.bg, .38), near: P.accent2, tree: mix(P.accent2, P.ink, .45), cloud: P.bg };
  const out = { kind, v, c };
  if (kind === 'landscape' && scene) out.scene = scene;
  if (kind === 'portrait' && subject.prop) out.prop = subject.prop;
  if (kind === 'object') out.obj = obj;
  return out;
}

/* ---------- copy keys ---------- */
// Every text a layout places comes from a field of the copy pack (title, sub, cta,
// stat.0 …). The element remembers that field as `key`, so when a design moves to
// another template the editor can carry the user's edited text into the slot that
// plays the same role there. Reverse lookup, cached per pack.
const keyMaps = new WeakMap();
function keyFor(C, text) {
  let m = keyMaps.get(C);
  if (!m) {
    m = new Map();
    const add = (k, v) => { if (typeof v === 'string' && v && !m.has(v)) m.set(v, k); else if (Array.isArray(v)) v.forEach((x, i) => add(`${k}.${i}`, x)); };
    Object.entries(C).forEach(([k, v]) => { if (!['id', 'name', 'kw', 'pairs', 'pals'].includes(k)) add(k, v); });
    keyMaps.set(C, m);
  }
  return m.get(String(text)) || null;
}
/** key → text for every keyed text element in a document (first page that has it wins). */
export function textByKey(doc) { const m = {}; doc.pages.forEach(p => p.els.forEach(e => { if (e.type === 'text' && e.key && !(e.key in m)) m[e.key] = e.text; })); return m; }
/** The text the user changed since the design was built, as key → text. */
export function editedText(orig, cur) { const o = textByKey(orig), out = {}; for (const [k, t] of Object.entries(textByKey(cur))) if (k in o && o[k] !== t) out[k] = t; return out; }
/** Put edited text into the slots of a freshly built template that play the same role. Returns the keys that landed. */
export function carryText(doc, map) { const hit = new Set(); doc.pages.forEach(p => p.els.forEach(e => { if (e.type === 'text' && e.key && map[e.key] != null) { e.text = map[e.key]; hit.add(e.key); } })); return [...hit]; }
/** The build descriptor for a document's template id, with the palette and pairing it carries now. */
export function descFor(doc) {
  if (!doc.tpl) return null; const [fmt, layout, topic, j] = doc.tpl.split('~');
  if (!FORMAT[fmt] || !LAYOUT[layout] || !TOPIC[topic]) return null;
  return { id: doc.tpl, fmt, layout, topic, pal: doc.theme && doc.theme.id in PALETTE ? doc.theme.id : 'paper', pair: doc.theme && doc.theme.pairId in PAIRING ? doc.theme.pairId : 'editorial' };
}

/* ---------- layout context ---------- */
function makeCtx(W, H, P, F, C, rng, kind) {
  const u = Math.min(W, H) / 100, ar = W / H;
  const cls = ar >= 2.2 ? 'banner' : ar > 1.25 ? 'wide' : ar >= .8 ? 'square' : 'tall';
  const c = { W, H, u, ar, cls, P, F, C, rng, kind, m: u * 7, els: [], bgc: P.bg };
  const push = e => (c.els.push(e), e);
  const base = (type, x, y, w, h, o, name) => ({ id: nid(), type, name: o.name || name, x: r1(x), y: r1(y), w: r1(w), h: r1(h), rot: o.rot || 0, opacity: o.op ?? 1 });
  c.bg = col => { c.bgc = col; };
  // A tileable pattern over the page colour (src/patterns.js): a colour role, how
  // strongly it shows and how large the tile is.
  c.pattern = (id, o = {}) => { if (PATTERN[id]) c.pat = { id, fg: o.fg || P.ink, alpha: o.alpha ?? .12, scale: o.scale ?? 1, ...(o.rot ? { rot: o.rot } : {}) }; };
  c.t = (text, x, y, w, size, o = {}) => {
    const d = o.f === 'd'; const font = o.font || (d ? F.display : F.body);
    const upper = o.upper ?? (d ? F.upper : false); const ls = o.ls ?? (d ? F.track : 0); const lh = o.lh ?? (d ? F.lh : 1.35);
    const wf = (font === F.display ? F.wf : F.bwf) * (upper ? 1.2 : 1) * 1.05 + ls;
    const e = push({ ...base('text', x, y, w, 0, o, d ? 'Heading' : 'Text'), text: String(text), font, size: r1(size), weight: o.weight ?? (d ? F.dw : 400), italic: !!o.italic, color: o.color || P.ink, align: o.align || 'left', lh, ls, upper, bg: o.bg || null, outline: o.outline || null });
    e.h = r1(estLines(e.text, size, w, wf) * size * lh + (o.bg ? size * .3 : 0));
    const key = keyFor(C, text); if (key) e.key = key;
    return e;
  };
  c.hd = (text, x, y, w, max, lines, maxH, o = {}) => {
    const upper = o.upper ?? F.upper, ls = o.ls ?? F.track, lh = o.lh ?? F.lh;
    const wf = (o.font && o.font !== F.display ? F.bwf : F.wf) * (upper ? 1.2 : 1) * 1.05 + ls;
    return c.t(text, x, y, w, fitSize(text, w, max, lines, maxH ?? 1e9, wf, lh), { f: 'd', ...o });
  };
  c.s = (shape, x, y, w, h, o = {}) => push({ ...base('shape', x, y, w, h, o, shape[0].toUpperCase() + shape.slice(1)), shape, fill: o.fill === undefined ? P.accent : o.fill, stroke: o.stroke || null, sw: o.sw || 0, radius: o.radius || 0, points: o.points || 5, inner: o.inner || .5, sides: o.sides || 6, pts: o.pts || null, dash: !!o.dash, shadow: !!o.shadow });
  c.r = (x, y, w, h, o) => c.s('rect', x, y, w, h, o);
  c.o = (x, y, w, h, o) => c.s('ellipse', x, y, w, h, o);
  c.l = (x, y, w, o = {}) => { const sw = o.sw || u * .3, hh = Math.max(sw * 3, 8); return push({ ...base('line', x, y - hh / 2, w, hh, o, 'Line'), stroke: o.stroke || P.ink, sw, dash: !!o.dash, arrow: !!o.arrow }); };
  c.i = (x, y, w, h, o = {}) => push({ ...base('image', x, y, w, h, o, 'Image'), asset: null, label: o.label || 'Photo', tint: o.tint || P.tint, sample: o.sample === null ? null : sampleFor(o.label || 'Photo', w, h, o.mask, P, rng, c.els.filter(e => e.type === 'image').length, C.scene, C.subject), mask: o.mask || 'none', radius: o.radius || 0, cx: 50, cy: 50, zoom: 1, flip: false, filters: { ...NOFILTER }, border: o.border || null, borderW: o.borderW || 0, shadow: !!o.shadow });
  c.q = (x, y, s, value, o = {}) => push({ ...base('qr', x, y, s, s, o, 'QR code'), value, fg: o.fg || P.ink, qbg: o.bg || P.bg });
  c.ch = (x, y, w, h, o = {}) => push({ ...base('chart', x, y, w, h, o, 'Chart'), chart: o.chart || 'bar', data: (o.data || C.chart).map(([l, v]) => ({ l, v })), colors: o.colors || [P.accent, P.accent2, P.ink, P.muted], ink: o.ink || P.ink, font: F.body, labels: true });
  c.btn = (text, x, y, size, o = {}) => {
    const g = nid(), padX = size * 1.3, padY = size * .72, upper = !!o.upper;
    const tw = text.length * size * (F.bwf * (upper ? 1.2 : 1) * 1.08 + .02);
    const w = tw + padX * 2, h = size * 1.3 + padY * 2;
    const bx = o.anchor === 'center' ? x - w / 2 : o.anchor === 'right' ? x - w : x;
    const rect = c.r(bx, y, w, h, { fill: o.fill || P.accent, radius: o.square ? size * .3 : h / 2, stroke: o.stroke, sw: o.sw, name: 'Button' });
    const t = c.t(text, bx, y + padY, w, size, { weight: o.weight || 700, color: o.color || P.onAccent, align: 'center', upper, ls: .02, lh: 1.3, name: 'Button label' });
    rect.groupId = g; t.groupId = g; t.h = r1(size * 1.3);
    return { w, h, x: bx, els: [rect, t], get y() { return rect.y; }, set y(v) { rect.y = r1(v); t.y = r1(v + padY); } };
  };
  c.sticker = (text, cx, cy, d, o = {}) => {
    const g = nid();
    const sh = c.s(o.shape || 'ellipse', cx - d / 2, cy - d / 2, d, d, { fill: o.fill || P.accent, points: o.points || 14, inner: o.inner || .84, rot: o.rot || 0, name: 'Sticker' });
    const t = c.hd(text, cx - d * .35, 0, d * .7, d * .19, 3, d * .52, { color: o.color || P.onAccent, align: 'center', rot: o.rot || 0, lh: 1.02, ...(o.t || {}) });
    t.y = r1(cy - t.h / 2); sh.groupId = g; t.groupId = g; return sh;
  };
  c.vstack = (items, gaps, top, bottom, al = 'center') => {
    const tot = items.reduce((a, it) => a + it.h, 0) + gaps.reduce((a, g) => a + g, 0);
    let y = al === 'top' ? top : al === 'bottom' ? bottom - tot : top + (bottom - top - tot) / 2;
    items.forEach((it, i) => { it.y = r1(y); y += it.h + (gaps[i] || 0); });
    return tot;
  };
  c.kick = (x, y, w, o = {}) => c.t(o.text || C.kicker, x, y, w, o.size || u * 2.9, { weight: 700, upper: true, ls: .16, color: o.color || P.hi, align: o.align, name: 'Kicker' });
  c.pills = (tags, x, y, maxW, size, o = {}) => {
    let cx = x, cy = y, rowH = 0; const out = [];
    tags.forEach(t => { const b = c.btn(t, 0, 0, size, { fill: o.fill ?? 'transparent', color: o.color || P.ink, stroke: o.stroke || P.ink, sw: u * .25, weight: 600 }); if (cx + b.w > x + maxW && cx > x) { cx = x; cy += rowH + size * .7; rowH = 0; } b.els[0].x = r1(cx); b.els[1].x = r1(cx); b.y = cy; cx += b.w + size * .6; rowH = Math.max(rowH, b.h); out.push(b); });
    return cy + rowH - y;
  };
  // Colour roles for motifs; `ground` is what the motif sits on, so a part never
  // disappears into a band of the same colour.
  const role = (col, ground) => {
    let f = { accent: P.accent, accent2: P.accent2, ink: P.ink, bg: P.bg, snow: '#FFFFFF' }[col] || col;
    if (col === 'snow' && ground && contrast('#FFFFFF', ground) < 1.5) f = mix(P.ink, P.bg, .16);
    if (ground && contrast(f, ground) < 1.6) f = [P.accent2, P.accent, P.ink, P.bg].find(x => contrast(x, ground) >= 1.6) || f;
    return f;
  };
  c.groundAt = (x, y) => { for (let i = c.els.length - 1; i >= 0; i--) { const e = c.els[i]; if (e.type === 'shape' && e.fill && e.name !== 'Motif' && e.name !== 'Scatter' && x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h) return e.fill; } return c.bgc; };
  c.motif = (id, x, y, size, o = {}) => {
    const M = MOTIFS[id]; if (!M) return null;
    const g = nid(), ground = o.ground ?? c.groundAt(x + size / 2, y + size / 2), swap = o.swap || {};
    const els = M.parts.map(pt => {
      const bx = pt.x ?? 0, by = pt.y ?? 0, bw = pt.w ?? 100, bh = pt.h ?? 100;
      const fill = swap[pt.fill] ? role(swap[pt.fill], ground) : role(pt.fill, ground);
      const e = c.s(pt.d ? 'path' : pt.shape, x + bx / 100 * size, y + by / 100 * size, bw / 100 * size, bh / 100 * size, { fill, op: pt.op ?? o.op, rot: pt.rot, name: o.name || 'Motif' });
      if (pt.d) e.d = pt.d;
      e.groupId = g; return e;
    });
    const box = { x, w: size, h: size, els, _y: y };
    Object.defineProperty(box, 'y', { get: () => box._y, set: v => { const dy = r1(v) - box._y; els.forEach(e => { e.y = r1(e.y + dy); }); box._y = r1(v); } });
    return box;
  };
  c.scatter = (key, bands, avoid = []) => {
    const S = SCATTER[key]; if (!S) return;
    const fill = S.fill === 'bg' && key === 'snow' ? 'snow' : S.fill;
    for (let i = 0; i < S.n; i++) {
      const band = bands[i % bands.length];
      const sz = u * (S.size[0] + rng() * (S.size[1] - S.size[0]));
      const x = band.x + rng() * Math.max(0, band.w - sz), y = band.y + rng() * Math.max(0, band.h - sz);
      if (avoid.some(b => x < b.x + b.w && x + sz > b.x && y < b.y + b.h && y + sz > b.y)) continue;
      const ground = c.groundAt(x + sz / 2, y + sz / 2);
      if (S.motif === 'confetti') { const round = rng() < .4; c.s(round ? 'ellipse' : 'rect', x, y, sz, round ? sz : sz * 2.2, { fill: role(['accent', 'accent2', 'ink'][i % 3], ground), rot: Math.round(rng() * 90), op: .9, name: 'Scatter' }); }
      else if (S.motif === 'ellipse') c.o(x, y, sz, sz, { fill: role(fill, ground), op: S.op ?? 1, name: 'Scatter' });
      else c.motif(S.motif, x, y, sz, { swap: { accent: fill, accent2: fill, ink: fill, bg: fill }, name: 'Scatter', op: S.op, ground });
    }
  };
  c.rotC = (cx, cy, dx, dy, deg) => { const a = deg * Math.PI / 180; return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]; };
  return c;
}

/* ---------- occasion garnish ---------- */
// Runs after any layout for copy that has motifs: sprinkles the topic's scatter in
// the top and bottom bands and sets two or three motifs in corners that no text,
// photo or button occupies. Layouts that dress themselves opt out.
const bboxOf = (e, pad = 0) => ({ x: e.x - pad, y: e.y - pad, w: e.w + 2 * pad, h: e.h + 2 * pad });
const hits = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function garnish(c, l) {
  const { W, H, u, m, C, rng } = c;
  if (!C.motifs || l.nogarnish) return;
  const avoid = c.els.filter(e => e.type !== 'shape' || /^Button/.test(e.name)).map(e => bboxOf(e, e.type === 'text' ? u * 2 : u));
  const covered = c.els.some(e => e.type === 'image' && e.w >= W * .9 && e.h >= H * .9);
  if (C.decor && !l.noscatter && !covered) c.scatter(C.decor, [{ x: 0, y: 0, w: W, h: H * .18 }, { x: 0, y: H * .82, w: W, h: H * .18 }], avoid);
  const size = u * (c.cls === 'banner' ? 16 : c.cls === 'wide' ? 14 : 12), pad = m * .55;
  const spots = [[pad, pad], [W - pad - size, pad], [pad, H - pad - size], [W - pad - size, H - pad - size], [W / 2 - size / 2, pad], [W / 2 - size / 2, H - pad - size]]
    .map(p => [p, rng()]).sort((a, b) => a[1] - b[1]).map(([p]) => p);
  const want = 2 + Math.floor(rng() * 2); let placed = 0;
  for (const [x, y] of spots) {
    if (placed >= want) break;
    const box = { x, y, w: size, h: size };
    if (avoid.some(b => hits(b, box)) || c.els.some(e => e.name === 'Motif' && hits(bboxOf(e), box))) continue;
    c.motif(C.motifs[placed % C.motifs.length], x, y, size);
    placed++;
  }
}

/* ---------- layouts ---------- */
export const LAYOUTS = [];
const A3 = ['wide', 'square', 'tall'];
const def = (id, name, kinds, cls, fn, o = {}) => LAYOUTS.push({ id, name, kinds, cls, fn, ...o });

def('big-type', 'Big Type', 'tsdp', A3, c => {
  const { W, H, u, m, P, C } = c; const fy = H - m - u * 3.4;
  c.kick(m, m, W - 2 * m);
  c.t(C.handle, m, fy, W / 2 - m, u * 3, { weight: 700 });
  c.t(C.url, W / 2, fy, W / 2 - m, u * 3, { align: 'right', color: P.muted });
  const sub = c.t(C.sub, m, 0, Math.min(W - 2 * m, u * 80), u * 3.6, { color: P.muted });
  const bar = c.r(m, 0, u * 14, u * 1.2, { fill: P.accent });
  const top = m + u * 9, bot = fy - u * 5;
  const hd = c.hd(C.title, m, 0, W - 2 * m, u * (c.cls === 'tall' ? 19 : 17), 4, bot - top - sub.h - u * 9);
  c.vstack([hd, bar, sub], [u * 4, u * 4], top, bot);
});

def('split-photo', 'Photo Split', 'tsdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const iw = W * .48; c.i(W - iw, 0, iw, H, { label: 'Photo' });
    const x = m, w = W - iw - 2 * m;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, w, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, x, 0, u * 3.2);
    const hd = c.hd(C.title, x, 0, w, u * 15, 4, H - 2 * m - k.h - s.h - b.h - u * 14);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const ih = H * (cls === 'tall' ? .55 : .5); c.i(0, 0, W, ih, { label: 'Photo' });
    c.sticker(C.badge, W - m - u * 9, ih, u * 19, { fill: P.accent, rot: 10 });
    const x = m, w = W - 2 * m - u * 12;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, W - 2 * m, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, x, 0, u * 3.2);
    const top = ih + u * 7, bot = H - m;
    const hd = c.hd(C.title, x, 0, W - 2 * m, u * 12, 3, bot - top - k.h - s.h - b.h - u * 12);
    c.vstack([k, hd, s, b], [u * 2.5, u * 3, u * 4.5], top, bot);
  }
}, { photo: true });

def('photo-band', 'Photo Band', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.i(0, 0, W, H, { label: 'Full-bleed photo' });
  const bandH = cls === 'wide' ? H * .4 : H * .34;
  c.r(0, H - bandH, W, bandH, { fill: P.accent, name: 'Band' });
  c.btn(C.badge, m, m, u * 2.8, { fill: P.bg, color: P.ink, upper: true });
  const k = c.kick(m, 0, W - 2 * m, { color: P.onAccent });
  const hd = c.hd(C.title, m, 0, W - 2 * m, u * 14, 2, bandH - u * 12 - k.h, { color: P.onAccent });
  c.vstack([k, hd], [u * 2], H - bandH + u * 3, H - u * 3);
}, { photo: true });

def('circle-portrait', 'Circle Portrait', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const wide = cls === 'wide';
  const d = wide ? H * .72 : Math.min(W * .6, H * .44);
  const cx = wide ? W - m - d / 2 - u * 3 : W / 2, cy = wide ? H / 2 : m + d / 2 + u * 5;
  c.o(cx - d / 2 + u * 3.5, cy - d / 2 + u * 3.5, d, d, { fill: P.accent, name: 'Offset disc' });
  c.o(cx - d / 2 - u * 3, cy - d / 2 - u * 3, d + u * 6, d + u * 6, { fill: null, stroke: P.ink, sw: u * .4, name: 'Ring' });
  c.i(cx - d / 2, cy - d / 2, d, d, { mask: 'circle', label: 'Portrait' });
  c.o(cx - d * .52, cy + d * .26, u * 9, u * 9, { fill: P.accent2, name: 'Dot' });
  if (wide) {
    const x = m, w = cx - d / 2 - u * 8 - m;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, w, u * 3.4, { color: P.muted });
    const hd = c.hd(C.title, x, 0, w, u * 15, 4, H - 2 * m - k.h - s.h - u * 8);
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    const top = cy + d / 2 + u * 8, w = W - 2 * m;
    const k = c.kick(m, 0, w, { align: 'center' }); const s = c.t(C.sub, m + u * 6, 0, w - u * 12, u * 3.4, { color: P.muted, align: 'center' });
    const hd = c.hd(C.title, m, 0, w, u * 11, 3, H - m - top - k.h - s.h - u * 6, { align: 'center' });
    c.vstack([k, hd, s], [u * 2.5, u * 3], top, H - m);
  }
}, { photo: true });

def('centered-badge', 'Ring & Badge', 'sdp', A3, c => {
  const { W, H, u, P, C } = c;
  const d = Math.min(W, H) * .86;
  c.o(W / 2 - d / 2, H / 2 - d / 2, d, d, { fill: null, stroke: P.accent, sw: u * .6, name: 'Ring' });
  c.o(W / 2 - d / 2 + u * 3, H / 2 - d / 2 + u * 3, d - u * 6, d - u * 6, { fill: null, stroke: P.accent, sw: u * .25, dash: true, name: 'Dashed ring' });
  const w = d * .7, x = W / 2 - w / 2;
  const k = c.kick(x, 0, w, { align: 'center' });
  const s = c.t(C.sub, x + w * .08, 0, w * .84, u * 3.2, { color: P.muted, align: 'center' });
  const hd = c.hd(C.title, x, 0, w, u * 12, 3, d * .42, { align: 'center' });
  c.vstack([k, hd, s], [u * 3, u * 3.5], H / 2 - d * .38, H / 2 + d * .38);
  c.sticker(C.badge, W / 2 + d * .36, H / 2 - d * .36, u * 20, { shape: 'star', fill: P.accent2, color: P.onAccent2, rot: 12, points: 12 });
});

def('stripes', 'Stripes', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const cols = [P.accent, P.accent2, P.ink, P.accent, P.accent2]; const n = 5;
  if (cls === 'wide') {
    const x0 = W * .64, sw = (W - x0) / n;
    cols.forEach((col, i) => c.r(x0 + i * sw, 0, sw + .5, H, { fill: col, name: 'Stripe' }));
    c.sticker(C.badge, x0, H - m - u * 10, u * 20, { fill: P.bg, color: P.ink, rot: -8 });
    const w = x0 - 2 * m - u * 4;
    const k = c.kick(m, 0, w); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, m, 0, u * 3.2);
    const hd = c.hd(C.title, m, 0, w, u * 15, 4, H - 2 * m - k.h - s.h - b.h - u * 14);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const hh = H * (cls === 'tall' ? .3 : .28), sh = hh / n;
    cols.forEach((col, i) => c.r(0, i * sh, W, sh + .5, { fill: col, name: 'Stripe' }));
    c.sticker(C.badge, W - m - u * 10, hh, u * 20, { fill: P.bg, color: P.ink, rot: -8 });
    const w = W - 2 * m;
    const k = c.kick(m, 0, w); const s = c.t(C.sub, m, 0, w, u * 3.6, { color: P.muted }); const b = c.btn(C.cta, m, 0, u * 3.2);
    const top = hh + u * 12;
    const hd = c.hd(C.title, m, 0, w, u * 14, 4, H - m - top - k.h - s.h - b.h - u * 12);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], top, H - m);
  }
});

def('sale-burst', 'Burst', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  c.bg(P.accent);
  const d = wide ? H * .8 : Math.min(W * .62, H * .42);
  const cx = wide ? W - m - d / 2 : W / 2, cy = wide ? H / 2 : m + d / 2 + u * 2;
  const g = nid();
  c.s('star', cx - d / 2, cy - d / 2, d, d, { points: 18, inner: .84, fill: P.bg, rot: -8, name: 'Burst' }).groupId = g;
  const st = c.hd(C.stat[0], cx - d * .34, 0, d * .68, d * .3, 1, d * .3, { color: P.ink, align: 'center', rot: -8 });
  const sl = c.t(C.stat[1], cx - d * .3, 0, d * .6, d * .055, { color: P.ink, align: 'center', weight: 700, upper: true, ls: .08, rot: -8 });
  st.groupId = g; sl.groupId = g;
  c.vstack([st, sl], [d * .02], cy - d * .3, cy + d * .3);
  const x = m, w = wide ? cx - d / 2 - m - u * 4 : W - 2 * m;
  const top = wide ? m : cy + d / 2 + u * 5;
  const k = c.kick(x, 0, w, { color: P.onAccent });
  const b = c.btn(C.cta, x, 0, u * 3.2, { fill: P.onAccent, color: P.accent });
  const hd = c.hd(C.title, x, 0, w, u * 14, 3, H - m - top - k.h - b.h - u * 10, { color: P.onAccent });
  c.vstack([k, hd, b], [u * 3, u * 5], top, H - m);
});

def('quote', 'Quote', 'sdp', A3, c => {
  const { W, H, u, m, P, C, F } = c;
  c.bg(P.surface);
  c.t('“', m - u, m - u * 5, u * 30, u * 34, { f: 'd', font: F.display === 'Anton' || F.upper ? 'Playfair Display' : F.display, color: P.hi, lh: 1, upper: false, name: 'Quote mark' });
  const w = W - 2 * m;
  const a = c.t(C.author, m, 0, w, u * 3.4, { weight: 700, color: P.onSurface });
  const r = c.t(C.role || C.brand, m, 0, w, u * 3, { color: mix(P.onSurface, P.surface, .3) });
  const ln = c.r(m, 0, u * 10, u * .8, { fill: P.accent });
  const q = c.hd(C.quote, m, 0, w, u * (c.cls === 'wide' ? 8 : 8.5), 6, H - m * 2 - u * 26 - a.h - r.h, { upper: false, color: P.onSurface, lh: 1.15 });
  c.vstack([q, ln, a, r], [u * 5, u * 3, u * .6], m + u * 20, H - m);
});

def('grid-four', 'Photo Grid', 'sp', A3, c => {
  const { W, H, u, P, C } = c; const g = u * 1.2;
  const cw = (W - g * 3) / 2, chh = (H - g * 3) / 2;
  [0, 1, 2, 3].forEach(i => c.i(g + (i % 2) * (cw + g), g + Math.floor(i / 2) * (chh + g), cw, chh, { label: 'Photo ' + (i + 1) }));
  const cwid = Math.min(W, H) * .6, x = W / 2 - cwid / 2;
  const card = c.r(x, 0, cwid, 10, { fill: P.bg, radius: u * 2, name: 'Card' });
  const k = c.kick(x + u * 4, 0, cwid - u * 8, { align: 'center' });
  const hd = c.hd(C.title, x + u * 4, 0, cwid - u * 8, u * 8, 3, u * 26, { align: 'center' });
  const hn = c.t(C.handle, x + u * 4, 0, cwid - u * 8, u * 2.8, { align: 'center', color: P.muted, weight: 600 });
  const tot = k.h + hd.h + hn.h + u * 5 + u * 10;
  card.h = r1(tot); card.y = r1(H / 2 - tot / 2);
  c.vstack([k, hd, hn], [u * 2.5, u * 2.5], card.y + u * 5, card.y + tot - u * 5);
}, { photo: true });

def('framed-poster', 'Framed', 'sdp', A3, c => {
  const { W, H, u, P, C } = c; const ins = u * 4;
  c.r(ins, ins, W - 2 * ins, H - 2 * ins, { fill: null, stroke: P.ink, sw: u * .35, name: 'Frame' });
  c.r(ins + u * 1.5, ins + u * 1.5, W - 2 * ins - u * 3, H - 2 * ins - u * 3, { fill: null, stroke: P.ink, sw: u * .12, name: 'Inner frame' });
  const w = W - 2 * (ins + u * 9), x = W / 2 - w / 2;
  c.t(C.kicker, x, ins + u * 8, w, u * 2.6, { align: 'center', upper: true, ls: .3, weight: 600, color: P.ink });
  const dm = c.s('diamond', W / 2 - u * 1.6, 0, u * 3.2, u * 3.2, { fill: P.accent });
  const dt = c.t(C.date[2], x, 0, w, u * 3.2, { align: 'center', upper: true, ls: .18, weight: 700, color: P.ink });
  const pl = c.t(C.place, x, 0, w, u * 3, { align: 'center', color: P.muted });
  const hd = c.hd(C.title, x, 0, w, u * 15, 3, H - 2 * ins - u * 40 - dt.h - pl.h, { align: 'center' });
  c.vstack([dm, hd, dt, pl], [u * 5, u * 5, u * 1.5], ins + u * 16, H - ins - u * 14);
  c.t(C.url, x, H - ins - u * 9, w, u * 2.4, { align: 'center', upper: true, ls: .2, color: P.muted });
});

def('diagonal', 'Diagonal', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.i(0, 0, W, H, { label: 'Photo' });
  if (cls === 'wide') {
    c.s('poly', 0, 0, W, H, { pts: [[0, 0], [.6, 0], [.44, 1], [0, 1]], fill: P.accent, name: 'Diagonal' });
    const w = W * .4 - m;
    const k = c.kick(m, 0, w, { color: P.onAccent }); const s = c.t(C.sub, m, 0, w * .92, u * 3.3, { color: P.onAccent });
    const hd = c.hd(C.title, m, 0, w, u * 14, 4, H - 2 * m - k.h - s.h - u * 8, { color: P.onAccent });
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    c.s('poly', 0, 0, W, H, { pts: [[0, .52], [1, .4], [1, 1], [0, 1]], fill: P.accent, name: 'Diagonal' });
    const w = W - 2 * m, top = H * .52 + u * 4;
    const k = c.kick(m, 0, w, { color: P.onAccent }); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.onAccent });
    const hd = c.hd(C.title, m, 0, w, u * 13, 3, H - m - top - k.h - s.h - u * 7, { color: P.onAccent });
    c.vstack([k, hd, s], [u * 2.5, u * 3.5], top, H - m);
  }
}, { photo: true });

function numberedRows(c, items, x, w, top, bot, o = {}) {
  const { u, P } = c; const d = u * (o.d || 8.5), size = u * (o.size || 3.8); const rows = [];
  items.forEach((it, i) => {
    const g = nid();
    const dot = o.check ? c.o(x, 0, d, d, { fill: null, stroke: P.accent, sw: u * .5, name: 'Check' }) : c.o(x, 0, d, d, { fill: P.accent, name: 'Number' });
    const num = c.t(o.check ? '✓' : String(i + 1), x, 0, d, d * .48, { f: 'd', upper: false, align: 'center', color: o.check ? P.hi : P.onAccent, lh: 1, font: o.check ? c.F.body : undefined, weight: 700 });
    const t = c.t(it, x + d + u * 3.5, 0, w - d - u * 3.5, size, { weight: 600, lh: 1.25 });
    dot.groupId = num.groupId = t.groupId = g;
    rows.push({ h: Math.max(d, t.h), set y(v) { dot.y = r1(v + (Math.max(d, t.h) - d) / 2); num.y = r1(dot.y + d / 2 - d * .26); t.y = r1(v + (Math.max(d, t.h) - t.h) / 2); } });
  });
  const gap = Math.max(u * 3, Math.min(u * 7, (bot - top - rows.reduce((a, r) => a + r.h, 0)) / Math.max(1, rows.length)));
  c.vstack(rows, rows.map(() => gap), top, bot);
}
def('numbered-list', 'Numbered List', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const lw = W * .42 - m;
    const k = c.kick(m, 0, lw); const hd = c.hd(C.title, m, 0, lw, u * 12, 4, H - 2 * m - u * 16);
    const h = c.t(C.handle, m, 0, lw, u * 3, { weight: 700, color: P.muted });
    c.vstack([k, hd, h], [u * 3, u * 5], m, H - m);
    c.r(W * .46, m, u * .3, H - 2 * m, { fill: P.line, name: 'Divider' });
    numberedRows(c, C.items.slice(0, 4), W * .5, W * .5 - m, m, H - m);
  } else {
    const k = c.kick(m, m, W - 2 * m);
    const hd = c.hd(C.title, m, m + k.h + u * 2.5, W - 2 * m, u * 11, 3, H * .3);
    const top = hd.y + hd.h + u * 9;
    c.r(m, top - u * 4.5, W - 2 * m, u * .3, { fill: P.line, name: 'Divider' });
    numberedRows(c, C.items.slice(0, cls === 'tall' ? 4 : 3), m, W - 2 * m, top, H - m - u * 8);
    c.t(C.handle, m, H - m - u * 3, W - 2 * m, u * 3, { weight: 700, color: P.muted });
  }
});

def('event-date', 'Event Date', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const cw = W * .34; c.r(0, 0, cw, H, { fill: P.accent, name: 'Date column' });
    const dn = c.hd(C.date[0], m, 0, cw - 2 * m, H * .5, 1, H * .45, { color: P.onAccent, align: 'center', upper: false });
    const mo = c.t(C.date[1], m, 0, cw - 2 * m, u * 7, { f: 'd', color: P.onAccent, align: 'center', upper: true });
    c.vstack([dn, mo], [u * 1], m, H - m);
    const x = cw + m, w = W - cw - 2 * m;
    const k = c.kick(x, 0, w); const t2 = c.t(C.date[3] + '  ·  ' + C.place, x, 0, w, u * 3.4, { weight: 600 }); const b = c.btn(C.cta, x, 0, u * 3);
    const hd = c.hd(C.title, x, 0, w, u * 14, 3, H - 2 * m - k.h - t2.h - b.h - u * 14);
    c.vstack([k, hd, t2, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const dn = c.hd(C.date[0], m - u, m, W * .55, u * 42, 1, H * .3, { color: P.hi, upper: false, lh: .9 });
    c.t(C.date[1], m + W * .5, m + dn.h * .2, W * .45 - m * 2, u * 9, { f: 'd', upper: true });
    c.t(C.date[3], m + W * .5, m + dn.h * .2 + u * 11, W * .45 - m * 2, u * 3.4, { weight: 600, color: P.muted });
    c.l(m, dn.y + dn.h + u * 4, W - 2 * m, { sw: u * .35, stroke: P.ink });
    const top = dn.y + dn.h + u * 9;
    const k = c.kick(m, 0, W - 2 * m); const pl = c.t(C.place, m, 0, W - 2 * m, u * 3.6, { weight: 600 }); const b = c.btn(C.cta, m, 0, u * 3.2);
    const hd = c.hd(C.title, m, 0, W - 2 * m, u * 13, 3, H - m - top - k.h - pl.h - b.h - u * 13);
    c.vstack([k, hd, pl, b], [u * 3, u * 4, u * 5], top, H - m, 'top');
  }
});

def('arch-window', 'Arch Window', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const ah = H - 2 * m, aw = ah * .66;
    c.o(m + aw * .72, m - u * 2, u * 14, u * 14, { fill: P.accent2, name: 'Sun' });
    c.i(m, m, aw, ah, { mask: 'arch', label: 'Photo' });
    const x = m * 2 + aw + u * 3, w = W - x - m;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, w, u * 3.4, { color: P.muted });
    const hd = c.hd(C.title, x, 0, w, u * 14, 3, H - 2 * m - k.h - s.h - u * 8);
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    const aw = W * .62, ah = H * (cls === 'tall' ? .5 : .5);
    c.o(W / 2 + aw * .3, m - u, u * 16, u * 16, { fill: P.accent2, name: 'Sun' });
    c.i(W / 2 - aw / 2, m + u * 3, aw, ah, { mask: 'arch', label: 'Photo' });
    const top = m + u * 3 + ah + u * 6, w = W - 2 * m;
    const k = c.kick(m, 0, w, { align: 'center' }); const s = c.t(C.sub, m + u * 5, 0, w - u * 10, u * 3.2, { color: P.muted, align: 'center' });
    const hd = c.hd(C.title, m, 0, w, u * 11, 2, H - m - top - k.h - s.h - u * 6, { align: 'center' });
    c.vstack([k, hd, s], [u * 2.5, u * 3], top, H - m);
  }
}, { photo: true });

def('outline-type', 'Outline Type', 'tsp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const word = C.word.toUpperCase(); const w = W - 2 * m;
  const s = c.t(C.sub, m, 0, Math.min(w, u * 70), u * 3.4, { color: P.muted });
  const b = c.btn(C.cta, m, 0, u * 3);
  const avail = H - 2 * m - s.h - b.h - u * 12;
  const probe = c.hd(word, m, 0, w, u * 34, 1, avail / 3 / .92, { lh: .92, upper: true, outline: P.ink, name: 'Outline 1' });
  const l2 = c.t(word, m, 0, w, probe.size, { f: 'd', lh: .92, upper: true, color: P.hi, name: 'Solid' });
  const l3 = c.t(word, m, 0, w, probe.size, { f: 'd', lh: .92, upper: true, outline: P.ink, name: 'Outline 2' });
  c.vstack([probe, l2, l3, s, b], [0, 0, u * 5, u * 4], m, H - m);
});

def('product-spot', 'Spotlight', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const d = wide ? H * .86 : Math.min(W, H) * .72;
  const cx = wide ? W - m - d / 2 : W / 2, cy = wide ? H / 2 : H * .52;
  c.o(cx - d / 2, cy - d / 2, d, d, { fill: P.accent2, name: 'Spot' });
  const iw = d * .6, ih = d * .74;
  c.i(cx - iw / 2, cy - ih / 2, iw, ih, { radius: u * 2, label: 'Product', shadow: true });
  c.sticker(C.price || C.badge, cx + iw / 2, cy - ih / 2 + u * 4, u * 18, { fill: P.accent, rot: 10 });
  if (wide) {
    const w = cx - d / 2 - 2 * m;
    const k = c.kick(m, 0, w); const b = c.btn(C.cta, m, 0, u * 3.2);
    const hd = c.hd(C.title, m, 0, w, u * 14, 3, H - 2 * m - k.h - b.h - u * 10);
    c.vstack([k, hd, b], [u * 3, u * 5], m, H - m);
  } else {
    const k = c.kick(m, m, W - 2 * m, { align: 'center' });
    c.hd(C.title, m, m + k.h + u * 2, W - 2 * m, u * 9, 2, cy - d / 2 - m - k.h - u * 4, { align: 'center' });
    c.btn(C.cta, W / 2, H - m - u * 7.5, u * 3, { anchor: 'center' });
  }
}, { photo: true });

def('magazine', 'Magazine Cover', 'sp', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  c.i(0, 0, W, H, { label: 'Cover photo' });
  const mast = c.hd(C.brand.toUpperCase(), m, m * .6, W - 2 * m, u * 26, 1, u * 20, { align: 'center', color: P.accent, upper: true, name: 'Masthead' });
  c.t('Issue 12  ·  ' + C.date[2], m, mast.y + mast.h + u * .5, W - 2 * m, u * 2.4, { align: 'center', upper: true, ls: .2, weight: 700, color: '#FFFFFF' });
  c.r(0, H * .58, W, H * .42, { fill: '#000000', op: .42, name: 'Scrim' });
  const w = W * .7;
  const hd = c.hd(C.title, m, 0, w, u * 11, 3, H * .2, { color: '#FFFFFF' });
  const lines = C.items.slice(0, 3).map(t => c.t('— ' + t, m, 0, w, u * 3.2, { color: '#FFFFFF', weight: 600 }));
  c.vstack([hd, ...lines], [u * 3, u * 1, u * 1], H * .6, H - m);
  c.sticker(C.badge, W - m - u * 10, H * .6, u * 20, { fill: P.accent, rot: 12 });
}, { photo: true });

def('minimal-corner', 'Minimal', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const d = Math.min(W, H) * .9;
  c.o(W - d * .6, -d * .4, d, d, { fill: P.accent, name: 'Sun' });
  c.kick(m, m, W * .45, { color: P.ink });
  c.t(C.date[2], m, H - m - u * 3, W / 2, u * 2.8, { weight: 700, upper: true, ls: .1 });
  c.t(C.url, W / 2, H - m - u * 3, W / 2 - m, u * 2.8, { align: 'right', color: P.muted });
  const s = c.t(C.sub, m, 0, Math.min(W * .6, u * 70), u * 3.2, { color: P.muted });
  const hd = c.hd(C.title, m, 0, W * .74, u * 12, 3, H * .36, {});
  c.vstack([hd, s], [u * 3], 0, H - m - u * 9, 'bottom');
});

def('stat-chart', 'Stat & Chart', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const k = c.kick(m, m, W - 2 * m);
  const hd = c.hd(C.title, m, m + k.h + u * 2, cls === 'wide' ? W * .6 : W - 2 * m, u * 7.5, 2, u * 18);
  const top = hd.y + hd.h + u * 7;
  if (cls === 'wide') {
    const sw = W * .36;
    const st = c.hd(C.stat[0], m, 0, sw, u * 30, 1, u * 30, { color: P.hi, upper: false });
    const sl = c.t(C.stat[1], m, 0, sw, u * 3.6, { weight: 600, color: P.muted });
    c.vstack([st, sl], [u * 2], top, H - m);
    c.ch(m + sw + u * 6, top, W - sw - 2 * m - u * 6, H - top - m, {});
  } else {
    const st = c.hd(C.stat[0], m, top, W - 2 * m, u * 26, 1, u * 24, { color: P.hi, upper: false });
    const sl = c.t(C.stat[1], m, st.y + st.h + u, W - 2 * m, u * 3.6, { weight: 600, color: P.muted });
    const ct = sl.y + sl.h + u * 6;
    c.ch(m, ct, W - 2 * m, H - m - ct, {});
  }
});

def('ribbon', 'Ribbons', 'tsp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const k = c.kick(m, m, W - 2 * m);
  c.hd(C.title, m, m + k.h + u * 2, W - 2 * m, u * 10, 2, H * .2);
  const rh = u * 15;
  [[H * .47, -7, P.accent, P.onAccent, C.short], [H * .47 + rh * 1.15, 5, P.accent2, P.onAccent2, C.word]].forEach(([cy, rot, fill, col, txt]) => {
    const g = nid();
    const r = c.r(-W * .15, cy - rh / 2, W * 1.3, rh, { fill, rot, name: 'Ribbon' });
    const t = c.hd(`${txt}  ·  ${txt}  ·  ${txt}`, -W * .1, 0, W * 1.2, rh * .55, 1, rh * .7, { color: col, align: 'center', rot, upper: true });
    t.y = r1(cy - t.h / 2); r.groupId = t.groupId = g;
  });
  const s = c.t(C.sub, m, 0, W * .6, u * 3.2, { color: P.muted });
  const b = c.btn(C.cta, W - m, 0, u * 3, { anchor: 'right' });
  s.y = r1(H - m - s.h); b.y = H - m - b.h;
});

def('polaroid', 'Polaroid', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const fw = wide ? H * .66 : Math.min(W * .62, H * .42), fh = fw * 1.2, th = -5;
  const cx = wide ? W - m - fw / 2 - u * 4 : W / 2, cy = wide ? H / 2 : m + fh / 2 + u * 3;
  const g = nid();
  c.r(cx - fw / 2, cy - fh / 2, fw, fh, { fill: '#FFFFFF', rot: th, shadow: true, name: 'Polaroid' }).groupId = g;
  const iw = fw * .88; const [ix, iy] = c.rotC(cx, cy, 0, -fh / 2 + fw * .06 + iw / 2, th);
  c.i(ix - iw / 2, iy - iw / 2, iw, iw, { rot: th, label: 'Photo' }).groupId = g;
  const capH = fh - fw * .06 - iw; const [tx, ty] = c.rotC(cx, cy, 0, fh / 2 - capH / 2, th);
  const cap = c.t(C.place, tx - iw / 2, 0, iw, fw * .075, { font: 'Caveat', align: 'center', color: '#222222', rot: th, lh: 1, weight: 700 });
  cap.y = r1(ty - cap.h / 2); cap.groupId = g;
  if (wide) {
    const w = cx - fw / 2 - 2 * m - u * 3;
    const k = c.kick(m, 0, w); const s = c.t(C.sub, m, 0, w, u * 3.3, { color: P.muted });
    const hd = c.hd(C.title, m, 0, w, u * 13, 3, H - 2 * m - k.h - s.h - u * 8);
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    const top = cy + fh / 2 + u * 8, w = W - 2 * m;
    const k = c.kick(m, 0, w, { align: 'center' }); const s = c.t(C.sub, m + u * 5, 0, w - u * 10, u * 3.2, { color: P.muted, align: 'center' });
    const hd = c.hd(C.title, m, 0, w, u * 10, 2, H - m - top - k.h - s.h - u * 6, { align: 'center' });
    c.vstack([k, hd, s], [u * 2.5, u * 3], top, H - m);
  }
}, { photo: true });

def('checklist', 'Checklist Card', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.accent);
  const wide = cls === 'wide';
  const hw = wide ? W * .4 - m : W - 2 * m;
  const k = c.kick(m, m, hw, { color: P.onAccent });
  const hd = c.hd(C.title, m, m + k.h + u * 2.5, hw, u * 11, 3, wide ? H * .6 : H * .26, { color: P.onAccent });
  const cx = wide ? W * .44 : m, cy = wide ? m : hd.y + hd.h + u * 6;
  const cw = wide ? W - cx - m : W - 2 * m, chh = H - cy - m;
  c.r(cx, cy, cw, chh, { fill: P.bg, radius: u * 3, name: 'Card' });
  numberedRows(c, C.items.slice(0, 4), cx + u * 6, cw - u * 12, cy + u * 6, cy + chh - u * 6, { check: true, d: 7.5, size: 3.6 });
});

def('versus', 'Versus', 'ts', ['wide', 'square'], c => {
  const { W, H, u, m, P, C } = c; const g = u * 1;
  c.bg(P.ink);
  c.i(0, 0, W / 2 - g / 2, H, { label: C.vs[0], tint: mix(P.accent, P.bg, .4) });
  c.i(W / 2 + g / 2, 0, W / 2 - g / 2, H, { label: C.vs[1], tint: mix(P.accent2, P.bg, .4) });
  const hd = c.hd(C.short, m, m, W - 2 * m, u * 11, 1, u * 13, { align: 'center', bg: P.bg, color: P.ink });
  c.sticker('VS', W / 2, H * .55, u * 24, { fill: P.accent, color: P.onAccent, rot: -6, t: { upper: true } });
  c.btn(C.vs[0], W / 4, H - m - u * 9, u * 3.4, { anchor: 'center', fill: P.bg, color: P.ink, upper: true });
  c.btn(C.vs[1], W * .75, H - m - u * 9, u * 3.4, { anchor: 'center', fill: P.accent2, color: P.onAccent2, upper: true });
}, { photo: true });

def('reaction', 'Reaction', 'ts', ['wide', 'square'], c => {
  const { W, H, u, m, P, C } = c;
  c.bg(P.accent2);
  const d = H * .9; c.o(W - d * .85, H - d * .9, d, d, { fill: P.accent, name: 'Halo' });
  c.i(W - H * .78, H * .1, H * .72, H * .9, { label: 'Cutout — try Remove BG', tint: mix(P.accent, P.bg, .3) });
  const lines = splitLines(C.short.toUpperCase(), 2);
  const w = W * .56;
  const size = Math.min(...lines.map(l => fitSize(l, w, u * 20, 1, u * 22, c.F.wf * 1.26 + c.F.track, c.F.lh)));
  const els = lines.map((l, i) => c.t(l, m, 0, w, size, { f: 'd', upper: true, bg: i % 2 ? P.accent : P.bg, color: i % 2 ? P.onAccent : P.ink, rot: -3, lh: 1.1 }));
  c.vstack(els, els.map(() => u * 1), m, H - m - u * 12);
  c.s('arrow', W * .48, H * .68, u * 16, u * 10, { fill: P.bg, rot: -18, name: 'Arrow' });
  c.btn(C.badge, m, H - m - u * 9, u * 3, { fill: P.ink, color: P.bg, upper: true });
}, { photo: true });

def('timeline', 'Timeline', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const k = c.kick(m, m, W - 2 * m);
  const hd = c.hd(C.title, m, m + k.h + u * 2, W - 2 * m, u * 10, 2, H * .26);
  const items = C.items.slice(0, cls === 'wide' ? 4 : 4);
  if (cls === 'wide') {
    const ly = hd.y + hd.h + (H - hd.y - hd.h - m) * .4;
    c.l(m, ly, W - 2 * m, { sw: u * .4, stroke: P.ink });
    const step = (W - 2 * m) / items.length;
    items.forEach((it, i) => { const x = m + i * step; c.o(x, ly - u * 2.5, u * 5, u * 5, { fill: i === items.length - 1 ? P.accent : P.bg, stroke: P.ink, sw: u * .4 }); c.t(String(i + 1).padStart(2, '0'), x, ly - u * 11, step - u * 3, u * 4.5, { f: 'd', upper: false, color: P.hi }); c.t(it, x, ly + u * 5, step - u * 4, u * 3.2, { weight: 600 }); });
  } else {
    const top = hd.y + hd.h + u * 8, bot = H - m; const lx = m + u * 2.5;
    c.r(lx - u * .2, top, u * .4, bot - top - u * 4, { fill: P.ink, name: 'Rail' });
    const step = (bot - top) / items.length;
    items.forEach((it, i) => { const y = top + i * step; c.o(lx - u * 2.5, y, u * 5, u * 5, { fill: i === items.length - 1 ? P.accent : P.bg, stroke: P.ink, sw: u * .4 }); c.t(String(i + 1).padStart(2, '0'), m + u * 9, y - u * .5, u * 12, u * 4, { f: 'd', upper: false, color: P.hi }); c.t(it, m + u * 22, y, W - 2 * m - u * 22, u * 3.6, { weight: 600 }); });
  }
});

def('testimonial', 'Testimonial', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  c.r(W - u * 30, 0, u * 30, u * 30, { fill: P.accent2, name: 'Corner' });
  const stars = []; for (let i = 0; i < 5; i++) stars.push(c.s('star', m + i * u * 6.5, m, u * 5.5, u * 5.5, { fill: P.accent, inner: .45, name: 'Star' }));
  const d = u * 13;
  const av = c.i(m, 0, d, d, { mask: 'circle', label: 'Avatar' });
  const a = c.t(C.author, m + d + u * 4, 0, W - 2 * m - d - u * 4, u * 3.6, { weight: 700 });
  const r = c.t(C.role || C.brand, m + d + u * 4, 0, W - 2 * m - d - u * 4, u * 3, { color: P.muted });
  const q = c.hd('“' + C.quote + '”', m, 0, W - 2 * m, u * 8, 6, H - 2 * m - u * 34, { upper: false, lh: 1.15 });
  q.y = r1(m + u * 13); av.y = r1(H - m - d); a.y = r1(av.y + d / 2 - a.h + u * .3); r.y = r1(av.y + d / 2 + u * .8);
}, { photo: true });

def('menu-board', 'Menu', 'sp', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  const w = W - 2 * m;
  const k = c.kick(m, m + u * 2, w, { align: 'center' });
  const hd = c.hd(C.title, m, k.y + k.h + u * 2, w, u * 11, 2, H * .2, { align: 'center' });
  c.s('diamond', W / 2 - u * 1.5, hd.y + hd.h + u * 4, u * 3, u * 3, { fill: P.accent });
  const top = hd.y + hd.h + u * 12, bot = H - m - u * 10; const n = C.menu.length; const step = (bot - top) / n;
  C.menu.forEach(([name, price], i) => {
    const y = top + i * step + step / 2 - u * 2.4;
    const nm = c.t(name, m, y, w * .6, u * 4, { f: 'd', upper: false, weight: c.F.dw });
    const pr = c.t(price, W - m - w * .3, y, w * .3, u * 4, { f: 'd', align: 'right', upper: false, color: P.hi });
    c.l(m + Math.min(w * .6, name.length * u * 4 * c.F.wf * 1.05) + u * 2, y + u * 3.6, w * .25, { dash: true, sw: u * .25, stroke: P.line });
  });
  c.t(C.place + '  ·  ' + C.date[3], m, H - m - u * 3.5, w, u * 2.8, { align: 'center', color: P.muted, upper: true, ls: .12, weight: 600 });
});

def('countdown', 'Countdown', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const d = wide ? H * .78 : Math.min(W * .7, H * .5);
  const cx = wide ? W - m - d / 2 : W / 2, cy = wide ? H / 2 : m + d / 2 + u * 3;
  const g = nid();
  c.o(cx - d / 2, cy - d / 2, d, d, { fill: P.accent, name: 'Dial' }).groupId = g;
  c.o(cx - d / 2 - u * 2.5, cy - d / 2 - u * 2.5, d + u * 5, d + u * 5, { fill: null, stroke: P.accent, sw: u * .4, dash: true, name: 'Dial ring' }).groupId = g;
  const n = c.hd(C.count[0], cx - d * .4, 0, d * .8, d * .5, 1, d * .5, { color: P.onAccent, align: 'center', upper: false, lh: .95 });
  const l = c.t(C.count[1], cx - d * .35, 0, d * .7, d * .065, { color: P.onAccent, align: 'center', upper: true, ls: .14, weight: 700 });
  n.groupId = l.groupId = g; c.vstack([n, l], [d * .02], cy - d * .4, cy + d * .4);
  const x = m, w = wide ? cx - d / 2 - 2 * m - u * 3 : W - 2 * m, top = wide ? m : cy + d / 2 + u * 8;
  const k = c.kick(x, 0, w, { align: wide ? 'left' : 'center' });
  const dt = c.t(C.date[2], x, 0, w, u * 3.4, { weight: 600, color: P.muted, align: wide ? 'left' : 'center' });
  const hd = c.hd(C.title, x, 0, w, u * 13, 3, H - m - top - k.h - dt.h - u * 7, { align: wide ? 'left' : 'center' });
  c.vstack([k, hd, dt], [u * 2.5, u * 3.5], top, H - m);
});

def('concentric', 'Concentric', 'sp', A3, c => {
  const { W, H, u, P, C } = c;
  const R = Math.max(W, H) * 1.1, inner = Math.min(W, H) * .62;
  const cols = [P.accent2, P.bg, P.accent2, P.bg, P.accent];
  cols.forEach((col, i) => { const d = R - (R - inner) * (i / (cols.length - 1)); c.o(W / 2 - d / 2, H / 2 - d / 2, d, d, { fill: col, name: 'Ring ' + (i + 1) }); });
  const w = inner * .7, x = W / 2 - w / 2;
  const k = c.kick(x, 0, w, { align: 'center', color: P.onAccent });
  const hd = c.hd(C.title, x, 0, w, u * 10, 3, inner * .42, { align: 'center', color: P.onAccent });
  const dt = c.t(C.date[2], x, 0, w, u * 3, { align: 'center', color: P.onAccent, weight: 700 });
  c.vstack([k, hd, dt], [u * 2.5, u * 3], H / 2 - inner * .38, H / 2 + inner * .38);
});

def('ticket', 'Ticket', 'sp', ['wide', 'square'], c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.accent);
  const cw = W - 2 * m, ch = cls === 'wide' ? H - 2 * m * 1.3 : H * .52; const cx = m, cy = (H - ch) / 2;
  c.r(cx, cy, cw, ch, { fill: P.bg, radius: u * 2.5, shadow: true, name: 'Ticket' });
  const stubW = cw * .3, px = cx + cw - stubW;
  c.l(px, cy + ch / 2, ch - u * 8, { dash: true, sw: u * .3, stroke: P.line, rot: 90 }).x = r1(px - (ch - u * 8) / 2);
  c.o(px - u * 3, cy - u * 3, u * 6, u * 6, { fill: P.accent, name: 'Notch' }); c.o(px - u * 3, cy + ch - u * 3, u * 6, u * 6, { fill: P.accent, name: 'Notch' });
  const x = cx + u * 6, w = cw - stubW - u * 12;
  const k = c.kick(x, 0, w); const dt = c.t(C.date[2] + '  ·  ' + C.date[3], x, 0, w, u * 3, { weight: 700 }); const pl = c.t(C.place, x, 0, w, u * 3, { color: P.muted });
  const hd = c.hd(C.title, x, 0, w, u * 11, 2, ch - u * 16 - k.h - dt.h - pl.h);
  c.vstack([k, hd, dt, pl], [u * 2, u * 3, u * 1], cy + u * 5, cy + ch - u * 5);
  const qs = Math.min(stubW * .56, ch * .5);
  c.q(px + stubW / 2 - qs / 2, cy + ch / 2 - qs / 2 - u * 3, qs, 'https://' + C.url);
  c.t('Admit one', px, cy + ch / 2 + qs / 2 - u * 1, stubW, u * 2.6, { align: 'center', upper: true, ls: .2, weight: 700 });
});

def('collage', 'Tilted Collage', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const s = wide ? H * .5 : Math.min(W * .42, H * .3);
  const ox = wide ? W * .52 : W / 2 - s * .95, oy = wide ? H * .14 : m + u * 2;
  [[0, 0, -7], [s * .7, s * .28, 5], [s * .22, s * .72, -2]].forEach(([dx, dy, rot], i) => c.i(ox + dx, oy + dy, s, s, { rot, border: P.surface, borderW: u * 1.2, shadow: true, label: 'Photo ' + (i + 1) }));
  if (wide) {
    const w = W * .44 - m;
    const k = c.kick(m, 0, w); const sb = c.t(C.sub, m, 0, w, u * 3.3, { color: P.muted });
    const hd = c.hd(C.title, m, 0, w, u * 13, 3, H - 2 * m - k.h - sb.h - u * 8);
    c.vstack([k, hd, sb], [u * 3, u * 4], m, H - m);
  } else {
    const top = oy + s * 1.72 + u * 6, w = W - 2 * m;
    const k = c.kick(m, 0, w); const sb = c.t(C.sub, m, 0, w, u * 3.3, { color: P.muted });
    const hd = c.hd(C.title, m, 0, w, u * 11, 3, H - m - top - k.h - sb.h - u * 6);
    c.vstack([k, hd, sb], [u * 2.5, u * 3], top, H - m);
  }
}, { photo: true });

def('highlight', 'Highlighter', 'tsp', A3, c => {
  const { W, H, u, m, P, C, F } = c;
  const w = W - 2 * m;
  const lines = splitLines(C.title, c.cls === 'wide' ? 3 : 3);
  const wf = F.wf * (F.upper ? 1.26 : 1.05) + F.track;
  const size = Math.min(...lines.map(l => fitSize(l, w * .92, u * 14, 1, u * 16, wf, F.lh)));
  const k = c.kick(m, 0, w);
  const els = lines.map(l => c.t(l, m, 0, w, size, { f: 'd', bg: P.accent, color: P.onAccent, lh: 1.12 }));
  const s = c.t(C.sub, m, 0, Math.min(w, u * 75), u * 3.4, { color: P.muted });
  c.vstack([k, ...els, s], [u * 4, ...els.map((_, i) => i === els.length - 1 ? u * 5 : u * .6)], m, H - m - u * 6);
  c.t(C.handle, m, H - m - u * 3, w, u * 2.8, { weight: 700 });
});

def('swiss', 'Swiss Grid', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const cols = 4, cw = (W - 2 * m) / cols;
  for (let i = 1; i < cols; i++) c.r(m + i * cw, m, Math.max(1, u * .12), H - 2 * m, { fill: P.line, name: 'Grid line' });
  c.r(m, m, W - 2 * m, Math.max(1, u * .12), { fill: P.ink, name: 'Rule' });
  const st = c.hd(C.stat[0], m, m + u * 3, cw * 2.6, u * 34, 1, H * .32, { color: P.hi, upper: false, lh: .9 });
  c.t(C.stat[1], m + cw * 3, m + u * 3, cw - u * 2, u * 2.8, { weight: 700 });
  const my = st.y + st.h + u * 6;
  C.items.slice(0, 3).forEach((it, i) => { c.t(String(i + 1).padStart(2, '0'), m + (i + 1) * cw + u * 1.5, my, cw - u * 3, u * 2.6, { weight: 700, color: P.hi }); c.t(it, m + (i + 1) * cw + u * 1.5, my + u * 4, cw - u * 3, u * 2.8, {}); });
  const hd = c.hd(C.title, m, 0, W - 2 * m, u * 12, 3, H * .3, {});
  hd.y = r1(H - m - hd.h);
});

def('bauhaus', 'Bauhaus', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls, rng } = c;
  const wide = cls === 'wide';
  const rw = wide ? W * .5 : W, rh = wide ? H : H * (cls === 'tall' ? .48 : .55); const rx = wide ? W - rw : 0;
  const ncol = wide ? 3 : 4, s = rw / ncol, nrow = Math.max(1, Math.round(rh / s)), sy = rh / nrow;
  const pal = [P.accent, P.accent2, P.ink, P.surface];
  for (let r = 0; r < nrow; r++) for (let q = 0; q < ncol; q++) {
    const x = rx + q * s, y = r * sy; const a = Math.floor(rng() * 4); let b = Math.floor(rng() * 4); if (b === a) b = (a + 1) % 4;
    c.r(x, y, s + .5, sy + .5, { fill: pal[a], name: 'Tile' });
    const kind = Math.floor(rng() * 4);
    if (kind === 0) c.o(x + s * .1, y + sy * .1, s * .8, sy * .8, { fill: pal[b], name: 'Circle' });
    else if (kind === 1) c.s('quarter', x, y, s, sy, { fill: pal[b], rot: 90 * Math.floor(rng() * 4), name: 'Quarter' });
    else if (kind === 2) c.s('half', x, y + sy * .25, s, sy * .5, { fill: pal[b], rot: 180 * Math.floor(rng() * 2), name: 'Half' });
  }
  const x = m, w = wide ? W - rw - 2 * m : W - 2 * m, top = wide ? m : rh + u * 7;
  const k = c.kick(x, 0, w); const s2 = c.t(C.sub, x, 0, w, u * 3.3, { color: P.muted });
  const hd = c.hd(C.title, x, 0, w, u * 13, 3, H - m - top - k.h - s2.h - u * 7);
  c.vstack([k, hd, s2], [u * 2.5, u * 3.5], top, H - m);
});

def('episode', 'Episode', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls, rng } = c; const wide = cls === 'wide';
  const cs = wide ? H - 2 * m : Math.min(W * .56, H * .4);
  const cx = wide ? m : W / 2 - cs / 2;
  c.i(cx, m, cs, cs, { radius: u * 2, label: 'Cover art' });
  const x = wide ? cx + cs + u * 7 : m, w = wide ? W - x - m : W - 2 * m, top = wide ? m : m + cs + u * 6;
  const b = c.btn(C.ep, x, 0, u * 3, { fill: P.accent, upper: true, square: true });
  const gst = c.t('with ' + C.author, x, 0, w, u * 3.4, { weight: 600, color: P.muted });
  const n = 36, bw = w / n; const wv = { h: u * 10, set y(v) { this._y = v; } };
  const hd = c.hd(C.title, x, 0, w, u * 12, 3, H - m - top - b.h - gst.h - wv.h - u * 14);
  c.vstack([b, hd, gst, wv], [u * 3, u * 2, u * 5], top, H - m);
  for (let i = 0; i < n; i++) { const hh = u * (2 + 8 * Math.abs(Math.sin(i * .7 + rng() * 2)) * (0.5 + rng() * .5)); c.r(x + i * bw, wv._y + (u * 10 - hh) / 2, bw * .55, hh, { fill: i < n * .4 ? P.hi : P.line, radius: bw * .27, name: 'Wave' }); }
}, { photo: true });

def('tags', 'Tags & CTA', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const d = Math.min(W, H) * .7; c.s('quarter', W - d, H - d, d, d, { fill: P.accent, rot: 180, name: 'Quarter' });
  c.o(W - d * .55, H - d * .55, d * .22, d * .22, { fill: P.accent2, name: 'Dot' });
  const w = W - 2 * m - d * .25;
  const k = c.kick(m, m, w);
  const hd = c.hd(C.title, m, m + k.h + u * 3, w, u * 13, 3, H * .36);
  const ph = c.pills(C.tags, m, hd.y + hd.h + u * 6, w, u * 2.8);
  const s = c.t(C.sub, m, hd.y + hd.h + u * 9 + ph, Math.min(w, u * 60), u * 3.2, { color: P.muted });
  c.btn(C.cta, m, s.y + s.h + u * 5, u * 3.2, { fill: P.ink, color: P.bg });
});

def('before-after', 'Before / After', 'ts', ['wide', 'square'], c => {
  const { W, H, u, m, P, C, cls } = c;
  const top = m, bot = H - m - u * 16; const gw = u * 10;
  const iw = (W - 2 * m - gw) / 2, ih = bot - top;
  c.i(m, top, iw, ih, { radius: u * 1.5, label: C.vs[0], tint: mix(P.ink, P.bg, .7) });
  c.i(m + iw + gw, top, iw, ih, { radius: u * 1.5, label: C.vs[1], tint: P.tint });
  c.s('arrow', W / 2 - gw * .38, top + ih / 2 - gw * .3, gw * .76, gw * .6, { fill: P.accent, name: 'Arrow' });
  c.btn(C.vs[0], m + u * 3, top + u * 3, u * 2.6, { fill: P.bg, color: P.ink, upper: true });
  c.btn(C.vs[1], m + iw + gw + u * 3, top + u * 3, u * 2.6, { fill: P.accent, upper: true });
  const hd = c.hd(C.short, m, 0, W - 2 * m, u * 10, 1, u * 11, { align: 'center' });
  hd.y = r1(H - m - hd.h);
}, { photo: true });

def('recipe', 'Info Card', 'sp', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  const tall = c.cls === 'tall', ih = H * (tall ? .42 : .34); c.i(0, 0, W, ih, { label: 'Photo' });
  c.sticker(C.badge, W - m - u * 9, ih, u * 18, { fill: P.accent, rot: -10 });
  const k = c.kick(m, ih + u * (tall ? 6 : 4), W - 2 * m - u * 20);
  const hd = c.hd(C.title, m, k.y + k.h + u * 2, W - 2 * m, u * 9, 2, H * (tall ? .16 : .12));
  // The list and the stat share what is left above the footer line.
  const top = hd.y + hd.h + u * 5, bot = H - m - u * 5; const cw = (W - 2 * m - u * 6) / 2;
  const step = Math.min(u * 8.5, (bot - top) / 4), ts = Math.min(u * 3.1, step * .36);
  C.items.slice(0, 4).forEach((it, i) => { const y = top + i * step; c.o(m, y + ts * .4, ts * .58, ts * .58, { fill: P.accent, name: 'Bullet' }); c.t(it, m + u * 4, y, cw - u * 4, ts, {}); });
  const st = c.t(C.stat[0], m + cw + u * 6, top - u * 1, cw, Math.min(u * 12, (bot - top - u * 5) * .75), { f: 'd', upper: false, color: P.hi });
  c.t(C.stat[1], m + cw + u * 6, st.y + st.h + u, cw, u * 3, { weight: 600, color: P.muted });
  c.t(C.handle + '  ·  ' + C.url, m, H - m - u * 3, W - 2 * m, u * 2.8, { color: P.muted, weight: 600 });
}, { photo: true });

/* banners */
def('banner-type', 'Banner Type', 'b', ['banner'], c => {
  const { W, H, u, m, P, C } = c; const mm = u * 12;
  const d = H * .72, cx = W * .8;
  const w = Math.min(W * .58, cx - d * .9 - mm - u * 3);
  const s = c.t(C.sub, mm, 0, w, u * 6, { color: P.muted });
  const hd = c.hd(C.title, mm, 0, w, u * 26, 2, H - 2 * mm - s.h - u * 6);
  c.vstack([hd, s], [u * 5], mm, H - mm);
  c.o(cx - d * .9, H / 2 - d / 2, d, d, { fill: P.accent, name: 'Circle' });
  c.o(cx - d * .35, H / 2 - d / 2, d, d, { fill: P.accent2, op: .9, name: 'Circle' });
  c.o(cx + d * .2, H / 2 - d / 2, d, d, { fill: null, stroke: P.ink, sw: u * 1, name: 'Ring' });
  c.t(C.handle, W - mm - W * .3, H - mm - u * 6, W * .3, u * 5.5, { align: 'right', weight: 700 });
});
def('banner-photo', 'Banner Photo', 'b', ['banner'], c => {
  const { W, H, u, P, C } = c; const mm = u * 12;
  c.i(W * .56, 0, W * .44, H, { label: 'Photo' });
  c.s('poly', W * .5, 0, W * .14, H, { pts: [[0, 0], [1, 0], [.45, 1], [0, 1]], fill: P.accent, name: 'Slant' });
  c.r(0, 0, W * .5 + 1, H, { fill: P.accent, name: 'Block' });
  const w = W * .48 - mm;
  const k = c.kick(mm, 0, w, { color: P.onAccent, size: u * 5.5 });
  const hd = c.hd(C.title, mm, 0, w, u * 24, 2, H - 2 * mm - k.h - u * 5, { color: P.onAccent });
  c.vstack([k, hd], [u * 4], mm, H - mm);
}, { photo: true });
def('banner-center', 'Banner Center', 'b', ['banner'], c => {
  const { W, H, u, P, C } = c; const mm = u * 10;
  c.bg(P.accent);
  const cell = H / 4;
  for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { const s = cell * .42; [[mm * .5 + q * cell, 0], [W - mm * .5 - (q + 1) * cell, 1]].forEach(([x]) => c.s('diamond', x + (cell - s) / 2, r * cell + (cell - s) / 2, s, s, { fill: P.onAccent, op: .22, name: 'Pattern' })); }
  const w = W - 2 * (mm + cell * 3);
  const hd = c.hd(C.title, W / 2 - w / 2, 0, w, u * 22, 2, H * .5, { align: 'center', color: P.onAccent });
  const b = c.btn(C.cta, W / 2, 0, u * 5, { anchor: 'center', fill: P.onAccent, color: P.accent });
  c.vstack([hd, b], [u * 6], mm, H - mm);
});
def('banner-bauhaus', 'Banner Tiles', 'b', ['banner'], c => {
  const { W, H, u, P, C, rng } = c; const mm = u * 12;
  const s = H / 2, n = Math.floor((W * .45) / s); const x0 = W - n * s;
  const pal = [P.accent, P.accent2, P.ink, P.surface];
  for (let r = 0; r < 2; r++) for (let q = 0; q < n; q++) { const a = (r + q) % 4, b = (a + 2) % 4; const x = x0 + q * s, y = r * s; c.r(x, y, s + .5, s + .5, { fill: pal[a], name: 'Tile' }); if (rng() > .5) c.s('quarter', x, y, s, s, { fill: pal[b], rot: 90 * Math.floor(rng() * 4), name: 'Quarter' }); else c.o(x + s * .15, y + s * .15, s * .7, s * .7, { fill: pal[b], name: 'Circle' }); }
  const w = x0 - 2 * mm;
  const k = c.kick(mm, 0, w, { size: u * 5.5 });
  const hd = c.hd(C.title, mm, 0, w, u * 24, 2, H - 2 * mm - k.h - u * 5);
  c.vstack([k, hd], [u * 4], mm, H - mm);
});

/* business cards */
def('card-classic', 'Card Classic', 'c', ['wide'], c => {
  const { W, H, u, P, C } = c; const mm = u * 10;
  c.r(0, 0, u * 3, H, { fill: P.accent, name: 'Edge' });
  const g = nid();
  c.o(W - mm - u * 16, mm, u * 16, u * 16, { fill: P.accent, name: 'Mark' }).groupId = g;
  const ini = c.t(C.brand[0], W - mm - u * 16, mm + u * 3.2, u * 16, u * 9, { f: 'd', align: 'center', color: P.onAccent, upper: true, lh: 1 }); ini.groupId = g;
  const nm = c.hd(C.person, mm, mm, W * .6, u * 11, 1, u * 13);
  c.t(C.job, mm, nm.y + nm.h + u * 1.5, W * .6, u * 4.2, { color: P.hi, weight: 700, upper: true, ls: .12 });
  [C.phone, C.email, C.url].forEach((t, i) => c.t(t, mm, H - mm - (3 - i) * u * 7 + u * 2, W - 2 * mm, u * 4.4, { color: i ? P.muted : P.ink }));
});
def('card-split', 'Card Split', 'c', ['wide'], c => {
  const { W, H, u, P, C } = c; const mm = u * 9;
  c.r(0, 0, W * .4, H, { fill: P.accent, name: 'Block' });
  c.hd(C.brand, mm, H / 2 - u * 8, W * .4 - 2 * mm, u * 12, 2, u * 20, { color: P.onAccent, align: 'center' }).y = r1(H / 2 - u * 7);
  const x = W * .4 + mm, w = W * .6 - 2 * mm;
  const nm = c.hd(C.person, x, 0, w, u * 9, 1, u * 11);
  const jb = c.t(C.job, x, 0, w, u * 4, { color: P.muted });
  const ln = c.r(x, 0, u * 10, u * .6, { fill: P.accent });
  const ls = [C.phone, C.email, C.url].map(t => c.t(t, x, 0, w, u * 4, {}));
  c.vstack([nm, jb, ln, ...ls], [u * 1, u * 5, u * 5, u * 1.5, u * 1.5], mm, H - mm);
});
def('card-qr', 'Card QR', 'c', ['wide'], c => {
  const { W, H, u, P, C } = c; const mm = u * 10;
  c.bg(P.ink === '#111111' || P.bg !== '#FFFFFF' ? P.bg : P.bg);
  const qs = H - 2 * mm - u * 10;
  c.r(W - mm - qs - u * 4, mm, qs + u * 8, qs + u * 8 + u * 4, { fill: P.surface, radius: u * 2, name: 'QR panel' });
  c.q(W - mm - qs, mm + u * 4, qs, 'https://' + C.url, { fg: P.ink, bg: P.surface });
  const w = W - 3 * mm - qs - u * 8;
  const k = c.kick(mm, 0, w, { text: C.brand });
  const nm = c.hd(C.person, mm, 0, w, u * 10, 2, u * 22);
  const jb = c.t(C.job, mm, 0, w, u * 4, { color: P.muted });
  const em = c.t(C.email, mm, 0, w, u * 4, { weight: 600 });
  c.vstack([k, nm, jb, em], [u * 3, u * 1, u * 8], mm, H - mm);
});

/* ---------- pages, decks & documents ---------- */
// Multi-page layouts read c.page / c.pages so a section divider numbers itself and a
// carousel point picks the right item; on a single page they fall back to page 1.
const pageNo = c => (c.pages > 1 ? `${c.page + 1} / ${c.pages}` : '');
const footer = (c, left, o = {}) => {
  const { W, H, u, m, P } = c; const x = o.x ?? m;
  if (left) c.t(left, x, H - m - u * 3.2, W * .5, u * 3, { color: o.color || P.muted, weight: 600 });
  const pn = pageNo(c); if (pn) c.t(pn, W - m - u * 14, H - m - u * 3.2, u * 14, u * 3, { align: 'right', color: o.color || P.muted });
};
const nthItem = c => c.C.items[(Math.max(1, c.page) - 1) % c.C.items.length];

def('title-slide', 'Title Slide', 'dsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const strip = cls === 'tall' ? 0 : u * 6;
  if (strip) c.r(0, 0, strip, H, { fill: P.accent, name: 'Edge' });
  const x = m + strip, w = W - x - m;
  c.t(C.brand, x, m, w / 2, u * 3.2, { weight: 700, upper: true, ls: .12 });
  c.t(C.date[2], x + w / 2, m, w / 2, u * 3.2, { align: 'right', color: P.muted });
  const k = c.kick(x, 0, w);
  const hd = c.hd(C.title, x, 0, w, u * (cls === 'wide' ? 15 : 13), 3, H * .42);
  const s = c.t(C.sub, x, 0, Math.min(w, u * 70), u * 3.6, { color: P.muted });
  c.vstack([k, hd, s], [u * 3, u * 4], m + u * 8, H - m - u * 6);
  c.t(C.person + ' · ' + C.job, x, H - m - u * 3.2, w, u * 3, { color: P.muted });
});

def('agenda', 'Agenda', 'dp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const k = c.kick(m, m, W - 2 * m, { text: C.brand });
  const hd = c.hd('What we’ll cover', m, m + k.h + u * 2.5, cls === 'wide' ? W * .4 : W - 2 * m, u * 11, 2, u * 26);
  if (cls === 'wide') {
    c.t(C.sub, m, hd.y + hd.h + u * 4, W * .38, u * 3.4, { color: P.muted });
    numberedRows(c, C.items.slice(0, 4), W * .5, W * .5 - m, m, H - m - u * 6);
  } else {
    numberedRows(c, C.items.slice(0, 4), m, W - 2 * m, hd.y + hd.h + u * 7, H - m - u * 8);
  }
  footer(c, '');
});

def('section-divider', 'Section Divider', 'dp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.ink);
  const soft = mix(P.bg, P.ink, .3);
  c.r(m, m, u * 14, u * 1.2, { fill: P.accent });
  const num = c.hd(String(c.page || 1).padStart(2, '0'), m, 0, W - 2 * m, u * (cls === 'wide' ? 34 : 30), 1, H * .4, { color: P.accent, upper: false });
  const hd = c.hd(nthItem(c), m, 0, W - 2 * m, u * (cls === 'wide' ? 12 : 10), 3, H * .3, { color: P.bg });
  const s = c.t(C.sub, m, 0, Math.min(W - 2 * m, u * 64), u * 3.4, { color: soft });
  c.vstack([num, hd, s], [u * 2, u * 4], m + u * 6, H - m - u * 6);
  footer(c, C.brand, { color: soft });
});

def('two-column', 'Two Column', 'dp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const k = c.kick(m, m, W - 2 * m);
  const hd = c.hd(C.title, m, m + k.h + u * 2.5, cls === 'tall' ? W - 2 * m : W * .62, u * 9, 2, u * 22);
  const top = hd.y + hd.h + u * 6, bot = H - m - u * 7;
  c.r(m, top - u * 3, W - 2 * m, u * .3, { fill: P.line, name: 'Rule' });
  const body = C.sub + '\n\n' + C.quote;
  if (cls === 'tall') {
    const p = c.t(body, m, top, W - 2 * m, u * 3.4, { lh: 1.5 });
    numberedRows(c, C.items.slice(0, 3), m, W - 2 * m, p.y + p.h + u * 6, bot, { check: true, d: 6, size: 3.3 });
  } else {
    const cw = (W - 2 * m - u * 6) / 2;
    c.t(body, m, top, cw, u * 3.4, { lh: 1.5 });
    numberedRows(c, C.items.slice(0, 4), m + cw + u * 6, cw, top, bot, { check: true, d: 6, size: 3.3 });
  }
  footer(c, C.brand);
});

def('closing', 'Closing', 'dsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.accent);
  const w = W - 2 * m;
  const k = c.kick(m, 0, w, { align: 'center', color: P.onAccent, text: C.brand });
  const hd = c.hd(C.cta, m, 0, w, u * (cls === 'wide' ? 16 : 14), 3, H * .38, { align: 'center', color: P.onAccent });
  const s = c.t(C.sub, m + w * .1, 0, w * .8, u * 3.6, { align: 'center', color: P.onAccent });
  const b = c.btn(C.url, W / 2, 0, u * 3.4, { anchor: 'center', fill: P.onAccent, color: P.accent });
  c.vstack([k, hd, s, b], [u * 3, u * 4, u * 6], m, H - m - u * 7);
  c.t(C.handle + '  ·  ' + C.email, m, H - m - u * 3.2, w, u * 3, { align: 'center', color: P.onAccent, weight: 600 });
});

def('carousel-hook', 'Swipe Hook', 'sd', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  c.t(C.brand, m, m, W * .6, u * 3.2, { weight: 700, upper: true, ls: .12 });
  const pn = pageNo(c); if (pn) c.t(pn, W - m - u * 14, m, u * 14, u * 3.2, { align: 'right', color: P.muted, weight: 600 });
  const hd = c.hd(C.title, m, 0, W - 2 * m, u * 17, 4, H * .5);
  const s = c.t(C.sub, m, 0, W - 2 * m - u * 10, u * 3.6, { color: P.muted });
  c.vstack([hd, s], [u * 4], m + u * 8, H - m - u * 12);
  const b = c.btn('Swipe →', W - m, H - m - u * 8.5, u * 3, { anchor: 'right' });
  c.t(C.handle, m, b.y + (b.h - u * 3 * 1.35) / 2, W * .5, u * 3, { weight: 700 });
});

def('carousel-point', 'Carousel Point', 'sd', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const n = Math.max(1, c.page);
  c.t(C.brand, m, m, W * .6, u * 3.2, { weight: 700, upper: true, ls: .12 });
  const pn = pageNo(c); if (pn) c.t(pn, W - m - u * 14, m, u * 14, u * 3.2, { align: 'right', color: P.muted, weight: 600 });
  const num = c.hd(String(n).padStart(2, '0'), m, 0, W - 2 * m, u * (cls === 'wide' ? 30 : 26), 1, H * .3, { color: P.hi, upper: false });
  const hd = c.hd(nthItem(c), m, 0, cls === 'wide' ? W * .7 : W - 2 * m, u * (cls === 'wide' ? 12 : 11), 3, H * .3);
  const s = c.t(C.sub, m, 0, Math.min(W - 2 * m, u * 64), u * 3.4, { color: P.muted });
  c.vstack([num, hd, s], [u * 1, u * 4], m + u * 6, H - m - u * 10);
  if (c.pages > 1) { const d = u * 1.6, gap = u * 1.2; for (let i = 0; i < c.pages; i++) c.o(m + i * (d + gap), H - m - d - u * .6, d, d, { fill: i === c.page ? P.accent : P.line, name: 'Progress' }); }
  c.t(C.handle, W / 2, H - m - u * 3.2, W / 2 - m, u * 3, { align: 'right', weight: 700 });
});

def('photo-caption', 'Photo & Caption', 'dp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    c.i(0, 0, W * .58, H, { label: 'Photo' });
    const x = W * .58 + m, w = W - x - m;
    const k = c.kick(x, 0, w); const hd = c.hd(nthItem(c), x, 0, w, u * 10, 4, H * .4); const s = c.t(C.sub, x, 0, w, u * 3.4, { color: P.muted });
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m - u * 6);
    footer(c, '', { x });
  } else {
    const ih = H * .6; c.i(0, 0, W, ih, { label: 'Photo' });
    const k = c.kick(m, 0, W - 2 * m); const hd = c.hd(nthItem(c), m, 0, W - 2 * m, u * 10, 3, H * .2); const s = c.t(C.sub, m, 0, W - 2 * m, u * 3.4, { color: P.muted });
    c.vstack([k, hd, s], [u * 2.5, u * 3], ih + u * 6, H - m - u * 6);
    footer(c, C.brand);
  }
}, { photo: true });

def('pricing', 'Pricing', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const k = c.kick(m, m, W - 2 * m, { align: 'center' });
  const hd = c.hd(C.title, m, m + k.h + u * 2.5, W - 2 * m, u * 10, 2, u * 22, { align: 'center' });
  const items = C.menu.slice(0, cls === 'square' ? 3 : 4), n = items.length, horiz = cls !== 'tall';
  const top = hd.y + hd.h + u * 8, bot = H - m - u * 8, gap = u * 3;
  const cw = horiz ? (W - 2 * m - gap * (n - 1)) / n : W - 2 * m;
  const ch = horiz ? bot - top : (bot - top - gap * (n - 1)) / n;
  items.forEach(([name, price], i) => {
    const hi = i === Math.min(1, n - 1), g = nid();
    const x = horiz ? m + i * (cw + gap) : m, y = horiz ? top : top + i * (ch + gap);
    const col = hi ? P.onAccent : P.onSurface, mut = hi ? P.onAccent : mix(P.onSurface, P.surface, .35);
    c.r(x, y, cw, ch, { fill: hi ? P.accent : P.surface, radius: u * 2.5, name: 'Plan' }).groupId = g;
    const nm = c.t(name, x + u * 3, y + u * 3.5, cw - u * 6, u * 3.2, { weight: 700, upper: true, ls: .1, color: col }); nm.groupId = g;
    const pr = c.hd(price, x + u * 3, nm.y + nm.h + u * 1.5, cw - u * 6, u * (horiz ? 9 : 8), 1, u * 12, { color: col, upper: false }); pr.groupId = g;
    c.t(C.items[i % C.items.length], x + u * 3, pr.y + pr.h + u * 2, cw - u * 6, u * 2.9, { color: mut }).groupId = g;
  });
  c.t(C.url, m, H - m - u * 3.2, W - 2 * m, u * 3, { align: 'center', color: P.muted, weight: 600 });
});

def('contact', 'Contact', 'dp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.surface);
  const wide = cls === 'wide', w = wide ? W * .5 - m : W - 2 * m;
  const qs = wide ? Math.min(H * .5, W * .3) : u * 22;
  const k = c.kick(m, 0, w, { text: 'Get in touch', color: P.hi });
  const hd = c.hd(C.brand, m, 0, w, u * 13, 2, u * 30, { color: P.onSurface });
  const rows = [['Email', C.email], ['Phone', C.phone], ['Web', C.url], ['Visit', C.place]].map(([l, v]) => {
    const g = nid();
    const a = c.t(l, m, 0, u * 14, u * 2.8, { weight: 700, upper: true, ls: .12, color: mix(P.onSurface, P.surface, .35) });
    const b = c.t(v, m + u * 16, 0, w - u * 16, u * 3.6, { color: P.onSurface, weight: 600 });
    a.groupId = b.groupId = g;
    return { h: b.h, set y(y) { a.y = r1(y + u * .4); b.y = r1(y); } };
  });
  c.vstack([k, hd, ...rows], [u * 3, u * 7, u * 2.2, u * 2.2, u * 2.2], m, wide ? H - m : H - m - qs - u * 4);
  c.q(W - m - qs, wide ? H / 2 - qs / 2 : H - m - qs, qs, 'https://' + C.url, { fg: P.onSurface, bg: P.surface });
});

def('resume', 'Résumé', 'p', ['tall'], c => {
  const { W, H, u, m, P, C } = c; const w = W - 2 * m;
  const nm = c.hd(C.person, m, m, w * .62, u * 11, 2, u * 16, { upper: false });
  c.t(C.job, m, nm.y + nm.h + u * 1.5, w * .62, u * 4, { color: P.hi, weight: 700, upper: true, ls: .1 });
  [C.email, C.phone, C.place].forEach((t, i) => c.t(t, W - m - w * .34, m + i * u * 4.2, w * .34, u * 3, { align: 'right', color: i ? P.muted : P.ink }));
  let y = m + u * 24;
  c.r(m, y, w, u * .35, { fill: P.ink, name: 'Rule' }); y += u * 4;
  const section = label => { const t = c.t(label, m, y, w, u * 2.8, { weight: 700, upper: true, ls: .14, color: P.hi }); y += t.h + u * 2.5; };
  section('Profile');
  const p = c.t(C.sub, m, y, w, u * 3.3, { lh: 1.5 }); y += p.h + u * 5;
  section('Experience');
  C.items.slice(0, 3).forEach((it, i) => {
    const t = c.t(it, m, y, w * .66, u * 3.6, { weight: 700 });
    c.t(C.brand, m, y + t.h + u * .4, w * .66, u * 3, { color: P.muted });
    c.t(`${2024 - i * 2} – ${i ? 2026 - i * 2 : 'Present'}`, W - m - w * .3, y, w * .3, u * 3, { align: 'right', color: P.muted });
    y += t.h + u * 8.5;
  });
  y += u;
  section('Skills');
  c.pills(C.tags, m, y, w, u * 2.8);
});

def('letterhead', 'Letterhead', 'p', ['tall'], c => {
  const { W, H, u, m, P, C } = c; const w = W - 2 * m;
  c.r(0, 0, W, u * 2.2, { fill: P.accent, name: 'Band' });
  const b = c.hd(C.brand, m, m + u * 2, w * .5, u * 7, 1, u * 9, { upper: false });
  [C.url, C.email, C.phone].forEach((t, i) => c.t(t, W - m - w * .4, m + u * 2 + i * u * 3.8, w * .4, u * 2.8, { align: 'right', color: i ? P.muted : P.ink }));
  c.r(m, b.y + b.h + u * 5, w, u * .3, { fill: P.line, name: 'Rule' });
  let y = b.y + b.h + u * 12;
  const d = c.t(C.date[2], m, y, w, u * 3.2, { color: P.muted }); y += d.h + u * 5;
  const g = c.t('Dear ' + C.author.split(' ')[0] + ',', m, y, w, u * 3.4, {}); y += g.h + u * 4;
  const p = c.t(C.sub + '\n\n' + C.quote + '\n\n' + C.items.join(' · ') + '.', m, y, w, u * 3.4, { lh: 1.55 }); y += p.h + u * 6;
  c.t('Warmly,', m, y, w, u * 3.4, {}); y += u * 9;
  c.t(C.person, m, y, w, u * 3.6, { weight: 700 });
  c.t(C.job + ' · ' + C.brand, m, y + u * 4.4, w, u * 3, { color: P.muted });
  c.t(C.place + '  ·  ' + C.url, m, H - m - u * 3, w, u * 2.8, { align: 'center', color: P.muted });
});

def('label', 'Product Label', 'p', ['square', 'wide'], c => {
  const { W, H, u, m, P, C, cls } = c; const inset = u * 4;
  c.r(inset, inset, W - 2 * inset, H - 2 * inset, { fill: null, stroke: P.ink, sw: u * .6, radius: u * 1.5, name: 'Border' });
  c.r(inset + u * 1.5, inset + u * 1.5, W - 2 * inset - u * 3, H - 2 * inset - u * 3, { fill: null, stroke: P.ink, sw: u * .25, radius: u, name: 'Inner border' });
  const x = m + u * 2, w = W - 2 * x;
  const b = c.t(C.brand, x, 0, w, u * 3.2, { align: 'center', weight: 700, upper: true, ls: .2 });
  const hd = c.hd(C.word, x, 0, w, u * (cls === 'wide' ? 22 : 20), 1, H * .35, { align: 'center' });
  const s = c.t(C.short, x, 0, w, u * 3.6, { align: 'center', color: P.muted });
  const ln = c.r(W / 2 - u * 6, 0, u * 12, u * .5, { fill: P.accent });
  const pr = c.t(C.price ? C.price + '  ·  ' + C.ep : C.ep, x, 0, w, u * 3, { align: 'center', weight: 700, upper: true, ls: .12 });
  c.vstack([b, hd, s, ln, pr], [u * 3, u * 2.5, u * 3.5, u * 3.5], m + u * 2, H - m - u * 2);
});

def('badge', 'Name Badge', 'p', ['wide', 'square'], c => {
  const { W, H, u, m, P, C } = c; const bh = H * .26, w = W - 2 * m;
  c.r(0, 0, W, bh, { fill: P.accent, name: 'Band' });
  c.t(C.brand, m, bh / 2 - u * 2, W * .6, u * 3.6, { weight: 700, upper: true, ls: .14, color: P.onAccent });
  c.t(C.date[2], W - m - W * .35, bh / 2 - u * 1.8, W * .35, u * 3.2, { align: 'right', color: P.onAccent });
  const hello = c.t('Hello, my name is', m, 0, w, u * 3.4, { align: 'center', color: P.muted });
  const nm = c.hd(C.person, m, 0, w, u * 16, 2, H * .36, { align: 'center', upper: false });
  const jb = c.t(C.job + ' · ' + C.place, m, 0, w, u * 3.4, { align: 'center', color: P.hi, weight: 700 });
  c.vstack([hello, nm, jb], [u * 2, u * 2.5], bh + u * 4, H - m);
});

/* ---------- photo-first layouts ---------- */
// Text on an unknown photo always sits on a scrim, a band or a solid shape (spec §6).
const onScrim = P => (contrast(P.accent, P.ink) >= 3 ? P.accent : P.bg);

def('hero-photo', 'Hero Photo', 'tsdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.i(0, 0, W, H, { label: 'Full-bleed photo' });
  const sh = cls === 'wide' ? H * .5 : H * .42;
  c.r(0, H - sh, W, sh, { fill: P.ink, op: .62, name: 'Scrim' });
  const w = cls === 'wide' ? W * .6 : W - 2 * m, top = H - sh + u * 4, bot = H - m;
  const k = c.kick(m, 0, w, { color: onScrim(P) });
  // The heading gets whatever the band has left once the fixed parts are placed, so
  // the button never runs off the page on a wide format.
  const s = c.t(C.sub, m, 0, Math.min(w, u * 70), u * 3.3, { color: mix(P.bg, P.ink, .15) });
  const b = c.btn(C.cta, m, 0, u * 3, { fill: P.accent, color: P.onAccent });
  const hd = c.hd(C.title, m, 0, w, u * (cls === 'wide' ? 14 : 12), 3, Math.max(u * 7, bot - top - k.h - s.h - b.h - u * 8.5), { color: P.bg });
  c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(s), 0, hd);
  c.vstack([k, hd, s, b], [u * 2.2, u * 2.8, u * 3.5], top, bot);
}, { photo: true });

def('photo-duo', 'Two Photos', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const g = u * 2.5;
  if (cls === 'wide') {
    const pw = W * .28; c.i(W - m - pw * 2 - g, m, pw, H - 2 * m, { label: 'Photo 1', mask: 'rounded' }); c.i(W - m - pw, m, pw, H - 2 * m, { label: 'Photo 2', mask: 'rounded' });
    const w = W - 2 * m - pw * 2 - g - u * 6;
    const k = c.kick(m, 0, w); const hd = c.hd(C.title, m, 0, w, u * 13, 4, H * .45); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, m, 0, u * 3);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const ph = H * (cls === 'tall' ? .46 : .48), pw = (W - 2 * m - g) / 2;
    c.i(m, m, pw, ph, { label: 'Photo 1', mask: 'rounded' }); c.i(m + pw + g, m, pw, ph, { label: 'Photo 2', mask: 'rounded' });
    const top = m + ph + u * 6, w = W - 2 * m;
    const k = c.kick(m, 0, w); const hd = c.hd(C.title, m, 0, w, u * 11, 3, H - top - m - u * 20); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, m, 0, u * 3);
    c.vstack([k, hd, s, b], [u * 2.5, u * 3, u * 4.5], top, H - m);
  }
}, { photo: true });

def('offset-frame', 'Offset Frame', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const pw = wide ? W * .42 : W - 2 * m - u * 5, ph = wide ? H - 2 * m - u * 5 : H * (cls === 'tall' ? .46 : .42);
  const px = wide ? W - m - pw - u * 4 : m, py = m;
  c.r(px + u * 4, py + u * 4, pw, ph, { fill: P.accent, name: 'Offset' });
  c.i(px, py, pw, ph, { label: 'Photo', border: P.ink, borderW: u * .5 });
  const w = wide ? px - m - u * 8 : W - 2 * m, top = wide ? m : py + ph + u * 10;
  const k = c.kick(m, 0, w); const hd = c.hd(C.title, m, 0, w, u * (wide ? 13 : 11), 4, wide ? H * .5 : H - top - m - u * 16); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.muted });
  const hn = c.t(C.handle, m, 0, w, u * 3, { weight: 700 });
  c.vstack([k, hd, s, hn], [u * 3, u * 4, u * 5], top, H - m);
}, { photo: true });

def('cutout-stage', 'Cutout Stage', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const d = wide ? H * .8 : Math.min(W * .74, H * .46);
  const cx = wide ? W - m - d * .62 : W / 2, cy = wide ? H / 2 : m + d * .62;
  c.o(cx - d / 2, cy - d / 2, d, d, { fill: P.accent, name: 'Stage' });
  c.o(cx - d * .62, cy - d * .62, d * 1.24, d * 1.24, { fill: null, stroke: P.accent, sw: u * .35, dash: true, name: 'Ring' });
  c.i(cx - d * .4, cy - d * .55, d * .8, d * 1.02, { label: 'Cutout · remove background', tint: mix(P.accent, P.bg, .35) });
  c.sticker(C.badge, cx + d * .42, cy - d * .42, u * 15, { fill: P.accent2, color: P.onAccent2, rot: 12 });
  if (wide) {
    const w = cx - d * .62 - m - u * 4;
    const k = c.kick(m, 0, w); const hd = c.hd(C.title, m, 0, w, u * 15, 4, H * .5); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, m, 0, u * 3.2);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const top = cy + d * .62 + u * 4, w = W - 2 * m;
    const k = c.kick(m, 0, w, { align: 'center' }); const hd = c.hd(C.title, m, 0, w, u * 11, 3, H - top - m - u * 16, { align: 'center' }); const b = c.btn(C.cta, W / 2, 0, u * 3.2, { anchor: 'center' });
    c.vstack([k, hd, b], [u * 2.5, u * 4], top, H - m);
  }
}, { photo: true });

def('photo-quote', 'Photo Quote', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls, F } = c; const wide = cls === 'wide';
  const pw = wide ? W * .45 : W, ph = wide ? H : H * .5;
  c.i(0, 0, pw, ph, { label: 'Photo' });
  const x = wide ? pw + m : m, w = wide ? W - pw - 2 * m : W - 2 * m, top = wide ? m : ph + m, bot = H - m;
  const a = c.t(C.author, x, 0, w, u * 3.4, { weight: 700 }); const r = c.t(C.role || C.brand, x, 0, w, u * 3, { color: P.muted });
  const ln = c.r(x, 0, u * 10, u * .8, { fill: P.accent });
  const q = c.hd(C.quote, x, 0, w, u * (wide ? 7.5 : 7), 6, Math.max(u * 6, Math.min((bot - top) * .55, bot - top - u * 14 - a.h - r.h - ln.h - u * 7.6)), { upper: false, lh: 1.15 });
  c.els.splice(c.els.indexOf(q), 1); c.els.splice(c.els.indexOf(a), 0, q);
  c.vstack([q, ln, a, r], [u * 4, u * 3, u * .6], top + u * 14, bot);
  // Drawn last: its box overlaps the heading's corner, and on top it stays clickable.
  c.t('“', x - u, top - u * 4, u * 20, u * 26, { f: 'd', font: F.display === 'Anton' || F.upper ? 'Playfair Display' : F.display, color: P.hi, lh: 1, upper: false, name: 'Quote mark' });
}, { photo: true });

def('photo-stat', 'Photo & Stat', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const pw = wide ? W * .5 : W, ph = wide ? H : H * (cls === 'tall' ? .46 : .4);
  c.i(wide ? W - pw : 0, 0, pw, ph, { label: 'Photo' });
  const w = wide ? W - pw - 2 * m : W - 2 * m, top = wide ? m : ph + m * .8, bot = H - m;
  const k = c.kick(m, 0, w);
  const sl = c.t(C.stat[1], m, 0, w, u * 3.8, { weight: 700 });
  const s = c.hd(C.sub, m, 0, w, u * 3.2, 3, u * 14, { f: 'b', color: P.muted, upper: false, ls: 0, lh: 1.35 });
  // The stat number and the heading share what the fixed lines leave.
  const rest = bot - top - k.h - sl.h - s.h - u * 9.5;
  const st = c.hd(C.stat[0], m, 0, w, u * (wide ? 26 : 22), 1, Math.max(u * 6, rest * .6), { color: P.hi, upper: false });
  const hd = c.hd(C.title, m, 0, w, u * 7, 2, Math.max(u * 5, rest - st.h));
  [st, hd].forEach(e => c.els.splice(c.els.indexOf(e), 1)); c.els.splice(c.els.indexOf(sl), 0, st); c.els.splice(c.els.indexOf(s), 0, hd);
  c.vstack([k, st, sl, hd, s], [u * 2, u * 1, u * 4, u * 2.5], top, bot);
}, { photo: true });

def('photo-strip', 'Photo Strip', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const g = u * 2, n = 3;
  const pw = (W - 2 * m - g * (n - 1)) / n;
  if (cls === 'tall') {
    const ph = H * .5;
    for (let i = 0; i < n; i++) c.i(m + i * (pw + g), m, pw, ph, { label: 'Photo ' + (i + 1), mask: 'rounded' });
    const top = m + ph + u * 7, w = W - 2 * m;
    const k = c.kick(m, 0, w); const hd = c.hd(C.title, m, 0, w, u * 12, 3, H - top - m - u * 14); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.muted });
    c.vstack([k, hd, s], [u * 2.5, u * 3.5], top, H - m);
  } else {
    const ph = H * (cls === 'wide' ? .42 : .38);
    for (let i = 0; i < n; i++) c.i(m + i * (pw + g), H - m - ph, pw, ph, { label: 'Photo ' + (i + 1), mask: 'rounded' });
    const w = W - 2 * m, bot = H - m - ph - u * 6;
    const k = c.kick(m, 0, w); const hd = c.hd(C.title, m, 0, cls === 'wide' ? W * .7 : w, u * (cls === 'wide' ? 12 : 11), 2, bot - m - u * 12); const s = c.t(C.sub, m, 0, Math.min(w, u * 70), u * 3.4, { color: P.muted });
    c.vstack([k, hd, s], [u * 2.5, u * 3], m, bot);
  }
}, { photo: true });

def('photo-card', 'Photo Card', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const mut = mix(P.onSurface, P.surface, .3);
  if (cls === 'wide') {
    c.i(0, 0, W, H, { label: 'Full-bleed photo' });
    const cw = W * .46, ch = H - 2 * m, x = m + u * 5, w = cw - u * 10;
    c.r(m, m, cw, ch, { fill: P.surface, radius: u * 3, shadow: true, name: 'Card' });
    const k = c.kick(x, 0, w); const hd = c.hd(C.title, x, 0, w, u * 11, 4, ch * .5, { color: P.onSurface }); const s = c.t(C.sub, x, 0, w, u * 3.3, { color: mut }); const b = c.btn(C.cta, x, 0, u * 3);
    c.vstack([k, hd, s, b], [u * 2.5, u * 3, u * 4], m + u * 5, m + ch - u * 5);
  } else {
    const ph = H * (cls === 'tall' ? .58 : .55);
    c.i(0, 0, W, ph, { label: 'Photo' });
    const cy = ph - u * 8, ch = H - cy - m, x = m + u * 5, w = W - 2 * m - u * 10;
    c.r(m, cy, W - 2 * m, ch, { fill: P.surface, radius: u * 3, shadow: true, name: 'Card' });
    const k = c.kick(x, 0, w); const hd = c.hd(C.title, x, 0, w, u * 10, 3, ch * .45, { color: P.onSurface }); const s = c.t(C.sub, x, 0, w, u * 3.3, { color: mut }); const b = c.btn(C.cta, x, 0, u * 3);
    c.vstack([k, hd, s, b], [u * 2.5, u * 3, u * 4], cy + u * 5, H - m - u * 5);
  }
}, { photo: true });

def('photo-slant', 'Photo Slant', 'ts', ['wide', 'square'], c => {
  const { W, H, u, m, P, C } = c;
  c.i(W * .48, 0, W * .52, H, { label: 'Photo' });
  c.s('poly', W * .42, 0, W * .14, H, { pts: [[0, 0], [1, 0], [.5, 1], [0, 1]], fill: P.accent, name: 'Slant' });
  c.r(0, 0, W * .42 + 1, H, { fill: P.accent, name: 'Block' });
  const w = W * .42 - m - u * 2;
  const k = c.kick(m, 0, w, { color: P.onAccent }); const hd = c.hd(C.title, m, 0, w, u * 14, 4, H * .55, { color: P.onAccent }); const b = c.btn(C.cta, m, 0, u * 3.2, { fill: P.onAccent, color: P.accent });
  c.vstack([k, hd, b], [u * 3, u * 5], m, H - m);
}, { photo: true });

def('feature-grid', 'Feature Grid', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const g = u * 2, wide = cls === 'wide';
  const gw = wide ? W * .55 : W - 2 * m, gh = wide ? H - 2 * m : H * .52, gx = wide ? W - m - gw : m, gy = m;
  const big = wide ? gw * .62 : gh * .62;
  if (wide) {
    c.i(gx, gy, big, gh, { label: 'Photo 1', mask: 'rounded' });
    c.i(gx + big + g, gy, gw - big - g, (gh - g) / 2, { label: 'Photo 2', mask: 'rounded' });
    c.i(gx + big + g, gy + (gh + g) / 2, gw - big - g, (gh - g) / 2, { label: 'Photo 3', mask: 'rounded' });
  } else {
    c.i(gx, gy, gw, big, { label: 'Photo 1', mask: 'rounded' });
    c.i(gx, gy + big + g, (gw - g) / 2, gh - big - g, { label: 'Photo 2', mask: 'rounded' });
    c.i(gx + (gw + g) / 2, gy + big + g, (gw - g) / 2, gh - big - g, { label: 'Photo 3', mask: 'rounded' });
  }
  const w = wide ? gx - m - u * 6 : W - 2 * m, top = wide ? m : gy + gh + u * 6;
  const k = c.kick(m, 0, w); const hd = c.hd(C.title, m, 0, w, u * (wide ? 12 : 10), 3, wide ? H * .45 : H - top - m - u * 14); const s = c.t(C.sub, m, 0, w, u * 3.3, { color: P.muted });
  c.vstack([k, hd, s], [u * 2.5, u * 3.5], top, H - m);
}, { photo: true });

def('photo-list', 'Photo & List', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const pw = wide ? W * .44 : W, ph = wide ? H : H * .4;
  c.i(0, 0, pw, ph, { label: 'Photo' });
  const x = wide ? pw + m : m, w = wide ? W - pw - 2 * m : W - 2 * m, top = wide ? m : ph + m * .8;
  const k = c.kick(x, top, w); const hd = c.hd(C.title, x, k.y + k.h + u * 2, w, u * 9, 2, u * 20);
  numberedRows(c, C.items.slice(0, wide ? 4 : 3), x, w, hd.y + hd.h + u * 6, H - m);
}, { photo: true });

def('banner-hero', 'Banner Hero', 'b', ['banner'], c => {
  const { W, H, u, P, C } = c; const mm = u * 12;
  c.i(0, 0, W, H, { label: 'Full-bleed photo' });
  c.r(0, 0, W * .55, H, { fill: P.ink, op: .7, name: 'Scrim' });
  const w = W * .5 - mm;
  const k = c.kick(mm, 0, w, { color: onScrim(P), size: u * 5.5 });
  const hd = c.hd(C.title, mm, 0, w, u * 24, 2, H - 2 * mm - k.h - u * 5, { color: P.bg });
  c.vstack([k, hd], [u * 4], mm, H - mm);
}, { photo: true });

/* ---------- occasions ---------- */
def('celebration', 'Celebration', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  // The occasion's own scatter keeps to the top and bottom bands so the text stays clean.
  c.scatter(C.decor || 'confetti', [{ x: 0, y: 0, w: W, h: H * .2 }, { x: 0, y: H * .8, w: W, h: H * .2 }]);
  const w = W - 2 * m;
  const k = c.kick(m, 0, w, { align: 'center' });
  const hd = c.hd(C.title, m, 0, w, u * (cls === 'wide' ? 15 : 13), 3, H * .36, { align: 'center' });
  const s = c.t(C.sub, m + w * .1, 0, w * .8, u * 3.4, { align: 'center', color: P.muted });
  const d = c.t(C.date[2] + (C.date[3] ? '  ·  ' + C.date[3] : ''), m, 0, w, u * 3.4, { align: 'center', weight: 700 });
  const pl = c.t(C.place, m, 0, w, u * 3.2, { align: 'center', color: P.muted });
  const b = c.btn(C.cta, W / 2, 0, u * 3.2, { anchor: 'center' });
  c.vstack([k, hd, s, d, pl, b], [u * 3, u * 3.5, u * 5, u * 1, u * 5], m + u * 6, H - m - u * 6);
}, { topics: FESTIVE, noscatter: true });

def('invitation-classic', 'Classic Invitation', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls, F } = c; const inset = u * 5;
  c.r(inset, inset, W - 2 * inset, H - 2 * inset, { fill: null, stroke: P.accent, sw: u * .35, name: 'Frame' });
  c.r(inset + u * 1.2, inset + u * 1.2, W - 2 * inset - u * 2.4, H - 2 * inset - u * 2.4, { fill: null, stroke: P.accent, sw: u * .15, name: 'Inner frame' });
  const w = W - 2 * m - u * 4, x = m + u * 2;
  const mo = C.motifs ? c.motif(C.motifs[0], W / 2 - u * 5, 0, u * 10) : c.s('diamond', W / 2 - u * 1.4, 0, u * 2.8, u * 2.8, { fill: P.accent, name: 'Ornament' });
  const k = c.t(C.kicker, x, 0, w, u * 2.8, { align: 'center', upper: true, ls: .25, weight: 600, color: P.muted });
  const hd = c.hd(C.title, x, 0, w, u * (cls === 'wide' ? 13 : 12), 3, H * .3, { align: 'center', upper: false, lh: 1.05 });
  const s = c.t(C.sub, x + w * .1, 0, w * .8, u * 3.2, { align: 'center', color: P.muted, italic: F.display !== F.body });
  const orn = c.s('diamond', W / 2 - u * 1.4, 0, u * 2.8, u * 2.8, { fill: P.accent, name: 'Ornament' });
  const d = c.t(C.date[2], x, 0, w, u * 3.6, { align: 'center', weight: 700, upper: true, ls: .12 });
  const t = c.t((C.date[3] ? C.date[3] + '  ·  ' : '') + C.place, x, 0, w, u * 3.1, { align: 'center', color: P.muted });
  const r = c.t(C.cta, x, 0, w, u * 2.8, { align: 'center', upper: true, ls: .2, weight: 600, color: P.hi });
  c.vstack([mo, k, hd, s, orn, d, t, r], [u * 3, u * 2.5, u * 3, u * 4, u * 4, u * 1.2, u * 5], m + u * 4, H - m - u * 4);
}, { nogarnish: true, topics: ['wedding', 'engagement', 'anniversary', 'baby', 'graduation', 'eid', 'puja', 'diwali', 'christmas', 'thanksgiving', 'memorial', 'birthday'] });

def('memorial', 'In Memoriam', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.surface);
  const wide = cls === 'wide';
  const d = wide ? H * .5 : Math.min(W * .42, H * .26);
  const cx = wide ? W * .28 : W / 2, cy = wide ? H / 2 : m + u * 6 + d / 2;
  c.o(cx - d / 2 - u * 1.5, cy - d / 2 - u * 1.5, d + u * 3, d + u * 3, { fill: null, stroke: P.accent, sw: u * .3, name: 'Ring' });
  c.i(cx - d / 2, cy - d / 2, d, d, { mask: 'circle', label: 'Portrait' });
  const x = wide ? W * .5 : m, w = wide ? W * .5 - m : W - 2 * m, al = wide ? 'left' : 'center';
  const top = wide ? m : cy + d / 2 + u * 6, bot = H - m - u * 9;
  const k = c.t(C.kicker, x, 0, w, u * 2.8, { align: al, upper: true, ls: .25, weight: 600, color: P.muted });
  const yrs = c.t(C.ep, x, 0, w, u * 3.6, { align: al, color: P.hi, weight: 600, ls: .08 });
  const dt = c.t(C.date[2] + '  ·  ' + C.date[3], x, 0, w, u * 3.1, { align: al, weight: 700 });
  const pl = c.t(C.place, x, 0, w, u * 3, { align: al, color: P.muted });
  // The name and the quote share what is left, so the stack never reaches the dove.
  const rest = bot - top - k.h - yrs.h - dt.h - pl.h - u * 16;
  const nm = c.hd(C.title, x, 0, w, u * (wide ? 10 : 9), 2, Math.max(u * 8, rest * .55), { align: al, upper: false, color: P.onSurface });
  const q = c.hd('“' + C.quote + '”', x + (wide ? 0 : w * .08), 0, wide ? w : w * .84, u * 3.3, 4, Math.max(u * 4, rest - nm.h), { f: 'b', align: al, italic: true, color: mix(P.onSurface, P.surface, .25), lh: 1.5, upper: false, ls: 0 });
  [nm, q].forEach(e => c.els.splice(c.els.indexOf(e), 1)); c.els.splice(c.els.indexOf(yrs), 0, nm); c.els.splice(c.els.indexOf(dt), 0, q);
  c.vstack([k, nm, yrs, q, dt, pl], [u * 2.5, u * 1.5, u * 5, u * 6, u * 1], top, bot);
  c.motif('dove', wide ? W - m - u * 9 : W / 2 - u * 4, wide ? m : H - m - u * 8, u * 8);
}, { topics: ['memorial'], photo: true, nogarnish: true });

def('motif-hero', 'Motif Hero', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const id = (C.motifs || ['sparkle'])[0], size = u * (cls === 'wide' ? 36 : 30), w = W - 2 * m;
  const when = C.date[2] + (C.date[3] ? '  ·  ' + C.date[3] : '');
  if (cls === 'wide') {
    c.motif(id, W - m - size - u * 4, H / 2 - size / 2, size);
    const tw = W - size - 3 * m - u * 4;
    const k = c.kick(m, 0, tw); const s = c.t(C.sub, m, 0, tw, u * 3.4, { color: P.muted }); const d = c.t(when, m, 0, tw, u * 3.2, { weight: 700 }); const b = c.btn(C.cta, m, 0, u * 3.2);
    const hd = c.hd(C.title, m, 0, tw, u * 14, 3, Math.max(u * 6, Math.min(H * .45, H - 2 * m - k.h - s.h - d.h - b.h - u * 14)));
    c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(s), 0, hd);
    c.vstack([k, hd, s, d, b], [u * 3, u * 3, u * 3, u * 5], m, H - m);
  } else {
    const mo = c.motif(id, W / 2 - size / 2, 0, size);
    const k = c.kick(m, 0, w, { align: 'center' }); const s = c.t(C.sub, m + w * .1, 0, w * .8, u * 3.4, { align: 'center', color: P.muted }); const d = c.t(when, m, 0, w, u * 3.2, { align: 'center', weight: 700 }); const b = c.btn(C.cta, W / 2, 0, u * 3.2, { anchor: 'center' });
    // The heading takes what the motif, the lines and the button leave.
    const hd = c.hd(C.title, m, 0, w, u * 12, 3, Math.max(u * 6, Math.min(H * .3, H - 2 * m - mo.h - k.h - s.h - d.h - b.h - u * 19)), { align: 'center' });
    c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(s), 0, hd);
    c.vstack([mo, k, hd, s, d, b], [u * 5, u * 3, u * 3, u * 3, u * 5], m, H - m);
  }
  if (C.decor) c.scatter(C.decor, [{ x: 0, y: 0, w: W, h: H * .14 }, { x: 0, y: H * .86, w: W, h: H * .14 }], c.els.filter(e => e.type === 'text').map(e => bboxOf(e, u * 2)));
}, { topics: OCCASIONS, nogarnish: true });

def('motif-band', 'Motif Border', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const ids = C.motifs || ['sparkle'], sz = u * 7, gap = u * 3, w = W - 2 * m;
  const n = Math.max(3, Math.floor(w / (sz + gap))), x0 = (W - n * sz - (n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) { c.motif(ids[i % ids.length], x0 + i * (sz + gap), m, sz); c.motif(ids[(i + 1) % ids.length], x0 + i * (sz + gap), H - m - sz, sz); }
  c.r(m, m + sz + u * 2.5, w, u * .35, { fill: P.accent, name: 'Rule' });
  c.r(m, H - m - sz - u * 2.85, w, u * .35, { fill: P.accent, name: 'Rule' });
  const k = c.kick(m, 0, w, { align: 'center' }); const hd = c.hd(C.title, m, 0, w, u * (cls === 'wide' ? 14 : 12), 3, H * .32, { align: 'center' }); const s = c.t(C.sub, m + w * .1, 0, w * .8, u * 3.4, { align: 'center', color: P.muted }); const d = c.t(C.date[2] + '  ·  ' + C.place, m, 0, w, u * 3.2, { align: 'center', weight: 700 }); const b = c.btn(C.cta, W / 2, 0, u * 3, { anchor: 'center' });
  c.vstack([k, hd, s, d, b], [u * 3, u * 3, u * 4, u * 5], m + sz + u * 6, H - m - sz - u * 6);
}, { topics: OCCASIONS, nogarnish: true });

// Podcast layouts come last so the layouts before them keep their catalogue index,
// which keeps every existing template's copy pack and type pairing the same.
// A row of audio bars, the podcast signature. `split` is the played-so-far share.
function wave(c, x, y, w, h, n, played, rest, split = .4) {
  const bw = w / n;
  for (let i = 0; i < n; i++) { const hh = h * (.18 + .82 * Math.abs(Math.sin(i * .7 + c.rng() * 2)) * (.5 + c.rng() * .5)); c.r(x + i * bw, y + (h - hh) / 2, bw * .55, hh, { fill: i < n * split ? played : rest, radius: bw * .27, name: 'Wave' }); }
}

def('podcast-guest', 'Host & Guest', 'ts', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  c.bg(P.ink);
  const d = wide ? H * .44 : Math.min(W * .36, H * .26), gap = u * 4;
  const cxR = wide ? W - m - d : W / 2 + gap / 2, cxL = cxR - d - gap, cy = wide ? H / 2 - d / 2 : m + u;
  c.o(cxL - u, cy - u, d + 2 * u, d + 2 * u, { fill: P.accent, name: 'Halo' }); c.i(cxL, cy, d, d, { mask: 'circle', label: 'Host' });
  c.o(cxR - u, cy - u, d + 2 * u, d + 2 * u, { fill: P.accent2, name: 'Halo' }); c.i(cxR, cy, d, d, { mask: 'circle', label: 'Guest' });
  const x = m, w = wide ? cxL - m - u * 4 : W - 2 * m, top = wide ? m : cy + d + u * 6, bot = H - m;
  const b = c.btn(C.ep, x, 0, u * 2.8, { fill: P.accent, color: P.onAccent, upper: true, square: true });
  const g = c.t('with ' + C.author + ' · ' + C.role, x, 0, w, u * 3.2, { color: mix(P.bg, P.ink, .3), weight: 600 });
  const wv = { h: u * 7, set y(v) { this._y = v; } };
  const hd = c.hd(C.title, x, 0, w, u * 10, 3, Math.max(u * 6, (bot - top - b.h - g.h - wv.h - u * 12) * (wide ? .9 : 1)), { color: P.bg, lh: 1.02 });
  c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(g), 0, hd);
  c.vstack([b, hd, g, wv], [u * 3, u * 2.5, u * 4], top, bot, wide ? 'center' : 'top');
  wave(c, x, wv._y, w, wv.h, 30, P.accent, mix(P.bg, P.ink, .75));
  // Stacked under the portraits, the whole group sits centred on the page.
  if (!wide) { const dy = r1((H - (wv._y + wv.h - (cy - u))) / 2 - (cy - u)); c.els.forEach(e => { e.y = r1(e.y + dy); }); }
}, { topics: PODCASTS, every: true, photo: true, nogarnish: true });

def('podcast-play', 'Press Play', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  c.bg(P.accent2);
  const d = wide ? H * .6 : Math.min(W * .46, H * .28), px = wide ? W - m - d : W / 2 - d / 2, py = wide ? H / 2 - d / 2 : m;
  c.o(px, py, d, d, { fill: P.bg, name: 'Play' }); c.s('triangle', px + d * .36, py + d * .3, d * .36, d * .4, { fill: P.ink, rot: 90, name: 'Play icon' });
  const x = m, w = wide ? px - m - u * 5 : W - 2 * m, top = wide ? m : py + d + u * 5, bot = H - m;
  const k = c.kick(x, 0, w, { color: P.onAccent2 });
  const s = c.t(C.sub, x, 0, Math.min(w, u * 70), u * 3.2, { color: mix(P.onAccent2, P.accent2, .2) });
  const pills = { h: u * 6.6, set y(v) { this._y = v; } };
  const hd = c.hd(C.title, x, 0, w, u * (wide ? 12 : 11), 3, Math.max(u * 6, bot - top - k.h - s.h - pills.h - u * 11), { color: P.onAccent2 });
  c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(s), 0, hd);
  c.vstack([k, hd, s, pills], [u * 2.5, u * 2.5, u * 4], top, bot);
  c.pills(['YouTube', 'Spotify', 'Apple Podcasts'], x, pills._y, w, u * 2.4, { fill: P.bg, color: P.ink, stroke: P.bg });
}, { topics: PODCASTS, every: true, photo: true, nogarnish: true });

def('podcast-quote', 'Guest Quote', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const pw = wide ? W * .38 : W, ph = wide ? H : H * .42;
  c.r(wide ? W - pw : 0, 0, pw, ph, { fill: P.accent, name: 'Stage' });
  c.i(wide ? W - pw + u * 3 : m, wide ? u * 6 : 0, wide ? pw - u * 6 : W - 2 * m, wide ? H - u * 6 : ph, { label: 'Cutout — try Remove BG', tint: mix(P.accent, P.bg, .3) });
  const x = m, w = wide ? W - pw - 2 * m - u * 2 : W - 2 * m, top = wide ? m : ph + m * .8, bot = H - m;
  const b = c.btn(C.ep, x, 0, u * 2.6, { fill: P.ink, color: P.bg, upper: true, square: true });
  const a = c.t(C.author, x, 0, w, u * 3.4, { weight: 700 }); const r = c.t(C.role + ' · ' + C.brand, x, 0, w, u * 2.9, { color: P.muted });
  const q = c.hd('“' + C.quote + '”', x, 0, w, u * (wide ? 7 : 6.5), 5, Math.max(u * 6, bot - top - b.h - a.h - r.h - u * 9), { upper: false, lh: 1.15 });
  c.els.splice(c.els.indexOf(q), 1); c.els.splice(c.els.indexOf(a), 0, q);
  c.vstack([b, q, a, r], [u * 3, u * 4, u * .6], top, bot);
}, { topics: PODCASTS, every: true, photo: true, nogarnish: true });

def('podcast-number', 'Episode Number', 'ts', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  c.bg(P.ink);
  const pw = wide ? W * .45 : W, ph = wide ? H : H * .46;
  c.i(0, 0, pw, ph, { label: 'Host portrait' });
  const x = wide ? pw + m : m, w = wide ? W - pw - 2 * m : W - 2 * m, top = wide ? m : ph + m * .8, bot = H - m;
  const k = c.kick(x, 0, w, { color: P.accent });
  const d = c.t(C.date[2] + '  ·  ' + C.date[3], x, 0, w, u * 3, { color: mix(P.bg, P.ink, .3), weight: 600 });
  // The episode number and the title share what the two lines leave.
  const rest = bot - top - k.h - d.h - u * 8;
  const num = c.hd(C.count[0], x, 0, w, u * (wide ? 28 : 22), 1, Math.max(u * 8, rest * .5), { color: P.accent, upper: false, name: 'Number' });
  const hd = c.hd(C.title, x, 0, w, u * 8, 3, Math.max(u * 5, rest - num.h), { color: P.bg });
  [num, hd].forEach(e => c.els.splice(c.els.indexOf(e), 1)); c.els.splice(c.els.indexOf(d), 0, num, hd);
  c.vstack([k, num, hd, d], [u, u * 2, u * 5], top, bot);
}, { topics: PODCASTS, every: true, photo: true, nogarnish: true });

def('podcast-channel', 'Podcast Channel Art', 'b', ['banner'], c => {
  const { W, H, u, m, P, C } = c;
  c.bg(P.ink);
  const d = H - 2 * m;
  c.o(W - m - d - u * 1.5, m - u * 1.5, d + u * 3, d + u * 3, { fill: P.accent, name: 'Halo' }); c.i(W - m - d, m, d, d, { mask: 'circle', label: 'Host' });
  // The safe area is a thin strip of a 2560 px canvas, so everything is sized up.
  const x = m + u * 2, w = W - d - 3 * m - u * 60;
  const k = c.kick(x, 0, w, { color: P.accent, size: u * 4.4 });
  const s = c.t(C.date[2] + '  ·  ' + C.place, x, 0, w, u * 5.4, { color: mix(P.bg, P.ink, .3), weight: 600 });
  const hd = c.hd(C.brand, x, 0, w, u * 30, 1, Math.max(u * 10, H - 2 * m - k.h - s.h - u * 6), { color: P.bg, name: 'Show name' });
  c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(s), 0, hd);
  c.vstack([k, hd, s], [u * 2, u * 3], m, H - m);
  wave(c, W - m - d - u * 54, H / 2 - u * 7, u * 46, u * 14, 26, P.accent2, mix(P.bg, P.ink, .75), .5);
}, { topics: PODCASTS, every: true, photo: true, nogarnish: true });

/* patterned backgrounds */
const PATS = { soft: ['dots', 'dots-fine', 'grid', 'plus-small', 'lattice', 'crosshatch', 'speckle', 'graph'], bold: ['stripes-diag', 'polka', 'chevron', 'waves', 'zigzag', 'checks', 'diamonds', 'scales'], party: ['confetti', 'sparkles', 'stars', 'polka', 'hearts-small', 'sprinkles', 'bubbles'] };
const patOf = (c, set) => PATS[set][Math.floor(c.rng() * PATS[set].length)];

def('pattern-card', 'Patterned Card', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.bg); c.pattern(patOf(c, 'soft'), { fg: P.accent, alpha: .3, scale: 1.2 });
  const cw = W - 2 * m, ch = H - 2 * m, x = m + u * 6, w = cw - u * 12;
  c.r(m, m, cw, ch, { fill: P.surface, stroke: P.accent, sw: u * .5, radius: u * 2, shadow: true, name: 'Card' });
  const k = c.kick(x, 0, w, { align: 'center' });
  const s = c.t(C.sub, x + w * .1, 0, w * .8, u * 3.3, { align: 'center', color: P.muted });
  const b = c.btn(C.cta, W / 2, 0, u * 3, { anchor: 'center' });
  const hd = c.hd(C.title, x, 0, w, u * (cls === 'wide' ? 12 : 11), 3, Math.max(u * 6, ch - u * 12 - k.h - s.h - b.h - u * 12), { align: 'center' });
  c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(s), 0, hd);
  c.vstack([k, hd, s, b], [u * 3, u * 3, u * 5], m + u * 6, H - m - u * 6);
}, { nogarnish: true });

def('pattern-band', 'Pattern Band', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.bg); c.pattern(patOf(c, 'bold'), { fg: P.accent2, alpha: .45, scale: cls === 'wide' ? 1.6 : 1.3 });
  const bh = Math.min(H * .5, u * 44), by = H / 2 - bh / 2;
  c.r(0, by, W, bh, { fill: P.accent, name: 'Band' });
  const w = W - 2 * m;
  const hd = c.hd(C.title, m, 0, w, u * (cls === 'wide' ? 14 : 12), 2, bh - u * 8, { align: 'center', color: P.onAccent });
  c.vstack([hd], [], by, by + bh);
  const k = c.kick(m, by - u * 7, w, { align: 'center', color: P.ink });
  const s = c.t(C.sub, m + w * .1, by + bh + u * 3, w * .8, u * 3.3, { align: 'center', color: P.ink });
  c.btn(C.cta, W / 2, s.y + s.h + u * 3, u * 3, { anchor: 'center', fill: P.ink, color: P.bg });
}, { nogarnish: true });

def('pattern-corner', 'Pattern Corner', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  c.bg(P.bg); c.pattern(patOf(c, 'soft'), { fg: P.ink, alpha: .1 });
  const pw = wide ? W * .42 : W * .55, ph = wide ? H * .62 : H * .4;
  c.r(W - pw - u * 2, H - ph - u * 2, pw, ph, { fill: P.accent2, name: 'Backing' });
  c.i(W - pw, H - ph, pw, ph, { label: 'Photo', border: P.surface, borderW: u * 1.2 });
  const w = wide ? W - pw - 3 * m : W - 2 * m, top = m, bot = wide ? H - m : H - ph - m;
  const k = c.kick(m, 0, w);
  const s = c.t(C.sub, m, 0, Math.min(w, u * 60), u * 3.3, { color: P.muted });
  const hd = c.hd(C.title, m, 0, w, u * 12, 3, Math.max(u * 6, bot - top - k.h - s.h - u * 9));
  c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(s), 0, hd);
  c.vstack([k, hd, s], [u * 2.5, u * 3], top, bot, 'top');
}, { photo: true, nogarnish: true });

def('pattern-invite', 'Patterned Invitation', 'sp', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  c.bg(P.bg); c.pattern(patOf(c, 'party'), { fg: P.accent, alpha: .35, scale: 1.1 });
  const ix = m, iy = m, iw = W - 2 * m, ih = H - 2 * m;
  c.r(ix, iy, iw, ih, { fill: P.surface, radius: u * 1.5, name: 'Card' });
  c.r(ix + u * 2.5, iy + u * 2.5, iw - u * 5, ih - u * 5, { fill: null, stroke: P.accent, sw: u * .35, radius: u, name: 'Inner frame' });
  const x = ix + u * 8, w = iw - u * 16;
  const k = c.kick(x, 0, w, { align: 'center' });
  const d = c.t(C.date[2] + (C.date[3] ? '  ·  ' + C.date[3] : ''), x, 0, w, u * 3.4, { align: 'center', weight: 700 });
  const pl = c.t(C.place, x, 0, w, u * 3, { align: 'center', color: P.muted });
  const b = c.btn(C.cta, W / 2, 0, u * 2.8, { anchor: 'center' });
  const hd = c.hd(C.title, x, 0, w, u * 11, 3, Math.max(u * 6, ih - u * 16 - k.h - d.h - pl.h - b.h - u * 14), { align: 'center', upper: false });
  c.els.splice(c.els.indexOf(hd), 1); c.els.splice(c.els.indexOf(d), 0, hd);
  c.vstack([k, hd, d, pl, b], [u * 3, u * 4, u * 1, u * 5], iy + u * 8, iy + ih - u * 8);
}, { topics: OCCASIONS, nogarnish: true });

export const LAYOUT = Object.fromEntries(LAYOUTS.map(l => [l.id, l]));
export const PAIRING = Object.fromEntries(PAIRINGS.map(p => [p.id, p]));
export const PALETTE = Object.fromEntries(PALETTES.map(p => [p.id, p]));

/* ---------- catalog ---------- */
const clsOf = ar => ar >= 2.2 ? 'banner' : ar > 1.25 ? 'wide' : ar >= .8 ? 'square' : 'tall';
let _cat = null;
export function catalog() {
  if (_cat) return _cat;
  const out = [];
  FORMATS.forEach((f, fi) => {
    const [sw, sh] = f.safe || [f.w, f.h];
    const cls = clsOf(sw / sh);
    // `only` pins a format to purpose-built layouts (a résumé is a résumé); otherwise
    // every layout whose kinds and aspect classes fit is eligible.
    const Ls = LAYOUTS.filter(l => (f.only ? f.only.includes(l.id) : l.kinds.includes(f.kind)) && l.cls.includes(f.kind === 'c' ? 'wide' : cls));
    if (!Ls.length) return;
    const per = Math.min(12, Math.max(2, Math.ceil(52 / Ls.length)));
    Ls.forEach((l, li) => {
      // Designs built around a photo are what most people come for; weight them up.
      // A layout that asks for `every` pack it names gets at least one of each.
      const n = Math.max(l.photo ? Math.ceil(per * 1.5) : per, l.every && l.topics ? l.topics.length : 0);
      // A layout can name the copy packs it suits (an invitation frame wants occasions);
      // a copy pack can name the layouts it tolerates (memorial copy never gets a burst).
      const pool = l.topics ? l.topics.map(id => TOPIC[id]) : TOPICS.filter(t => !t.niche);
      for (let j = 0; j < n; j++) {
        const ti = (li * 5 + fi * 3 + j * 7) % pool.length;
        let t = pool[ti];
        const fits = t => (!t.only || t.only.includes(l.id)) && !(t.avoid && t.avoid.includes(l.id));
        for (let g = 1; g <= pool.length && !fits(t); g++) t = pool[(ti + g) % pool.length];
        if (!fits(t)) continue;
        const pair = t.pairs[(li + j * 2 + fi) % t.pairs.length];
        const pal = t.pals[(li * 2 + j + fi) % t.pals.length];
        out.push({ id: `${f.id}~${l.id}~${t.id}~${j}`, fmt: f.id, layout: l.id, topic: t.id, pair, pal, name: t.title, layoutName: l.name, topicName: t.name, cat: f.cat, fmtName: f.name, w: f.w, h: f.h, pages: f.pages || 1, search: `${t.id} ${t.title} ${t.name} ${t.kw || ''} ${l.name} ${f.name} ${f.cat} ${PALETTE[pal].name} ${PAIRING[pair].name}`.toLowerCase() });
      }
    });
  });
  _cat = out; return out;
}

function runLayout(l, f, theme, pair, topic, seed, page = 0, pages = 1) {
  const [sw, sh] = f.safe || [f.w, f.h];
  const c = makeCtx(sw, sh, theme, pair, topic, seeded(seed), f.kind);
  c.page = page; c.pages = pages;
  l.fn(c);
  garnish(c, l);
  // Platform safe zones (YouTube channel art, for one): the layout runs inside the
  // safe box and is centred on the full page, which the background colour fills.
  if (f.safe) { const dx = (f.w - sw) / 2, dy = (f.h - sh) / 2; c.els.forEach(e => { e.x = r1(e.x + dx); e.y = r1(e.y + dy); }); }
  return { id: nid(), bg: c.bgc, els: c.els, ...(c.pat ? { pattern: c.pat } : {}) };
}
function backOfCard(W, H, theme, pair, topic) {
  const c = makeCtx(W, H, theme, pair, topic, seeded(1), 'c'); const u = c.u;
  c.bg(theme.accent);
  const hd = c.hd(topic.brand, W * .15, 0, W * .7, u * 16, 1, u * 20, { align: 'center', color: theme.onAccent });
  const s = c.t(topic.url, W * .15, 0, W * .7, u * 4, { align: 'center', color: theme.onAccent, upper: true, ls: .2, weight: 700 });
  c.vstack([hd, s], [u * 4], 0, H);
  return { id: nid(), bg: c.bgc, els: c.els };
}

// Story arcs for multi-page formats. Page 1 is the template's own layout; the rest
// follow the arc so a deck reads like a deck and a carousel like a carousel. `open`
// pages come first, `middle` fills the remaining space (rotating from a seeded start
// so sibling templates differ), and `close` ends it. `repeat` keeps one middle
// layout for every page, which is what a numbered carousel wants.
const ARCS = {
  deck: { open: ['agenda'], middle: ['section-divider', 'photo-duo', 'two-column', 'photo-stat', 'numbered-list', 'hero-photo', 'stat-chart', 'photo-caption', 'quote', 'pricing', 'photo-list', 'testimonial', 'timeline', 'checklist'], close: 'closing' },
  carousel: { open: [], middle: ['carousel-point', 'photo-caption'], alternate: true, close: 'closing' },
  report: { open: ['two-column'], middle: ['photo-stat', 'stat-chart', 'photo-caption', 'numbered-list', 'photo-duo', 'timeline', 'quote', 'pricing'], close: 'contact' },
  booklet: { open: [], middle: ['hero-photo', 'photo-caption', 'two-column', 'photo-duo', 'numbered-list', 'quote'], close: 'contact' },
  newsletter: { open: [], middle: ['photo-list', 'two-column', 'photo-caption'], close: null },
  menu: { open: [], middle: ['pricing', 'menu-board'], close: null },
  greeting: { open: [], middle: ['quote'], close: null },
  photobook: { open: [], middle: ['photo-duo', 'grid-four', 'feature-grid', 'photo-caption', 'photo-strip', 'polaroid', 'hero-photo', 'collage'], close: null },
  resume: { open: [], middle: ['two-column'], close: null }
};
function arcPages(arc, n, first, seed) {
  const a = ARCS[arc] || ARCS.booklet, out = [];
  const total = n - 1, body = a.close ? total - 1 : total;
  const mid = a.middle.filter(x => x !== first).length ? a.middle.filter(x => x !== first) : a.middle;
  let k = seed % mid.length;
  for (let i = 0; i < body; i++) {
    if (i < a.open.length) out.push(a.open[i]);
    else if (a.alternate) out.push(mid[(i - a.open.length) % mid.length]);
    else out.push(mid[k++ % mid.length]);
  }
  if (a.close && total > 0) out.push(a.close);
  return out;
}

export function build(desc) {
  const f = FORMAT[desc.fmt], l = LAYOUT[desc.layout], t = TOPIC[desc.topic];
  const theme = makeTheme(PALETTE[desc.pal]), pair = PAIRING[desc.pair];
  const seed = hash(desc.id);
  const n = f.kind === 'c' ? 2 : (f.pages || 1);
  const run = (lay, i) => runLayout(lay, f, theme, pair, t, seed + i, i, n);
  const pages = [run(l, 0)];
  if (f.kind === 'c') pages.push(backOfCard(f.w, f.h, theme, pair, t));
  else if (n > 1) arcPages(f.arc || (f.kind === 'd' ? 'deck' : 'booklet'), n, l.id, seed).forEach((id, i) => pages.push(run(LAYOUT[id], i + 1)));
  return { name: t.title, w: f.w, h: f.h, fmt: f.id, tpl: desc.id, theme: { ...theme, display: pair.display, body: pair.body, pairId: pair.id }, pages };
}
