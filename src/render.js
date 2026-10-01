// Pinwheel Studio — renderer. Pure functions of (h = React.createElement, element model).
import { MOTIFS } from './motifs.js';

export const filterCSS = f => !f ? 'none' : `brightness(${f.b ?? 1}) contrast(${f.c ?? 1}) saturate(${f.s ?? 1}) blur(${f.bl || 0}px) grayscale(${f.g || 0}) sepia(${f.se || 0}) hue-rotate(${f.hu || 0}deg)`;

const polyPts = (pts, w, h) => pts.map(([x, y]) => `${x * w},${y * h}`).join(' ');
function starPts(n, inner, w, h) {
  const out = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? inner : 1; out.push([.5 + .5 * r * Math.cos(a), .5 + .5 * r * Math.sin(a)]); }
  return polyPts(out, w, h);
}
function ngonPts(n, w, h) { const out = []; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; out.push([.5 + .5 * Math.cos(a), .5 + .5 * Math.sin(a)]); } return polyPts(out, w, h); }
const SHAPE_PTS = { triangle: [[.5, 0], [1, 1], [0, 1]], diamond: [[.5, 0], [1, .5], [.5, 1], [0, .5]], arrow: [[0, .3], [.6, .3], [.6, 0], [1, .5], [.6, 1], [.6, .7], [0, .7]], chevron: [[0, 0], [.6, 0], [1, .5], [.6, 1], [0, 1], [.4, .5]], parallelogram: [[.22, 0], [1, 0], [.78, 1], [0, 1]] };
export const SHAPES = ['rect', 'rounded', 'ellipse', 'triangle', 'diamond', 'star', 'burst', 'polygon', 'arrow', 'chevron', 'parallelogram', 'arch', 'half', 'quarter'];

function shapeNode(h, el) {
  const w = el.w, H = el.h, sw = el.sw || 0;
  const p = { fill: el.fill || 'none', stroke: el.stroke || 'none', strokeWidth: sw, strokeDasharray: el.dash && sw ? `${sw * 3} ${sw * 2}` : undefined, strokeLinejoin: 'round' };
  const s = el.shape;
  if (s === 'rect' || s === 'rounded') return h('rect', { x: sw / 2, y: sw / 2, width: Math.max(0, w - sw), height: Math.max(0, H - sw), rx: Math.min(s === 'rounded' ? Math.max(el.radius || 0, Math.min(w, H) * .18) : el.radius || 0, w / 2, H / 2), ...p });
  if (s === 'ellipse') return h('ellipse', { cx: w / 2, cy: H / 2, rx: Math.max(0, w / 2 - sw / 2), ry: Math.max(0, H / 2 - sw / 2), ...p });
  if (s === 'star' || s === 'burst') return h('polygon', { points: starPts(s === 'burst' ? (el.points > 8 ? el.points : 16) : el.points || 5, s === 'burst' ? Math.max(el.inner || .8, .7) : el.inner || .5, w, H), ...p });
  if (s === 'polygon') return h('polygon', { points: ngonPts(el.sides || 6, w, H), ...p });
  if (s === 'poly' && el.pts) return h('polygon', { points: polyPts(el.pts, w, H), ...p });
  // Motif paths are authored in a 100×100 box and scaled to the frame (fill only).
  if (s === 'path' && el.d) return h('path', { d: el.d, transform: `scale(${w / 100} ${H / 100})`, fillRule: 'evenodd', fill: p.fill });
  if (SHAPE_PTS[s]) return h('polygon', { points: polyPts(SHAPE_PTS[s], w, H), ...p });
  if (s === 'arch') { const r = w / 2; return h('path', { d: `M0 ${H} L0 ${Math.min(r, H)} A ${r} ${Math.min(r, H)} 0 0 1 ${w} ${Math.min(r, H)} L${w} ${H} Z`, ...p }); }
  if (s === 'half') return h('path', { d: `M0 ${H} A ${w / 2} ${H} 0 0 1 ${w} ${H} Z`, ...p });
  if (s === 'quarter') return h('path', { d: `M0 ${H} L0 0 A ${w} ${H} 0 0 1 ${w} ${H} Z`, ...p });
  return h('rect', { width: w, height: H, ...p });
}

const qrCache = new Map();
function qrPath(value) {
  if (qrCache.has(value)) return qrCache.get(value);
  if (typeof window === 'undefined' || !window.qrcode) return null;
  const q = window.qrcode(0, 'M'); q.addData(value || ' '); q.make();
  const n = q.getModuleCount(); let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + 2} ${y + 2}h1v1h-1z`;
  const r = { d, size: n + 4 }; qrCache.set(value, r); return r;
}

function chartNode(h, el) {
  const w = el.w, H = el.h, data = el.data || [], cols = el.colors || ['#333'];
  const fs = Math.max(8, Math.min(w, H) * .055), font = `'${el.font || 'DM Sans'}', sans-serif`;
  const txt = (x, y, s, o = {}) => h('text', { x, y, fontSize: o.fs || fs, fontFamily: font, fill: o.fill || el.ink, textAnchor: o.a || 'middle', fontWeight: o.fw || 600 }, s);
  const kids = [];
  const max = Math.max(1, ...data.map(d => +d.v || 0));
  if (el.chart === 'pie' || el.chart === 'donut') {
    const legendRight = w > H * 1.25; const size = legendRight ? H : Math.min(w, H - (data.length * fs * 1.7));
    const cx = size / 2, cy = size / 2, R = size / 2 - 2; const tot = data.reduce((a, d) => a + (+d.v || 0), 0) || 1; let a0 = -Math.PI / 2;
    data.forEach((d, i) => {
      const a1 = a0 + (+d.v || 0) / tot * Math.PI * 2; const large = a1 - a0 > Math.PI ? 1 : 0;
      const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
      kids.push(h('path', { key: 's' + i, d: data.length === 1 ? `M${cx - R} ${cy}A${R} ${R} 0 1 1 ${cx + R} ${cy}A${R} ${R} 0 1 1 ${cx - R} ${cy}Z` : `M${cx} ${cy}L${x0} ${y0}A${R} ${R} 0 ${large} 1 ${x1} ${y1}Z`, fill: cols[i % cols.length], stroke: el.chart === 'donut' ? 'none' : el.bgc || 'none' }));
      a0 = a1;
    });
    if (el.chart === 'donut') kids.push(h('circle', { key: 'hole', cx, cy, r: R * .58, fill: el.hole || '#FFFFFF' }));
    data.forEach((d, i) => {
      const lx = legendRight ? size + fs * 1.2 : fs * .2, ly = legendRight ? H / 2 - data.length * fs * .85 + i * fs * 1.7 : size + fs * 1.4 + i * fs * 1.7;
      kids.push(h('rect', { key: 'lr' + i, x: lx, y: ly - fs * .8, width: fs * .9, height: fs * .9, rx: fs * .2, fill: cols[i % cols.length] }));
      kids.push(txt(lx + fs * 1.4, ly, `${d.l}  ${d.v}`, { a: 'start', fw: 500, key: 'lt' + i }));
    });
  } else {
    const top = fs * 1.8, bot = H - fs * 2, plotH = Math.max(1, bot - top), n = Math.max(1, data.length), step = w / n;
    kids.push(h('line', { key: 'base', x1: 0, y1: bot, x2: w, y2: bot, stroke: el.ink, strokeOpacity: .25, strokeWidth: Math.max(1, fs * .08) }));
    if (el.chart === 'line') {
      const pts = data.map((d, i) => [step * i + step / 2, bot - (+d.v || 0) / max * plotH]);
      kids.push(h('polyline', { key: 'pl', points: pts.map(p => p.join(',')).join(' '), fill: 'none', stroke: cols[0], strokeWidth: fs * .3, strokeLinejoin: 'round', strokeLinecap: 'round' }));
      pts.forEach((p, i) => { kids.push(h('circle', { key: 'c' + i, cx: p[0], cy: p[1], r: fs * .45, fill: cols[0] })); if (el.labels !== false) kids.push(h('text', { key: 'v' + i, x: p[0], y: p[1] - fs * .9, fontSize: fs, fontFamily: font, fill: el.ink, textAnchor: 'middle', fontWeight: 700 }, String(data[i].v))); });
    } else {
      const bw = step * .62;
      data.forEach((d, i) => { const bh = (+d.v || 0) / max * plotH, x = step * i + (step - bw) / 2; kids.push(h('rect', { key: 'b' + i, x, y: bot - bh, width: bw, height: bh, rx: Math.min(bw * .12, bh / 2), fill: i === data.length - 1 ? cols[0] : (cols[1] || cols[0]) })); if (el.labels !== false) kids.push(h('text', { key: 'v' + i, x: x + bw / 2, y: bot - bh - fs * .5, fontSize: fs, fontFamily: font, fill: el.ink, textAnchor: 'middle', fontWeight: 700 }, String(d.v))); });
    }
    data.forEach((d, i) => kids.push(h('text', { key: 'l' + i, x: step * i + step / 2, y: H - fs * .4, fontSize: fs * .9, fontFamily: font, fill: el.ink, fillOpacity: .75, textAnchor: 'middle', fontWeight: 500 }, d.l)));
  }
  return h('svg', { width: w, height: H, viewBox: `0 0 ${w} ${H}`, style: { display: 'block', overflow: 'visible' } }, kids);
}

/* Procedural sample art for template frames (see presets.js sampleFor). Covers the
   frame like a photo would — preserveAspectRatio "slice" is object-fit: cover. */
const SKIN = ['#F1C9A5', '#D9A47C', '#B77A55', '#8D5A3C'];
const HAIR = ['#2B2118', '#B8742E', '#1B1B1B', '#6B3E2E'];
function sampleArt(h, s) {
  const { kind, v, c } = s, k = [];
  if (kind === 'portrait') {
    const skin = SKIN[v % 4], hair = HAIR[(v + 1) % 4];
    // Features are always dark: the palette's ink can be cream on a dark theme, and
    // cream eyes without pupils are the stuff of nightmares.
    const ink = '#2B2118', white = '#FFFFFF';
    if (c.bg !== 'none') { k.push(h('rect', { key: 'bg', width: 100, height: 130, fill: c.bg })); k.push(h('circle', { key: 'halo', cx: 50, cy: 66, r: 44, fill: c.halo })); }
    if (v === 1) k.push(h('path', { key: 'hairL', d: 'M24 60 C22 24 78 24 76 60 L80 96 L20 96 Z', fill: hair }));
    if (v === 3) { k.push(h('ellipse', { key: 'afro', cx: 50, cy: 40, rx: 31, ry: 24, fill: hair })); [[22, 50], [24, 32], [36, 20], [50, 15], [64, 20], [76, 32], [78, 50]].forEach(([x, y], i) => k.push(h('circle', { key: 'puff' + i, cx: x, cy: y, r: 10, fill: hair }))); }
    k.push(h('path', { key: 'body', d: 'M8 130 C8 102 30 94 50 94 C70 94 92 102 92 130 Z', fill: c.shirt }));
    k.push(h('path', { key: 'collar', d: 'M40 94 L50 104 L60 94 Z', fill: skin }));
    k.push(h('rect', { key: 'neck', x: 42, y: 76, width: 16, height: 20, fill: skin }));
    k.push(h('circle', { key: 'earL', cx: 28, cy: 60, r: 5, fill: skin })); k.push(h('circle', { key: 'earR', cx: 72, cy: 60, r: 5, fill: skin }));
    k.push(h('ellipse', { key: 'head', cx: 50, cy: 56, rx: 23, ry: 27, fill: skin }));
    if (v === 0) k.push(h('path', { key: 'hair', d: 'M27 54 C27 26 73 26 73 54 C66 40 34 40 27 54 Z', fill: hair }));
    if (v === 1) k.push(h('path', { key: 'hair', d: 'M27 50 C29 26 71 26 73 50 C62 38 38 38 27 50 Z', fill: hair }));
    if (v === 2) { k.push(h('path', { key: 'hair', d: 'M27 52 C27 28 73 28 73 52 C68 42 32 42 27 52 Z', fill: hair })); k.push(h('circle', { key: 'bun', cx: 50, cy: 28, r: 9, fill: hair })); }
    if (v === 3) k.push(h('path', { key: 'hairline', d: 'M27 50 C30 34 70 34 73 50 C64 42 36 42 27 50 Z', fill: hair }));
    [41, 59].forEach((x, i) => { k.push(h('ellipse', { key: 'eyeW' + i, cx: x, cy: 58, rx: 3.6, ry: 4, fill: white })); k.push(h('circle', { key: 'eye' + i, cx: x + .6, cy: 58.6, r: 2.2, fill: ink })); k.push(h('circle', { key: 'glint' + i, cx: x + 1.4, cy: 57.4, r: .8, fill: white })); });
    if (v === 2) { k.push(h('circle', { key: 'gL', cx: 41, cy: 58, r: 6.5, fill: 'none', stroke: ink, strokeWidth: 1.4 })); k.push(h('circle', { key: 'gR', cx: 59, cy: 58, r: 6.5, fill: 'none', stroke: ink, strokeWidth: 1.4 })); k.push(h('path', { key: 'gB', d: 'M47.5 58 L52.5 58', stroke: ink, strokeWidth: 1.4 })); }
    k.push(h('path', { key: 'browL', d: 'M36 50 Q41 47.5 46 50', stroke: hair, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' }));
    k.push(h('path', { key: 'browR', d: 'M54 50 Q59 47.5 64 50', stroke: hair, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' }));
    k.push(h('path', { key: 'nose', d: 'M50 61 L48 66 L52 66', stroke: ink, strokeWidth: 1, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', opacity: .5 }));
    k.push(h('path', { key: 'smile', d: 'M44.5 70 Q50 75 55.5 70', stroke: ink, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' }));
    k.push(h('circle', { key: 'chL', cx: 35, cy: 66, r: 3.5, fill: '#E8674A', opacity: .22 })); k.push(h('circle', { key: 'chR', cx: 65, cy: 66, r: 3.5, fill: '#E8674A', opacity: .22 }));
    prop(h, k, s.prop, { hair, skin, shirt: c.shirt, ink, white });
    return { vb: '0 0 100 130', k };
  }
  if (kind === 'object') {
    k.push(h('rect', { key: 'bg', width: 100, height: 130, fill: c.bg }));
    k.push(h('circle', { key: 'halo', cx: 50, cy: 64, r: 40, fill: c.halo }));
    k.push(h('ellipse', { key: 'plinth', cx: 50, cy: 108, rx: 32, ry: 7, fill: c.plinth }));
    object(h, k, s.obj, v, c);
    return { vb: '0 0 100 130', k };
  }
  // landscape
  const night = s.scene === 'night', winter = s.scene === 'winter';
  k.push(h('rect', { key: 'sky', width: 160, height: 100, fill: c.sky }));
  k.push(h('circle', { key: 'sun', cx: v === 2 ? 40 : 120, cy: 28, r: 14, fill: c.sun }));
  if (night) { k.push(h('circle', { key: 'moonbite', cx: (v === 2 ? 40 : 120) + 7, cy: 24, r: 12, fill: c.sky })); [[20, 14], [48, 30], [70, 10], [88, 22], [140, 12], [150, 40], [30, 44]].forEach(([x, y], i) => k.push(h('circle', { key: 'st' + i, cx: x + v * 2, cy: y, r: i % 3 ? 1.2 : 1.8, fill: c.cloud, opacity: .9 }))); }
  else [[24, 30], [96, 20]].forEach(([x, y], i) => { k.push(h('ellipse', { key: 'cl' + i, cx: x + v * 6, cy: y, rx: 16, ry: 6, fill: c.cloud, opacity: .85 })); k.push(h('ellipse', { key: 'cl2' + i, cx: x + 8 + v * 6, cy: y - 4, rx: 10, ry: 6, fill: c.cloud, opacity: .85 })); });
  if (v === 1) { k.push(h('path', { key: 'mtn', d: 'M0 100 L0 74 L36 40 L62 66 L86 32 L118 68 L140 48 L160 70 L160 100 Z', fill: c.far })); k.push(h('path', { key: 'snow', d: 'M78 44 L86 32 L94 44 Z M30 48 L36 40 L42 48 Z', fill: c.cloud, opacity: .9 })); k.push(h('path', { key: 'near', d: 'M0 100 L0 84 C40 70 90 92 160 80 L160 100 Z', fill: c.near })); }
  else if (v === 2) { k.push(h('rect', { key: 'sea', x: 0, y: 58, width: 160, height: 42, fill: c.near })); [64, 72, 80].forEach((y, i) => k.push(h('path', { key: 'w' + i, d: `M${10 + i * 30} ${y} q6 -4 12 0 t12 0 t12 0`, stroke: c.cloud, strokeWidth: 1.6, fill: 'none', opacity: .7 }))); k.push(h('path', { key: 'sand', d: 'M0 100 L0 88 C50 82 110 96 160 86 L160 100 Z', fill: c.far })); }
  else { k.push(h('path', { key: 'far', d: 'M0 100 L0 62 C30 46 60 72 90 56 C120 42 140 62 160 52 L160 100 Z', fill: c.far })); k.push(h('path', { key: 'near', d: 'M0 100 L0 80 C40 64 80 90 120 74 C140 68 150 76 160 72 L160 100 Z', fill: c.near })); }
  if (v !== 2) [[22, 84], [44, 88], [128, 82]].forEach(([x, y], i) => { k.push(h('polygon', { key: 't' + i, points: `${x},${y - 22} ${x - 8},${y} ${x + 8},${y}`, fill: c.tree })); k.push(h('rect', { key: 'tr' + i, x: x - 1.5, y, width: 3, height: 6, fill: c.tree })); });
  if (v === 3 && !night && !winter) k.push(h('path', { key: 'birds', d: 'M60 30 q4 -4 8 0 M70 24 q4 -4 8 0 M52 22 q4 -4 8 0', stroke: c.tree, strokeWidth: 1.2, fill: 'none' }));
  if (winter) { [[12, 22], [38, 48], [58, 16], [84, 40], [104, 12], [126, 50], [146, 26], [70, 62], [20, 70]].forEach(([x, y], i) => k.push(h('circle', { key: 'sn' + i, cx: x + v * 3, cy: y, r: i % 2 ? 1.6 : 2.4, fill: '#FFFFFF', opacity: .9 }))); if (v !== 2) [[22, 84], [44, 88], [128, 82]].forEach(([x, y], i) => k.push(h('polygon', { key: 'snowcap' + i, points: `${x},${y - 22} ${x - 3},${y - 14} ${x + 3},${y - 14}`, fill: '#FFFFFF', opacity: .85 }))); }
  return { vb: '0 0 160 100', k };
}
/* What the person in a portrait holds or wears — drawn after the face. */
const RED = '#C8102E';
function prop(h, k, id, c) {
  const P = (key, type, props) => k.push(h(type, { key: 'p-' + key, ...props }));
  switch (id) {
    case 'partyhat': P('hat', 'polygon', { points: '50,2 34,36 66,36', fill: c.shirt }); P('stripe', 'polygon', { points: '42,19 58,19 62,28 38,28', fill: c.white, opacity: .6 }); P('pom', 'circle', { cx: 50, cy: 3, r: 4, fill: c.white }); break;
    case 'santahat': P('hat', 'path', { d: 'M28 36 C34 10 62 4 76 14 C70 18 68 26 72 36 Z', fill: RED }); P('brim', 'rect', { x: 26, y: 32, width: 48, height: 9, rx: 4.5, fill: c.white }); P('pom', 'circle', { cx: 78, cy: 14, r: 5, fill: c.white }); break;
    case 'mortarboard': P('band', 'path', { d: 'M28 40 C28 30 72 30 72 40 L72 46 C72 38 28 38 28 46 Z', fill: c.ink }); P('board', 'polygon', { points: '50,20 86,32 50,44 14,32', fill: c.ink }); P('tassel', 'path', { d: 'M86 32 L86 50', stroke: c.shirt, strokeWidth: 2 }); P('tip', 'circle', { cx: 86, cy: 52, r: 2.5, fill: c.shirt }); break;
    case 'headphones': P('band', 'path', { d: 'M26 56 C26 24 74 24 74 56', stroke: c.ink, strokeWidth: 3.5, fill: 'none' }); P('cupL', 'rect', { x: 20, y: 50, width: 10, height: 16, rx: 4, fill: c.ink }); P('cupR', 'rect', { x: 70, y: 50, width: 10, height: 16, rx: 4, fill: c.ink }); break;
    case 'chefhat': P('hat', 'path', { d: 'M30 36 C22 16 40 8 50 16 C60 8 78 16 70 36 Z', fill: c.white }); P('band', 'rect', { x: 30, y: 32, width: 40, height: 8, fill: c.white }); P('line', 'path', { d: 'M30 40 L70 40', stroke: c.ink, strokeWidth: 1, opacity: .2 }); break;
    case 'sunhat': P('brim', 'ellipse', { cx: 50, cy: 36, rx: 38, ry: 7, fill: c.shirt }); P('crown', 'path', { d: 'M30 36 C30 14 70 14 70 36 Z', fill: c.shirt }); P('ribbon', 'rect', { x: 30, y: 30, width: 40, height: 5, fill: c.ink, opacity: .5 }); break;
    case 'witchhat': P('brim', 'ellipse', { cx: 50, cy: 36, rx: 40, ry: 6, fill: c.ink }); P('cone', 'path', { d: 'M30 36 C40 24 46 8 56 0 C56 14 62 26 70 36 Z', fill: c.ink }); P('band', 'path', { d: 'M34 32 L66 32 L64 28 L36 28 Z', fill: c.shirt }); break;
    case 'bunnyears': ['26,30 30,-2 40,32', '74,30 70,-2 60,32'].forEach((pt, i) => P('ear' + i, 'polygon', { points: pt, fill: c.hair })); ['30,28 31,8 36,30', '70,28 69,8 64,30'].forEach((pt, i) => P('in' + i, 'polygon', { points: pt, fill: '#F7A1B0' })); break;
    case 'crown': [[29, 36], [39, 30], [50, 28], [61, 30], [71, 36]].forEach(([x, y], i) => { P('f' + i, 'circle', { cx: x, cy: y, r: 4.5, fill: i % 2 ? c.white : '#F7A1B0' }); P('fc' + i, 'circle', { cx: x, cy: y, r: 1.8, fill: '#F2B134' }); }); break;
    case 'flower': P('fl', 'circle', { cx: 70, cy: 36, r: 6, fill: '#F7A1B0' }); P('flc', 'circle', { cx: 70, cy: 36, r: 2.4, fill: '#F2B134' }); P('leaf', 'ellipse', { cx: 76, cy: 42, rx: 5, ry: 2.5, fill: '#4F8A5B', transform: 'rotate(40 76 42)' }); break;
    case 'cup': P('mug', 'rect', { x: 64, y: 96, width: 20, height: 22, rx: 3, fill: c.white }); P('handle', 'path', { d: 'M84 102 C92 102 92 112 84 112', stroke: c.white, strokeWidth: 3, fill: 'none' }); P('cof', 'rect', { x: 66, y: 98, width: 16, height: 5, rx: 1, fill: '#5A3A22' }); P('hand', 'ellipse', { cx: 66, cy: 112, rx: 7, ry: 5, fill: c.skin }); P('steam', 'path', { d: 'M70 92 q2 -4 0 -8 M77 92 q2 -4 0 -8', stroke: c.ink, strokeWidth: 1.2, fill: 'none', opacity: .45 }); break;
    case 'headband': P('band', 'path', { d: 'M28 44 C36 38 64 38 72 44', stroke: c.shirt, strokeWidth: 5, fill: 'none' }); break;
    case 'lanyard': P('strap', 'path', { d: 'M40 96 L50 116 L60 96', stroke: c.ink, strokeWidth: 2, fill: 'none' }); P('badge', 'rect', { x: 42, y: 112, width: 16, height: 14, rx: 2, fill: c.white }); P('bline', 'rect', { x: 45, y: 116, width: 10, height: 2, fill: c.ink, opacity: .5 }); break;
    case 'beret': P('beret', 'ellipse', { cx: 44, cy: 32, rx: 26, ry: 10, fill: c.shirt, transform: 'rotate(-8 44 32)' }); P('nub', 'circle', { cx: 44, cy: 23, r: 2, fill: c.shirt }); break;
    case 'sunglasses': P('gL', 'rect', { x: 33, y: 53, width: 15, height: 10, rx: 4, fill: c.ink }); P('gR', 'rect', { x: 52, y: 53, width: 15, height: 10, rx: 4, fill: c.ink }); P('gB', 'path', { d: 'M48 57 L52 57', stroke: c.ink, strokeWidth: 1.5 }); break;
    case 'heart': P('ht', 'path', { d: 'M50 120 C42 114 36 108 36 102 C36 97 40 94 44 94 C47 94 49 96 50 98 C51 96 53 94 56 94 C60 94 64 97 64 102 C64 108 58 114 50 120 Z', fill: c.white, opacity: .9 }); break;
    default: break;
  }
}

/* A drawn object on a plinth — what a wide or product frame shows for a topic. */
function object(h, k, id, v, c) {
  const P = (key, type, props) => k.push(h(type, { key: 'o-' + key, ...props }));
  const stroke = { stroke: c.ink, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 'coffee': P('saucer', 'ellipse', { cx: 50, cy: 98, rx: 32, ry: 7, fill: c.b }); P('cup', 'path', { d: 'M26 56 L31 94 Q50 102 69 94 L74 56 Z', fill: c.a }); P('rim', 'ellipse', { cx: 50, cy: 56, rx: 24, ry: 6, fill: c.light }); P('cof', 'ellipse', { cx: 50, cy: 57, rx: 19, ry: 4, fill: '#5A3A22' }); P('handle', 'path', { d: 'M74 64 C90 64 90 84 72 86', ...stroke, strokeWidth: 5, stroke: c.a }); P('steam', 'path', { d: 'M40 44 q3 -6 0 -12 M50 42 q3 -6 0 -12 M60 44 q3 -6 0 -12', ...stroke, strokeWidth: 2, opacity: .5 }); P('bean1', 'ellipse', { cx: 22, cy: 104, rx: 6, ry: 4, fill: '#5A3A22', transform: 'rotate(-30 22 104)' }); P('bean2', 'ellipse', { cx: 80, cy: 106, rx: 6, ry: 4, fill: '#5A3A22', transform: 'rotate(25 80 106)' }); break;
    case 'mic': P('stand', 'path', { d: 'M50 76 L50 100 M36 100 L64 100', ...stroke, strokeWidth: 3 }); P('body', 'rect', { x: 43, y: 56, width: 14, height: 24, rx: 4, fill: c.ink }); P('head', 'rect', { x: 34, y: 22, width: 32, height: 42, rx: 16, fill: c.a }); [30, 38, 46, 54].forEach((y, i) => P('g' + i, 'path', { d: `M38 ${y} L62 ${y}`, stroke: c.light, strokeWidth: 1.5, opacity: .6 })); P('ring', 'path', { d: 'M30 46 C30 70 70 70 70 46', ...stroke, strokeWidth: 3 }); break;
    case 'plate': P('plate', 'ellipse', { cx: 50, cy: 72, rx: 38, ry: 24, fill: c.light }); P('rim', 'ellipse', { cx: 50, cy: 72, rx: 30, ry: 18, ...stroke, strokeWidth: 1.5, opacity: .25 }); P('food', 'ellipse', { cx: 50, cy: 70, rx: 20, ry: 12, fill: c.a }); P('swirl', 'path', { d: 'M38 70 q6 -6 12 0 t12 0', ...stroke, strokeWidth: 2, stroke: c.light, opacity: .8 }); P('leaf', 'ellipse', { cx: 58, cy: 62, rx: 5, ry: 2.5, fill: c.b, transform: 'rotate(-30 58 62)' }); P('fork', 'path', { d: 'M12 50 L12 98 M9 50 L9 60 M15 50 L15 60', ...stroke, strokeWidth: 2 }); P('knife', 'path', { d: 'M88 50 L88 98 M88 50 C92 56 92 64 88 70', ...stroke, strokeWidth: 2 }); break;
    case 'dumbbell': P('bar', 'rect', { x: 20, y: 66, width: 60, height: 8, rx: 4, fill: c.ink }); [[14, 52], [24, 46], [66, 46], [76, 52]].forEach(([x, y], i) => P('pl' + i, 'rect', { x, y, width: 10, height: i % 3 ? 48 : 36, rx: 3, fill: i % 3 ? c.a : c.b })); break;
    case 'laptop': P('screen', 'rect', { x: 22, y: 34, width: 56, height: 40, rx: 3, fill: c.ink }); P('glass', 'rect', { x: 26, y: 38, width: 48, height: 32, rx: 1.5, fill: c.a }); P('win', 'rect', { x: 31, y: 44, width: 22, height: 12, rx: 1.5, fill: c.light, opacity: .9 }); P('win2', 'rect', { x: 31, y: 59, width: 38, height: 5, rx: 1.5, fill: c.light, opacity: .6 }); P('base', 'path', { d: 'M14 78 L86 78 L90 86 L10 86 Z', fill: c.ink }); P('pad', 'rect', { x: 42, y: 80, width: 16, height: 3, rx: 1.5, fill: c.light, opacity: .5 }); break;
    case 'house': P('body', 'rect', { x: 26, y: 58, width: 48, height: 42, fill: c.a }); P('roof', 'polygon', { points: '50,30 82,60 18,60', fill: c.ink }); P('chimney', 'rect', { x: 62, y: 36, width: 8, height: 16, fill: c.ink }); P('door', 'rect', { x: 44, y: 76, width: 12, height: 24, rx: 2, fill: c.b }); P('win1', 'rect', { x: 31, y: 66, width: 10, height: 10, rx: 1, fill: c.light }); P('win2', 'rect', { x: 59, y: 66, width: 10, height: 10, rx: 1, fill: c.light }); break;
    case 'guitar': P('neck', 'rect', { x: 46, y: 14, width: 8, height: 44, fill: c.ink }); P('head', 'rect', { x: 43, y: 8, width: 14, height: 12, rx: 3, fill: c.b }); P('upper', 'circle', { cx: 50, cy: 64, r: 15, fill: c.a }); P('lower', 'circle', { cx: 50, cy: 84, r: 20, fill: c.a }); P('hole', 'circle', { cx: 50, cy: 72, r: 7, fill: c.ink }); P('bridge', 'rect', { x: 42, y: 88, width: 16, height: 4, rx: 1, fill: c.ink }); P('strings', 'path', { d: 'M48 20 L48 90 M50 20 L50 90 M52 20 L52 90', stroke: c.light, strokeWidth: .7, opacity: .7 }); break;
    case 'palette': P('pal', 'path', { d: 'M50 36 C24 36 14 58 20 76 C26 94 50 100 66 92 C74 88 70 80 76 76 C84 70 86 56 76 46 C70 40 60 36 50 36 Z', fill: c.b }); P('thumb', 'circle', { cx: 60, cy: 82, r: 6, fill: c.bg }); [[36, 52, c.a], [50, 46, c.ink], [64, 52, c.light], [32, 68, '#F2B134']].forEach(([x, y, f], i) => P('dot' + i, 'circle', { cx: x, cy: y, r: 5, fill: f })); P('brush', 'path', { d: 'M78 30 L48 72', ...stroke, strokeWidth: 3 }); P('tip', 'path', { d: 'M44 78 L48 72 L52 76 Z', fill: c.a }); break;
    case 'controller': P('body', 'rect', { x: 18, y: 54, width: 64, height: 32, rx: 14, fill: c.ink }); P('gripL', 'circle', { cx: 30, cy: 86, r: 11, fill: c.ink }); P('gripR', 'circle', { cx: 70, cy: 86, r: 11, fill: c.ink }); P('dpad', 'path', { d: 'M30 62 L30 78 M22 70 L38 70', stroke: c.light, strokeWidth: 4, strokeLinecap: 'round' }); [[66, 64, c.a], [74, 70, c.b], [66, 76, c.light], [58, 70, c.a]].forEach(([x, y, f], i) => P('btn' + i, 'circle', { cx: x, cy: y, r: 3.2, fill: f })); break;
    case 'bag': P('body', 'path', { d: 'M24 54 L76 54 L82 100 L18 100 Z', fill: c.a }); P('handle', 'path', { d: 'M36 54 C36 34 64 34 64 54', ...stroke, strokeWidth: 4 }); P('tag', 'rect', { x: 58, y: 62, width: 12, height: 16, rx: 2, fill: c.b }); P('tagline', 'path', { d: 'M64 54 L64 62', ...stroke, strokeWidth: 1.5 }); break;
    case 'piggy': P('body', 'ellipse', { cx: 48, cy: 72, rx: 30, ry: 22, fill: c.a }); P('snout', 'ellipse', { cx: 78, cy: 74, rx: 8, ry: 6, fill: c.b }); P('nostril', 'circle', { cx: 80, cy: 74, r: 1.5, fill: c.ink }); P('ear', 'polygon', { points: '62,52 70,42 72,56', fill: c.a }); P('legL', 'rect', { x: 30, y: 88, width: 8, height: 12, rx: 2, fill: c.a }); P('legR', 'rect', { x: 58, y: 88, width: 8, height: 12, rx: 2, fill: c.a }); P('slot', 'rect', { x: 42, y: 50, width: 14, height: 3, rx: 1.5, fill: c.ink }); P('eye', 'circle', { cx: 66, cy: 66, r: 2, fill: c.ink }); P('coin', 'circle', { cx: 49, cy: 36, r: 8, fill: '#F2B134' }); P('coinsym', 'path', { d: 'M49 31 L49 41 M46 34 L52 34 M46 38 L52 38', stroke: c.ink, strokeWidth: 1.2, opacity: .6 }); break;
    case 'sapling': P('pot', 'path', { d: 'M30 74 L70 74 L64 102 L36 102 Z', fill: c.b }); P('rim', 'rect', { x: 27, y: 70, width: 46, height: 8, rx: 2, fill: c.b }); P('stem', 'path', { d: 'M50 72 L50 40', ...stroke, strokeWidth: 3, stroke: '#4F8A5B' }); P('leaf1', 'ellipse', { cx: 40, cy: 52, rx: 11, ry: 5.5, fill: c.a, transform: 'rotate(-30 40 52)' }); P('leaf2', 'ellipse', { cx: 60, cy: 46, rx: 11, ry: 5.5, fill: c.a, transform: 'rotate(30 60 46)' }); P('leaf3', 'ellipse', { cx: 50, cy: 34, rx: 6, ry: 9, fill: c.a }); break;
    case 'hanger': P('hook', 'path', { d: 'M50 30 C50 22 60 22 60 28 C60 32 50 32 50 38', ...stroke, strokeWidth: 2.5 }); P('tri', 'path', { d: 'M50 38 L18 60 L82 60 Z', ...stroke, strokeWidth: 2.5 }); P('dress', 'path', { d: 'M34 60 L30 102 L70 102 L66 60 Z', fill: c.a }); P('belt', 'rect', { x: 32, y: 76, width: 36, height: 4, fill: c.b }); break;
    case 'briefcase': P('handle', 'rect', { x: 40, y: 44, width: 20, height: 12, rx: 4, ...stroke, strokeWidth: 3 }); P('case', 'rect', { x: 20, y: 52, width: 60, height: 44, rx: 5, fill: c.a }); P('band', 'rect', { x: 20, y: 68, width: 60, height: 4, fill: c.ink, opacity: .25 }); P('clasp', 'rect', { x: 44, y: 66, width: 12, height: 8, rx: 2, fill: c.b }); break;
    case 'bottle': if (v % 2 === 0) { P('cap', 'rect', { x: 41, y: 22, width: 18, height: 16, rx: 3, fill: c.ink }); P('body', 'rect', { x: 32, y: 34, width: 36, height: 72, rx: 9, fill: c.a }); P('label', 'rect', { x: 38, y: 60, width: 24, height: 26, rx: 3, fill: c.light }); } else { P('lid', 'rect', { x: 30, y: 30, width: 40, height: 10, rx: 3, fill: c.ink }); P('jar', 'rect', { x: 32, y: 38, width: 36, height: 68, rx: 6, fill: c.a }); P('label', 'rect', { x: 38, y: 56, width: 24, height: 30, rx: 3, fill: c.light }); } P('l1', 'rect', { x: 42, y: 66, width: 16, height: 2.5, rx: 1, fill: c.ink, opacity: .6 }); P('l2', 'rect', { x: 42, y: 73, width: 10, height: 2.5, rx: 1, fill: c.ink, opacity: .35 }); P('shine', 'rect', { x: 37, y: 42, width: 4, height: 28, rx: 2, fill: '#FFFFFF', opacity: .35 }); break;
    default: {
      // Anything else is a motif from the shared library, scaled onto the plinth.
      const M = MOTIFS[id]; if (!M) break;
      const role = { accent: c.a, accent2: c.b, ink: c.ink, bg: c.light };
      const bx = 16, by = 24, sz = 68;
      M.parts.forEach((pt, i) => {
        const x = bx + (pt.x ?? 0) / 100 * sz, y = by + (pt.y ?? 0) / 100 * sz, w = (pt.w ?? 100) / 100 * sz, hh = (pt.h ?? 100) / 100 * sz, fill = role[pt.fill] || pt.fill;
        if (pt.d) P('m' + i, 'path', { d: pt.d, transform: `translate(${x} ${y}) scale(${w / 100} ${hh / 100})`, fill, fillRule: 'evenodd', opacity: pt.op });
        else if (pt.shape === 'ellipse') P('m' + i, 'ellipse', { cx: x + w / 2, cy: y + hh / 2, rx: w / 2, ry: hh / 2, fill, opacity: pt.op });
        else P('m' + i, 'rect', { x, y, width: w, height: hh, rx: pt.shape === 'rounded' ? Math.min(w, hh) * .18 : 0, fill, opacity: pt.op, transform: pt.rot ? `rotate(${pt.rot} ${x + w / 2} ${y + hh / 2})` : undefined });
      });
    }
  }
}

function sampleNode(h, el) {
  const { vb, k } = sampleArt(h, el.sample);
  return h('svg', { 'data-sample': el.sample.kind, viewBox: vb, preserveAspectRatio: 'xMidYMid slice', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', transform: `scale(${el.zoom || 1})${el.flip ? ' scaleX(-1)' : ''}`, transformOrigin: `${el.cx ?? 50}% ${el.cy ?? 50}%`, filter: filterCSS(el.filters), pointerEvents: 'none' } }, k);
}

function placeholder(h, el) {
  const s = Math.max(4, Math.min(el.w, el.h) / 36);
  return h('div', { 'data-placeholder': '1', style: { position: 'absolute', inset: 0, background: el.tint || '#DDD', backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,.06) 0 ${s}px, transparent ${s}px ${s * 4}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    h('span', { style: { fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: Math.max(10, Math.min(el.w, el.h) * .06), color: 'rgba(0,0,0,.55)', background: 'rgba(255,255,255,.6)', padding: '.3em .6em', borderRadius: 4, letterSpacing: '.02em', whiteSpace: 'nowrap' } }, el.label || 'Drop image'));
}

export function textStyle(el) {
  const st = { fontFamily: `'${el.font}', sans-serif`, fontSize: el.size, fontWeight: el.weight, fontStyle: el.italic ? 'italic' : 'normal', color: el.color, textAlign: el.align, lineHeight: el.lh, letterSpacing: (el.ls || 0) + 'em', textTransform: el.upper ? 'uppercase' : 'none', whiteSpace: 'pre-wrap', wordBreak: 'normal', overflowWrap: 'normal', margin: 0 };
  // Outline: stroke width in px (defaults to a hairline that scales with the size);
  // hollow unless the element keeps its fill. Shadow: an object, or `true` for the
  // original soft drop.
  if (el.outline) { if (!el.outlineFill) st.color = 'transparent'; st.WebkitTextStroke = `${el.outlineW ?? Math.max(1, el.size / 34)}px ${el.outline}`; st.paintOrder = 'stroke fill'; }
  if (el.shadow && typeof el.shadow === 'object') st.textShadow = `${el.shadow.x || 0}px ${el.shadow.y || 0}px ${el.shadow.blur || 0}px ${el.shadow.color || 'rgba(0,0,0,.35)'}`;
  else if (el.shadow) st.textShadow = `0 ${el.size * .06}px ${el.size * .18}px rgba(0,0,0,.35)`;
  return st;
}

export function renderEl(h, el, o = {}) {
  if (el.hidden && !o.showHidden) return null;
  const base = { position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.type === 'text' ? 'auto' : el.h, transform: [el.rot ? `rotate(${el.rot}deg)` : '', el.flipH && el.type !== 'image' ? 'scaleX(-1)' : ''].join(' ').trim() || undefined, opacity: el.opacity ?? 1, boxSizing: 'border-box' };
  const ev = o.interactive ? { onPointerDown: e => o.onElDown(e, el), onDoubleClick: e => o.onElDbl && o.onElDbl(e, el), onPointerEnter: () => o.onHover && o.onHover(el.id), onPointerLeave: () => o.onHover && o.onHover(null) } : {};
  const common = { key: el.id, 'data-el-id': el.id, ...ev };
  if (el.hidden) base.opacity = .25;
  if (el.type === 'text') {
    const st = { ...base, ...textStyle(el) };
    if (o.editingId === el.id) {
      return h('div', { ...common, onPointerDown: e => e.stopPropagation(), contentEditable: true, suppressContentEditableWarning: true, spellCheck: false, style: { ...st, outline: 'none', cursor: 'text', userSelect: 'text', WebkitUserSelect: 'text', minWidth: 10, caretColor: el.outline || el.color },
        ref: n => { if (n && !n.__pwFocused) { n.__pwFocused = 1; n.focus(); const r = document.createRange(); r.selectNodeContents(n); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } },
        onBlur: e => o.onTextCommit(el.id, e.currentTarget.innerText.replace(/\n$/, '')), onKeyDown: e => { e.stopPropagation(); if (e.key === 'Escape') e.currentTarget.blur(); } }, el.text);
    }
    const inner = el.bg ? h('span', { style: { background: el.bg, padding: '.04em .22em', WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone', borderRadius: el.size * .06 } }, el.text) : el.text;
    return h('div', { ...common, style: { ...st, padding: el.bg ? '0 .22em' : 0 } }, inner);
  }
  if (el.type === 'shape') return h('div', { ...common, style: { ...base, filter: el.shadow ? `drop-shadow(0 ${Math.min(el.w, el.h) * .04}px ${Math.min(el.w, el.h) * .06}px rgba(0,0,0,.22))` : undefined } }, h('svg', { width: el.w, height: el.h, viewBox: `0 0 ${el.w} ${el.h}`, style: { display: 'block', overflow: 'visible' } }, shapeNode(h, el)));
  if (el.type === 'line') {
    const sw = el.sw || 2, cy = el.h / 2, aw = el.arrow ? sw * 4 : 0;
    return h('div', { ...common, style: base }, h('svg', { width: el.w, height: el.h, viewBox: `0 0 ${el.w} ${el.h}`, style: { display: 'block', overflow: 'visible' } },
      h('line', { x1: sw / 2, y1: cy, x2: el.w - aw - (el.arrow ? 0 : sw / 2), y2: cy, stroke: el.stroke, strokeWidth: sw, strokeLinecap: el.dash ? 'butt' : 'round', strokeDasharray: el.dash ? `${sw * 2.5} ${sw * 2}` : undefined }),
      el.arrow ? h('polygon', { points: `${el.w},${cy} ${el.w - aw},${cy - aw * .6} ${el.w - aw},${cy + aw * .6}`, fill: el.stroke }) : null));
  }
  if (el.type === 'image') {
    const src = el.asset && o.assets && o.assets[el.asset] && o.assets[el.asset].src;
    const br = el.mask === 'circle' ? '50%' : el.mask === 'arch' ? `${el.w / 2}px ${el.w / 2}px 0 0` : (el.mask === 'rounded' ? Math.max(el.radius || 0, Math.min(el.w, el.h) * .08) : el.radius || 0);
    const st = { ...base, overflow: 'hidden', borderRadius: br, border: el.border && el.borderW ? `${el.borderW}px solid ${el.border}` : undefined, boxShadow: el.shadow ? `0 ${Math.min(el.w, el.h) * .03}px ${Math.min(el.w, el.h) * .08}px rgba(0,0,0,.22)` : undefined, background: src ? 'transparent' : undefined };
    const img = src ? h('img', { src, draggable: false, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: el.fit || 'cover', objectPosition: `${el.cx ?? 50}% ${el.cy ?? 50}%`, transform: `scale(${el.zoom || 1})${el.flip ? ' scaleX(-1)' : ''}`, transformOrigin: `${el.cx ?? 50}% ${el.cy ?? 50}%`, filter: filterCSS(el.filters), display: 'block', pointerEvents: 'none', userSelect: 'none' } }) : el.sample ? sampleNode(h, el) : placeholder(h, el);
    return h('div', { ...common, style: st }, img);
  }
  if (el.type === 'qr') {
    const q = qrPath(el.value);
    return h('div', { ...common, style: base }, h('svg', { width: el.w, height: el.h, viewBox: q ? `0 0 ${q.size} ${q.size}` : '0 0 10 10', shapeRendering: 'crispEdges', style: { display: 'block' } }, h('rect', { width: '100%', height: '100%', fill: el.qbg || '#fff' }), q ? h('path', { d: q.d, fill: el.fg || '#000' }) : null));
  }
  if (el.type === 'chart') return h('div', { ...common, style: base }, chartNode(h, el));
  return null;
}

export function renderPage(h, page, doc, o = {}) {
  const bgImg = page.bgAsset && o.assets && o.assets[page.bgAsset];
  return h('div', { 'data-page-node': page.id, onPointerDown: o.onPageDown, style: { position: 'relative', width: doc.w, height: doc.h, backgroundColor: page.bg || '#FFFFFF', backgroundImage: bgImg ? `url(${bgImg.src})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden', pointerEvents: o.interactive ? 'auto' : 'none', userSelect: 'none', WebkitUserSelect: 'none' } },
    page.els.map(el => renderEl(h, el, o)));
}

export function renderThumb(h, doc, page, width, maxH, o = {}) {
  let s = width / doc.w; if (maxH && doc.h * s > maxH) s = maxH / doc.h;
  return h('div', { style: { width: doc.w * s, height: doc.h * s, position: 'relative', overflow: 'hidden', flex: 'none' } },
    h('div', { style: { position: 'absolute', left: 0, top: 0, transform: `scale(${s})`, transformOrigin: '0 0' } }, renderPage(h, page, doc, o)));
}
