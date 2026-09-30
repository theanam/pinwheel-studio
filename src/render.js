// Pinwheel Studio — renderer. Pure functions of (h = React.createElement, element model).
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
    if (c.bg !== 'none') { k.push(h('rect', { key: 'bg', width: 100, height: 130, fill: c.bg })); k.push(h('circle', { key: 'halo', cx: 50, cy: 66, r: 44, fill: c.halo })); }
    if (v === 1) k.push(h('path', { key: 'hairL', d: 'M24 60 C22 24 78 24 76 60 L80 96 L20 96 Z', fill: hair }));
    k.push(h('path', { key: 'body', d: 'M8 130 C8 102 30 94 50 94 C70 94 92 102 92 130 Z', fill: c.shirt }));
    k.push(h('rect', { key: 'neck', x: 42, y: 76, width: 16, height: 20, fill: skin }));
    k.push(h('circle', { key: 'earL', cx: 28, cy: 60, r: 5, fill: skin })); k.push(h('circle', { key: 'earR', cx: 72, cy: 60, r: 5, fill: skin }));
    k.push(h('ellipse', { key: 'head', cx: 50, cy: 56, rx: 23, ry: 27, fill: skin }));
    if (v === 0) k.push(h('path', { key: 'hair', d: 'M27 54 C27 26 73 26 73 54 C66 40 34 40 27 54 Z', fill: hair }));
    if (v === 1) k.push(h('path', { key: 'hair', d: 'M27 50 C29 26 71 26 73 50 C62 38 38 38 27 50 Z', fill: hair }));
    if (v === 2) { k.push(h('path', { key: 'hair', d: 'M27 52 C27 28 73 28 73 52 C68 42 32 42 27 52 Z', fill: hair })); k.push(h('circle', { key: 'bun', cx: 50, cy: 28, r: 9, fill: hair })); }
    if (v === 3) [30, 40, 50, 60, 70].forEach((x, i) => k.push(h('circle', { key: 'curl' + i, cx: x, cy: 34 + (i % 2) * 3, r: 8, fill: hair })));
    k.push(h('circle', { key: 'eyeL', cx: 41, cy: 58, r: 2.4, fill: c.ink })); k.push(h('circle', { key: 'eyeR', cx: 59, cy: 58, r: 2.4, fill: c.ink }));
    if (v === 2) { k.push(h('circle', { key: 'gL', cx: 41, cy: 58, r: 6.5, fill: 'none', stroke: c.ink, strokeWidth: 1.4 })); k.push(h('circle', { key: 'gR', cx: 59, cy: 58, r: 6.5, fill: 'none', stroke: c.ink, strokeWidth: 1.4 })); k.push(h('path', { key: 'gB', d: 'M47.5 58 L52.5 58', stroke: c.ink, strokeWidth: 1.4 })); }
    k.push(h('path', { key: 'browL', d: 'M36 51 Q41 48 46 51', stroke: c.ink, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' }));
    k.push(h('path', { key: 'browR', d: 'M54 51 Q59 48 64 51', stroke: c.ink, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' }));
    k.push(h('path', { key: 'smile', d: 'M43 69 Q50 76 57 69', stroke: c.ink, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' }));
    k.push(h('circle', { key: 'chL', cx: 35, cy: 66, r: 3.5, fill: '#E8674A', opacity: .25 })); k.push(h('circle', { key: 'chR', cx: 65, cy: 66, r: 3.5, fill: '#E8674A', opacity: .25 }));
    return { vb: '0 0 100 130', k };
  }
  if (kind === 'product') {
    k.push(h('rect', { key: 'bg', width: 100, height: 130, fill: c.bg }));
    k.push(h('ellipse', { key: 'plinth', cx: 50, cy: 112, rx: 34, ry: 8, fill: c.plinth }));
    if (v % 2 === 0) { k.push(h('rect', { key: 'cap', x: 41, y: 22, width: 18, height: 16, rx: 3, fill: c.cap })); k.push(h('rect', { key: 'body', x: 32, y: 34, width: 36, height: 76, rx: 9, fill: c.body })); k.push(h('rect', { key: 'label', x: 38, y: 62, width: 24, height: 26, rx: 3, fill: c.label })); }
    else { k.push(h('rect', { key: 'lid', x: 30, y: 30, width: 40, height: 10, rx: 3, fill: c.cap })); k.push(h('rect', { key: 'jar', x: 32, y: 38, width: 36, height: 72, rx: 6, fill: c.body })); k.push(h('rect', { key: 'label', x: 38, y: 58, width: 24, height: 30, rx: 3, fill: c.label })); }
    k.push(h('rect', { key: 'l1', x: 42, y: v % 2 ? 66 : 70, width: 16, height: 2.5, rx: 1, fill: c.cap, opacity: .7 })); k.push(h('rect', { key: 'l2', x: 42, y: v % 2 ? 73 : 77, width: 10, height: 2.5, rx: 1, fill: c.cap, opacity: .4 }));
    k.push(h('rect', { key: 'shine', x: 37, y: 42, width: 4, height: 30, rx: 2, fill: '#FFFFFF', opacity: .35 }));
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
  if (el.outline) { st.color = 'transparent'; st.WebkitTextStroke = `${Math.max(1, el.size / 34)}px ${el.outline}`; }
  if (el.shadow) st.textShadow = `0 ${el.size * .06}px ${el.size * .18}px rgba(0,0,0,.35)`;
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
