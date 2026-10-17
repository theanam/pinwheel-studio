// Pinwheel Studio — the welcome tour. Shown once, the first time the studio opens
// on a device, and again whenever someone picks "Take the tour" from Help.
//
// Every slide pairs a visual with a short write-up. The visuals are drawn with the
// studio's own renderer wherever they can be (templates, text styles, shapes,
// charts, QR codes and patterns), so the tour shows the real thing at small size.
// Studio passes a `kit`: the loaded modules, a document builder and the live counts.
import { createElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Mark from './lib/Mark.jsx';

/** Whether the tour has been seen on this device. Kept in localStorage, so it lasts until site data is cleared. */
export const TOUR_KEY = 'pinwheel.tour';
export function tourSeen() { try { return localStorage.getItem(TOUR_KEY) === 'seen'; } catch (e) { return false; } }
export function markTourSeen() { try { localStorage.setItem(TOUR_KEY, 'seen'); } catch (e) { } }

const UI = "'Source Sans 3', system-ui, sans-serif", SERIF = "'DM Serif Display', Georgia, serif", MONO = "'IBM Plex Mono', ui-monospace, monospace";
const n = x => Number(x).toLocaleString();
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- icons ---------- */
// 24px line icons, drawn for the tour. A path of a single point is a dot.
const ICONS = {
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM16.5 16.5L21 21',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01',
  swap: 'M4 8h14l-3.5-3.5M20 16H6l3.5 3.5',
  palette: 'M12 3a9 9 0 1 0 0 18c1.3 0 1.7-1 1.2-1.9-.5-1 .1-2.1 1.3-2.1H17a4 4 0 0 0 4-4c0-5.3-4-10-9-10zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01',
  type: 'M5 7V5h14v2M12 5v14M9 19h6',
  shuffle: 'M3 7h3c5 0 7 10 12 10h3M3 17h3c2 0 3.2-1.6 4.4-3.6M13.6 9.6C15 8 16.3 7 18 7h3M18 4l3 3-3 3M18 14l3 3-3 3',
  resize: 'M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6',
  layout: 'M4 4h9v7H4zM15 4h5v16h-5zM4 13h9v7H4z',
  pages: 'M8 3h11v14H8zM5 7v14h11',
  font: 'M3 19l5.5-14h1L15 19M5.2 14h7.6M17 11c2.6 0 4 1 4 3v5M21 15.6c-1.2-.9-5-1.2-5 1.2 0 2.5 4 2.2 5 .2',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
  wand: 'M4 20L15 9M13 7l4 4M17 3v3M15.5 4.5h3M20 8v2.5M18.8 9.2h2.5',
  crop: 'M6 2v16h16M2 6h16v16',
  person: 'M12 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM5 20c0-3.9 3.1-6 7-6s7 2.1 7 6',
  shapes: 'M7.5 3l4.5 7.5H3zM17 13.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM14 3h7v7h-7zM3 14h7v7H3z',
  chart: 'M4 20h16M7 16v-5M12 16V6M17 16v-8',
  dots: 'M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01',
  dropper: 'M15 4.5l4.5 4.5-2 2L13 6.5zM14 8L6 16v3h3l8-8',
  stack: 'M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5',
  share: 'M12 3v12M8 7l4-4 4 4M5 12v8h14v-8',
  magnet: 'M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4zM6 8h4M14 8h4',
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
  save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  install: 'M3 5h18v11H3zM9 20h6M12 16v4M12 7.5v5.5M9.5 10.5L12 13l2.5-2.5',
  phone: 'M7 3h10v18H7zM11 18h2',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
  wifi: 'M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0M12 19h.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z',
  chip: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
  arrow: 'M5 12h14M13 6l6 6-6 6'
};
function Icon({ name, size = 20, color = 'currentColor', width = 1.8 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', flex: 'none' }}><path d={ICONS[name]} /></svg>;
}

/* ---------- visual building blocks ---------- */
/** A fixed 520×420 drawing area, scaled to fit whatever space the slide gives it. */
const SW = 520, SH = 420;
function Stage({ children }) {
  const ref = useRef(null); const [s, setS] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => { const r = el.getBoundingClientRect(); if (r.width && r.height) setS(Math.min(1.3, r.width / SW, r.height / SH)); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: SW, height: SH, flex: 'none', transform: `scale(${s})` }}>{children}</div>
    </div>
  );
}

/** Built tour documents, kept for the session so flipping back and forth costs nothing. */
const built = new Map();
function useDoc(kit, desc, brand) {
  const key = JSON.stringify([desc, brand && brand.name]);
  return useMemo(() => { if (!built.has(key)) built.set(key, kit.doc(desc, brand)); return built.get(key); }, [key]);
}
/** One page of a real template, drawn by the studio's renderer. */
function Thumb({ kit, desc, brand, w, h, radius = 8, shadow = true, page = 0 }) {
  const doc = useDoc(kit, desc, brand);
  return (
    <div style={{ borderRadius: radius, overflow: 'hidden', boxShadow: shadow ? '0 14px 34px rgba(20,18,15,.22), 0 2px 6px rgba(20,18,15,.12)' : 'none', width: 'max-content', background: '#fff' }}>
      {kit.R.renderThumb(createElement, doc, doc.pages[page] || doc.pages[0], w, h, {})}
    </div>
  );
}
/** An absolutely placed, optionally tilted item that drifts gently. */
function Float({ x, y, rot = 0, z, delay = 0, drift = true, children, style }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: z, transform: rot ? `rotate(${rot}deg)` : undefined, ...style }}>
      <div className={drift ? 'pw-tour-float pw-tour-anim' : undefined} style={{ animationDelay: `${delay}s` }}>{children}</div>
    </div>
  );
}
function Pill({ children, icon, x, y, dark, style }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 15, background: dark ? '#1F1C18' : '#FFFFFF', color: dark ? '#FFFFFF' : '#1F1C18', fontFamily: UI, fontSize: 13, fontWeight: 700, boxShadow: '0 6px 18px rgba(20,18,15,.16)', whiteSpace: 'nowrap', ...style }}>
      {icon ? <Icon name={icon} size={15} /> : null}{children}
    </div>
  );
}
const card = { position: 'absolute', background: '#FFFFFF', borderRadius: 14, boxShadow: '0 16px 40px rgba(20,18,15,.18), 0 2px 6px rgba(20,18,15,.08)', fontFamily: UI, color: '#24211D' };
const D = (fmt, layout, topic, pal, pair) => ({ fmt, layout, topic, pal, pair });

/* ---------- the visuals, one per slide ---------- */
function WelcomeVis({ kit }) {
  return (
    <Stage>
      <Float x={36} y={18} rot={-6} delay={.4}><Thumb kit={kit} desc={D('pin', 'circle-portrait', 'fitness', 'citrus', 'impact')} w={112} /></Float>
      <Float x={286} y={22} rot={5} delay={1.1}><Thumb kit={kit} desc={D('yt-thumb', 'split-photo', 'coffee', 'sand', 'instrument')} w={206} /></Float>
      <Float x={16} y={196} rot={-3} delay={1.6}><Thumb kit={kit} desc={D('ig-story', 'photo-band', 'christmas', 'crimson', 'luxe')} w={118} /></Float>
      <Float x={374} y={168} rot={6} delay={.8}><Thumb kit={kit} desc={D('a4', 'magazine', 'music', 'midnight', 'poster')} w={128} /></Float>
      <Float x={160} y={96} z={2} delay={0}><Thumb kit={kit} desc={D('ig-post', 'hero-photo', 'diwali', 'plum', 'classic')} w={200} radius={10} /></Float>
      <Pill x={170} y={334} dark icon="grid" style={{ zIndex: 3 }}>{n(kit.stats.templates)} templates · {kit.stats.formats} formats</Pill>
    </Stage>
  );
}

function TemplatesVis({ kit }) {
  const fmts = ['All', 'Instagram', 'YouTube', 'Flyer', 'Presentation'];
  const occ = [['Birthday', '#FFB703'], ['Eid', '#2A9D8F'], ['Diwali', '#F4A261'], ['Christmas', '#C1121F'], ['Wedding', '#E5989B']];
  const grid = [D('ig-post', 'circle-portrait', 'birthday-wish', 'citrus', 'round'), D('ig-post', 'celebration', 'christmas', 'festive', 'script'), D('ig-post', 'photo-band', 'eid'), D('ig-post', 'split-photo', 'diwali'), D('ig-post', 'arch-window', 'valentine'), D('ig-post', 'pattern-invite', 'baby')];
  const chip = on => ({ height: 26, padding: '0 11px', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, background: on ? '#24211D' : '#F1EEE9', color: on ? '#FFFFFF' : '#57514A', whiteSpace: 'nowrap' });
  return (
    <Stage>
      <div style={{ ...card, left: 30, top: 8, width: 460, height: 404, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 36, borderRadius: 9, border: '1.5px solid #1F7D62', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', fontSize: 14 }}>
          <Icon name="search" size={16} color="#6E675E" />
          <span style={{ fontWeight: 600 }}>birthday</span><span className="pw-tour-caret pw-tour-anim" style={{ width: 1.5, height: 17, background: '#1F7D62', marginLeft: -6 }} />
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8A837A' }}>{n(kit.stats.templates)} templates</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>{fmts.map((f, i) => <span key={f} style={chip(i === 0)}>{f}</span>)}</div>
        <div style={{ display: 'flex', gap: 6 }}>{occ.map(([o, c]) => <span key={o} style={chip(false)}><i style={{ width: 8, height: 8, borderRadius: 4, background: c }} />{o}</span>)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 4 }}>
          {grid.map((d, i) => <div key={i} className="pw-tour-rise pw-tour-anim" style={{ animationDelay: `${i * 70}ms` }}><Thumb kit={kit} desc={d} w={132} radius={7} shadow={false} /></div>)}
        </div>
      </div>
    </Stage>
  );
}

const RESTYLE = [['tomato', 'fatface'], ['midnight', 'poster'], ['mint', 'round'], ['lavender', 'editorial'], ['forest', 'fraunces'], ['citrus', 'impact']];
function RestyleVis({ kit }) {
  const [i, setI] = useState(0); const [auto, setAuto] = useState(!reduced());
  useEffect(() => { if (!auto) return; const t = setInterval(() => setI(x => (x + 1) % RESTYLE.length), 1900); return () => clearInterval(t); }, [auto]);
  const P = kit.P, pick = k => { setAuto(false); setI(k); };
  return (
    <Stage>
      <div style={{ position: 'absolute', left: 24, top: 58, width: 268, height: 268, borderRadius: 12, boxShadow: '0 18px 40px rgba(20,18,15,.25)', overflow: 'hidden' }}>
        {RESTYLE.map(([pal, pair], k) => (
          <div key={pal} style={{ position: 'absolute', inset: 0, opacity: k === i ? 1 : 0, transition: 'opacity .45s ease' }}>
            <Thumb kit={kit} desc={D('ig-post', 'pattern-card', 'food', pal, pair)} w={268} radius={0} shadow={false} />
          </div>
        ))}
      </div>
      <div style={{ ...card, left: 312, top: 34, width: 186, padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8A837A' }}>Palette</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {RESTYLE.map(([pal], k) => { const p = P.PALETTE[pal]; return (
            <button key={pal} onClick={() => pick(k)} title={p.name} aria-label={`Try the ${p.name} palette`} style={{ width: 46, height: 46, padding: 0, borderRadius: 23, border: 'none', cursor: 'pointer', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', boxShadow: k === i ? '0 0 0 2.5px #FFFFFF, 0 0 0 4.5px #1F7D62' : '0 0 0 1px rgba(0,0,0,.12)', transition: 'box-shadow .2s' }}>
              {[p.bg, p.accent, p.ink, p.accent2].map((c, j) => <i key={j} style={{ background: c }} />)}
            </button>
          ); })}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8A837A', marginTop: 4 }}>Type pairing</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RESTYLE.map(([pal, pair], k) => { const p = P.PAIRING[pair]; return (
            <button key={pair} onClick={() => pick(k)} style={{ height: 30, border: 'none', borderRadius: 7, padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: k === i ? '#DDF1E8' : 'transparent', color: '#24211D', fontFamily: `'${p.display}', serif`, fontWeight: p.dw, fontSize: 16, textTransform: p.upper ? 'uppercase' : 'none', transition: 'background .2s', whiteSpace: 'nowrap', gap: 8 }}>
              {p.name}<span style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, color: '#8A837A', textTransform: 'none' }}>{p.body}</span>
            </button>
          ); })}
        </div>
      </div>
      <Pill x={70} y={346} icon="palette">{auto ? 'Restyling on its own · tap a swatch' : 'Tap any swatch to try it'}</Pill>
    </Stage>
  );
}

function ResizeVis({ kit }) {
  const items = [['Instagram post', D('ig-post', 'celebration', 'christmas', 'crimson', 'luxe'), 150, 22, 40], ['Story', D('ig-story', 'photo-band', 'christmas', 'crimson', 'luxe'), 98, 196, 22], ['YouTube thumbnail', D('yt-thumb', 'split-photo', 'christmas', 'crimson', 'luxe'), 200, 314, 54], ['LinkedIn banner', D('li-banner', 'banner-photo', 'christmas', 'crimson', 'luxe'), 476, 22, 268]];
  return (
    <Stage>
      {items.map(([label, d, w, x, y], i) => (
        <div key={label} className="pw-tour-seq pw-tour-anim" style={{ position: 'absolute', left: x, top: y, animationDelay: `${i * .9}s` }}>
          <Thumb kit={kit} desc={d} w={w} radius={6} />
          <div style={{ marginTop: 8, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: 'var(--pw-tour-ink)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="resize" size={13} />{label}</div>
        </div>
      ))}
    </Stage>
  );
}

function TypeVis({ kit }) {
  const R = kit.R;
  const samples = [
    ['Outlined', { text: 'OUTLINED', font: 'Anton', weight: 400, size: 46, color: '#FFE45E', outline: '#FFE45E', outlineW: 2, ls: .02 }],
    ['Neon', { text: 'Neon', font: 'Pacifico', weight: 400, size: 46, color: '#FFF0F7', outline: '#FF4F9A', outlineW: 1.2, outlineFill: true, shadow: { x: 0, y: 0, blur: 16, color: '#FF4F9A' } }],
    ['Retro offset', { text: 'Retro', font: 'Abril Fatface', weight: 400, size: 50, color: '#FF6F59', outline: '#FFF4E6', outlineW: 1.6, outlineFill: true, shadow: { x: 4, y: 4, blur: 0, color: '#3A86FF' } }],
    ['Long shadow', { text: 'LONG SHADOW', font: 'Bebas Neue', weight: 400, size: 40, color: '#FFF4E6', ls: .02, shadow: { x: 9, y: 9, blur: 0, color: '#E4572E', long: true } }],
    ['Highlighter', { text: 'Highlight', font: 'Playfair Display', weight: 700, size: 32, y: 36, color: '#1B1A17', bg: '#FFE45E' }],
    ['Elegant', { text: 'ELEGANT', font: 'Cormorant Garamond', weight: 700, size: 34, color: '#F4EFE6', ls: .25 }]
  ];
  return (
    <Stage>
      <div style={{ position: 'absolute', left: 30, top: 6, width: 460, height: 38, borderRadius: 10, background: '#2F2B26', border: '1px solid #45403A', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', fontFamily: UI, fontSize: 14, color: '#CFC9BF' }}>
        <Icon name="search" size={16} />Search {kit.stats.fonts ? n(kit.stats.fonts) : 'close to 2,000'} fonts
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>{['Display', 'Serif', 'Sans', 'Script', 'Mono'].map(c => <span key={c} style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: '#3A3530', color: '#E8E2D8' }}>{c}</span>)}</span>
      </div>
      <div style={{ position: 'absolute', left: 30, top: 58, width: 460, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {samples.map(([label, el], i) => (
          <div key={label} className="pw-tour-rise pw-tour-anim" style={{ animationDelay: `${i * 80}ms`, height: 108, borderRadius: 12, background: '#2A2622', border: '1px solid #3A3530', position: 'relative', overflow: 'hidden' }}>
            {R.renderEl(createElement, { id: 'tour-' + i, type: 'text', x: 0, y: 28, w: 224, h: 60, rot: 0, opacity: 1, align: 'center', lh: 1.1, italic: false, upper: false, ...el })}
            <div style={{ position: 'absolute', left: 10, top: 8, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: '#8F887D' }}>{label}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
}

function PhotoVis() {
  // A photo, its background lifted away, then a border and shadow that follow the subject.
  const person = (
    <g>
      <path d="M58 300c4-58 40-88 92-88s88 30 92 88z" fill="#2E86AB" />
      <path d="M128 196h44v28c0 12-44 12-44 0z" fill="#B97A50" />
      <ellipse cx="150" cy="150" rx="46" ry="54" fill="#C68B59" />
      <path d="M102 146c-4-48 26-70 50-70 32 0 54 24 48 66-6-22-22-34-46-36-22-2-42 12-52 40z" fill="#2B1D14" />
      <path d="M134 168c10 8 22 8 32 0" stroke="#7A4A2A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="132" cy="146" r="4.5" fill="#2B1D14" /><circle cx="168" cy="146" r="4.5" fill="#2B1D14" />
      <path d="M150 212l-14 18 14 34 14-34z" fill="#F4EFE6" />
    </g>
  );
  return (
    <Stage>
      <div style={{ position: 'absolute', left: 14, top: 40, width: 300, height: 320, borderRadius: 14, overflow: 'hidden', boxShadow: '0 18px 40px rgba(20,18,15,.25)', backgroundColor: '#FFFFFF', backgroundImage: 'linear-gradient(45deg, #E6E1D9 25%, transparent 25%, transparent 75%, #E6E1D9 75%), linear-gradient(45deg, #E6E1D9 25%, transparent 25%, transparent 75%, #E6E1D9 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
        <svg className="pw-tour-scene pw-tour-anim" width="300" height="320" viewBox="0 0 300 320" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          <defs><linearGradient id="pw-tour-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFB38A" /><stop offset=".6" stopColor="#FFD9A8" /><stop offset="1" stopColor="#FFE9C9" /></linearGradient></defs>
          <rect width="300" height="320" fill="url(#pw-tour-sky)" />
          <circle cx="232" cy="88" r="34" fill="#FFF3D6" />
          <path d="M0 230c50-40 90-46 140-20s100 20 160-14v124H0z" fill="#E58F65" />
          <path d="M0 262c60-26 120-18 170 2s90 14 130-6v62H0z" fill="#C8553D" />
        </svg>
        <svg className="pw-tour-subject pw-tour-anim" width="300" height="320" viewBox="0 0 300 320" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">{person}</svg>
        <div className="pw-tour-scan pw-tour-anim" style={{ position: 'absolute', top: 0, bottom: 0, width: 60, left: -60, background: 'linear-gradient(90deg, transparent, rgba(92,196,160,.55), transparent)' }} />
      </div>
      <Pill x={30} y={22} dark icon="chip" style={{ zIndex: 2 }}>Runs on your device</Pill>
      <div style={{ position: 'absolute', left: 334, top: 70, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[['wand', 'Remove background'], ['crop', 'Crop & focus'], ['person', 'Hugging border'], ['sparkle', 'Filters'], ['grid', 'Masks']].map(([ic, t], i) => (
          <div key={t} className="pw-tour-rise pw-tour-anim" style={{ animationDelay: `${i * 90}ms`, display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px 0 10px', borderRadius: 11, background: i === 0 ? '#1F7D62' : '#FFFFFF', color: i === 0 ? '#FFFFFF' : '#24211D', fontFamily: UI, fontSize: 13.5, fontWeight: 700, boxShadow: '0 8px 20px rgba(20,18,15,.14)', whiteSpace: 'nowrap' }}>
            <Icon name={ic} size={17} />{t}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function ElementsVis({ kit }) {
  const R = kit.R, PT = kit.PT, h = createElement;
  // QR codes draw with a library fetched on first use; repaint once it is in.
  const [, setQR] = useState(0);
  useEffect(() => { let live = true; kit.qr().then(() => live && setQR(1)).catch(() => { }); return () => { live = false; }; }, []);
  const cols = ['#E4572E', '#3A86FF', '#FFB703', '#1F7D62', '#7B5CFA', '#FF4F79', '#2E86AB', '#D9A441'];
  const shapes = ['star', 'heart', 'burst', 'speech', 'hexagon', 'bolt', 'cloud', 'gear'].map((s, i) => {
    const ar = R.SHAPE_INFO[s][1], w = ar >= 1 ? 48 : 48 * ar, hh = ar >= 1 ? 48 / ar : 48;
    return h('div', { key: s, className: 'pw-tour-pop pw-tour-anim', style: { position: 'relative', width: 56, height: 56, animationDelay: `${i * 60}ms` } }, R.renderEl(h, { id: 'tour-s' + i, type: 'shape', shape: s, x: (56 - w) / 2, y: (56 - hh) / 2, w, h: hh, rot: 0, opacity: 1, fill: cols[i], stroke: null, sw: 0, radius: 0, points: s === 'burst' ? 16 : s === 'gear' ? 8 : 5, inner: s === 'burst' ? .82 : .5, sides: 6 }, {}));
  });
  const data = [{ l: 'Mon', v: 3 }, { l: 'Tue', v: 5 }, { l: 'Wed', v: 4 }, { l: 'Thu', v: 7 }];
  const pats = PT.PATTERN_CATS.slice(1).map(([c]) => PT.PATTERNS.find(p => p.cat === c)).filter(Boolean);
  const patCols = [['#D6F0E3', '#0E3B2E'], ['#FFE45E', '#1A1A1A'], ['#0F1226', '#FFB84D'], ['#F4EFE6', '#E4572E'], ['#E9E3F7', '#7B5CFA'], ['#1F3A2E', '#D9A441']];
  const tile = { ...card, padding: 14 };
  const label = t => <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8A837A', marginBottom: 8 }}>{t}</div>;
  return (
    <Stage>
      <div style={{ ...tile, left: 14, top: 14, width: 300, height: 184 }}>
        {label(`${kit.stats.shapes} shapes`)}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 56px)', justifyContent: 'space-between', rowGap: 8 }}>{shapes}</div>
      </div>
      <div style={{ ...tile, left: 328, top: 14, width: 178, height: 184 }}>
        {label('Charts')}
        <div style={{ position: 'relative', width: 150, height: 64 }}>{R.renderEl(h, { id: 'tour-c1', type: 'chart', chart: 'donut', x: 0, y: 0, w: 150, h: 64, rot: 0, opacity: 1, data, colors: ['#1F7D62', '#FFB703', '#E4572E', '#3A86FF'], ink: '#24211D', font: 'Source Sans 3', labels: true, hole: '#FFFFFF' }, {})}</div>
        <div style={{ position: 'relative', width: 150, height: 66, marginTop: 10 }}>{R.renderEl(h, { id: 'tour-c2', type: 'chart', chart: 'bar', x: 0, y: 0, w: 150, h: 66, rot: 0, opacity: 1, data, colors: ['#3A86FF', '#3A86FF', '#3A86FF', '#E4572E'], ink: '#24211D', font: 'Source Sans 3', labels: true }, {})}</div>
      </div>
      <div style={{ ...tile, left: 14, top: 212, width: 156, height: 194 }}>
        {label('QR codes')}
        <div style={{ position: 'relative', width: 128, height: 128 }}>{R.renderEl(h, { id: 'tour-q', type: 'qr', x: 0, y: 0, w: 128, h: 128, rot: 0, opacity: 1, value: 'https://pinwheelstudio.org', fg: '#24211D', qbg: '#FFFFFF' }, {})}</div>
      </div>
      <div style={{ ...tile, left: 184, top: 212, width: 322, height: 194 }}>
        {label(`${kit.stats.patterns} patterns`)}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {pats.map((p, i) => { const [bg, fg] = patCols[i % patCols.length]; const css = PT.patternCSS({ id: p.id, fg, alpha: .55, scale: .7 }); return (
            <div key={p.id} className="pw-tour-pop pw-tour-anim" title={p.name} style={{ animationDelay: `${i * 60}ms`, height: 64, borderRadius: 8, backgroundColor: bg, backgroundImage: css.image, backgroundSize: css.size, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }} />
          ); })}
        </div>
      </div>
    </Stage>
  );
}

// A sample brand: the colours and faces of a small coffee roaster.
const SAMPLE_BRAND = { name: 'Hearth & Bean', bg: '#F3ECE2', ink: '#2B1D14', accent: '#C8553D', accent2: '#2F6F73', heading: 'Fraunces', body: 'Work Sans' };
function BrandVis({ kit }) {
  const b = SAMPLE_BRAND;
  return (
    <Stage>
      <div style={{ ...card, left: 12, top: 30, width: 226, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true"><circle cx="23" cy="23" r="23" fill={b.accent} /><ellipse cx="23" cy="23" rx="9" ry="13" fill={b.bg} transform="rotate(30 23 23)" /><path d="M18 14c6 5 4 13 10 18" stroke={b.accent} strokeWidth="2.6" fill="none" strokeLinecap="round" /></svg>
          <div style={{ fontFamily: `'${b.heading}', serif`, fontWeight: 700, fontSize: 18, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{b.name}</div>
        </div>
        <div style={{ position: 'relative', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8A837A' }}>Colours</span>
          <div className="pw-tour-float pw-tour-anim" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px 4px 5px', borderRadius: 12, background: '#24211D', color: '#FFFFFF', fontFamily: MONO, fontSize: 11, boxShadow: '0 6px 14px rgba(0,0,0,.25)' }}>
            <Icon name="dropper" size={14} /><i style={{ width: 11, height: 11, borderRadius: 6, background: b.accent, border: '1.5px solid #FFFFFF' }} />{b.accent}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>{[b.bg, b.ink, b.accent, b.accent2].map(c => <i key={c} style={{ width: 40, height: 40, borderRadius: 10, background: c, boxShadow: c === b.accent ? '0 0 0 2px #FFFFFF, 0 0 0 4px #24211D' : 'inset 0 0 0 1px rgba(0,0,0,.1)' }} />)}</div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8A837A' }}>Fonts</div>
        <div style={{ fontFamily: `'${b.heading}', serif`, fontWeight: 700, fontSize: 26, lineHeight: 1 }}>{b.heading}</div>
        <div style={{ fontFamily: `'${b.body}', sans-serif`, fontSize: 15, color: '#57514A', marginTop: -4 }}>{b.body} for body text</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>{['Logo', 'Images', 'Styles'].map(t => <span key={t} style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 10, background: '#F1EEE9', color: '#57514A' }}>{t}</span>)}</div>
      </div>
      <Float x={256} y={20} rot={-3} delay={.3}><Thumb kit={kit} desc={D('ig-post', 'polaroid', 'coffee')} brand={b} w={150} /></Float>
      <Float x={404} y={44} rot={4} delay={1.2}><Thumb kit={kit} desc={D('ig-story', 'episode', 'food')} brand={b} w={100} /></Float>
      <Float x={262} y={232} rot={2} delay={.7}><Thumb kit={kit} desc={D('yt-thumb', 'split-photo', 'coffee')} brand={b} w={230} /></Float>
    </Stage>
  );
}

function LayoutVis({ kit }) {
  const desc = D('ig-post', 'photo-stat', 'coffee', 'gold', 'fraunces'), doc = useDoc(kit, desc), page = doc.pages[0];
  const S = 270, s = S / doc.w;
  const texts = page.els.filter(e => e.type === 'text'), sel = texts.reduce((a, e) => (!a || e.size > a.size ? e : a), null) || page.els[page.els.length - 1];
  const box = { left: sel.x * s, top: sel.y * s, width: sel.w * s, height: Math.max(18, (sel.h || sel.size * 1.2) * s) };
  const layers = page.els.slice(-6).reverse();
  const handle = (l, t) => <i key={l + t} style={{ position: 'absolute', left: `calc(${l} - 4px)`, top: `calc(${t} - 4px)`, width: 8, height: 8, background: '#FFFFFF', border: '1.5px solid #1F7D62', borderRadius: 2 }} />;
  return (
    <Stage>
      <div style={{ position: 'absolute', left: 22, top: 56, width: S, height: S }}>
        <Thumb kit={kit} desc={desc} w={S} radius={4} />
        <i className="pw-tour-guide pw-tour-anim" style={{ position: 'absolute', left: S / 2, top: -16, bottom: -16, width: 1, background: '#E23D9A' }} />
        <i className="pw-tour-guide pw-tour-anim" style={{ position: 'absolute', top: box.top, left: -16, right: -16, height: 1, background: '#E23D9A', animationDelay: '.4s' }} />
        <div style={{ position: 'absolute', ...box, outline: '1.5px solid #1F7D62' }}>{[['0%', '0%'], ['50%', '0%'], ['100%', '0%'], ['0%', '50%'], ['100%', '50%'], ['0%', '100%'], ['50%', '100%'], ['100%', '100%']].map(([l, t]) => handle(l, t))}</div>
      </div>
      <div style={{ ...card, left: 314, top: 30, width: 190, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}><Icon name="stack" size={16} />Layers</div>
        {layers.map((e, i) => { const on = e.id === sel.id, drag = i === 2 && !on; return (
          <div key={e.id} className={drag ? 'pw-tour-drag pw-tour-anim' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 8px', borderRadius: 7, marginBottom: 3, background: on ? '#DDF1E8' : drag ? '#FFFFFF' : 'transparent', boxShadow: drag ? '0 6px 16px rgba(20,18,15,.18)' : 'none', fontSize: 12.5, fontWeight: 600, color: '#24211D' }}>
            <Icon name={e.type === 'text' ? 'type' : e.type === 'image' ? 'person' : 'shapes'} size={14} color="#6E675E" />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.type === 'text' ? e.text : e.name || e.type}</span>
            <Icon name="eye" size={14} color="#8A837A" /><Icon name="lock" size={13} color={i === layers.length - 1 ? '#24211D' : '#C9C3B9'} />
          </div>
        ); })}
      </div>
      <div style={{ position: 'absolute', left: 314, top: 300, display: 'flex', flexWrap: 'wrap', gap: 8, width: 200 }}>
        {[['⌘Z', '150 undo steps'], ['⌘G', 'Group'], ['⇧', 'Box select']].map(([k, t]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 30, padding: '0 10px 0 6px', borderRadius: 9, background: '#FFFFFF', boxShadow: '0 6px 16px rgba(20,18,15,.12)', fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: '#24211D' }}>
            <kbd style={{ fontFamily: MONO, fontSize: 11.5, padding: '2px 6px', borderRadius: 5, background: '#24211D', color: '#FFFFFF' }}>{k}</kbd>{t}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function ExportVis({ kit }) {
  const files = [['PDF', '#E4572E', 'Print-ready'], ['PNG', '#3A86FF', 'Transparent'], ['JPG', '#F2A541', 'Light & small'], ['SVG', '#1F7D62', 'Stays sharp']];
  const tree = [['manifest.json', 0], ['document.json', 0], ['assets/', 0], ['photo-1.jpg', 1], ['fonts/', 0], ['thumbnail.png', 0]];
  return (
    <Stage>
      <Float x={16} y={22} rot={-2} delay={.2}><Thumb kit={kit} desc={D('pres', 'hero-photo', 'realestate')} w={300} /></Float>
      <div style={{ ...card, left: 334, top: 14, width: 172, padding: '12px 12px 10px', fontFamily: MONO, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: UI, fontWeight: 700, fontSize: 13, marginBottom: 8 }}><Mark size={18} />Launch.pinwheel</div>
        {tree.map(([f, d]) => <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 22, paddingLeft: 4 + d * 14, color: f.endsWith('/') ? '#1F7D62' : '#57514A' }}><Icon name={f.endsWith('/') ? 'stack' : 'file'} size={12} />{f}</div>)}
      </div>
      {files.map(([ext, c, note], i) => (
        <div key={ext} className="pw-tour-rise pw-tour-anim" style={{ ...card, animationDelay: `${200 + i * 110}ms`, left: 16 + i * 125, top: 236, width: 110, height: 150, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 66, borderRadius: 8, background: c, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, letterSpacing: '.04em', position: 'relative', overflow: 'hidden' }}>
            {ext}<i style={{ position: 'absolute', right: 0, top: 0, width: 18, height: 18, background: 'rgba(255,255,255,.35)', borderBottomLeftRadius: 6 }} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>{note}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#6E675E', fontWeight: 600 }}><Icon name="download" size={13} />{ext === 'PDF' ? 'All pages' : ext === 'SVG' ? 'Fonts inside' : '1× · 2× · Print'}</div>
        </div>
      ))}
    </Stage>
  );
}

function AppVis({ kit }) {
  const fileIcon = (
    <svg width="64" height="78" viewBox="0 0 64 78" aria-hidden="true">
      <path d="M4 4h40l16 16v54H4z" fill="#FFFFFF" stroke="#D8D3CA" strokeWidth="2" strokeLinejoin="round" />
      <path d="M44 4v16h16" fill="#F1EEE9" stroke="#D8D3CA" strokeWidth="2" strokeLinejoin="round" />
      <rect x="4" y="52" width="56" height="16" fill="#1F7D62" /><text x="32" y="64" textAnchor="middle" fontFamily={UI} fontSize="10.5" fontWeight="700" fill="#FFFFFF">.pinwheel</text>
    </svg>
  );
  const dock = ['#3A86FF', '#FFB703', 'pw', '#E4572E', '#7B5CFA'];
  return (
    <Stage>
      <div style={{ position: 'absolute', left: 14, top: 18, width: 400, height: 300, borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(140deg, #9AD1B9 0%, #5CC4A0 38%, #2F6F73 100%)', boxShadow: '0 18px 40px rgba(20,18,15,.25)' }}>
        <div style={{ position: 'absolute', left: 36, top: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 110 }}>
          <div style={{ position: 'relative' }}>
            {fileIcon}
            <div style={{ position: 'absolute', left: 19, top: 12 }}><Mark size={26} /></div>
            <i className="pw-tour-ripple pw-tour-anim" style={{ position: 'absolute', left: 44, top: 30, width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: 15, border: '2.5px solid #FFFFFF' }} />
            <svg width="22" height="26" viewBox="0 0 22 26" style={{ position: 'absolute', left: 44, top: 30 }} aria-hidden="true"><path d="M2 2l17 11-8 1.5L7 22z" fill="#1F1C18" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: 'rgba(15,40,35,.55)', padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap' }}>Spring menu.pinwheel</span>
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', display: 'flex', alignItems: 'flex-end', gap: 10, padding: '9px 12px', borderRadius: 18, background: 'rgba(255,255,255,.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.6)' }}>
          {dock.map((c, i) => c === 'pw' ? (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className="pw-tour-bounce pw-tour-anim" style={{ width: 46, height: 46, borderRadius: 12, background: '#F4F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,.2)' }}><Mark size={32} /></div>
              <i style={{ width: 5, height: 5, borderRadius: 3, background: '#1F1C18' }} />
            </div>
          ) : <div key={i} style={{ width: 40, height: 40, borderRadius: 11, background: c, opacity: .9, marginBottom: 9 }} />)}
        </div>
      </div>
      <Pill x={196} y={34} icon="wifi">Works offline</Pill>
      <Pill x={196} y={74} icon="install">Installed</Pill>
      <div style={{ position: 'absolute', left: 372, top: 120, width: 134, height: 278, borderRadius: 24, background: '#1F1C18', padding: 7, boxShadow: '0 20px 40px rgba(20,18,15,.35)' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', background: '#F4F2EE' }}>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}><Thumb kit={kit} desc={D('ig-story', 'circle-portrait', 'food', 'tomato', 'modern-serif')} w={88} radius={4} /></div>
          <div className="pw-tour-sheet pw-tour-anim" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, background: '#FFFFFF', borderRadius: '14px 14px 0 0', boxShadow: '0 -6px 16px rgba(0,0,0,.12)', padding: '7px 10px' }}>
            <i style={{ display: 'block', width: 28, height: 4, borderRadius: 2, background: '#D8D3CA', margin: '0 auto 8px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>{['#E4572E', '#FFB703', '#1F7D62', '#3A86FF', '#24211D', '#F28CB1', '#7B5CFA', '#D9A441'].map(c => <i key={c} style={{ height: 20, borderRadius: 10, background: c }} />)}</div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

function DoneVis({ kit }) {
  const R = kit.R, h = createElement;
  const bits = [['star', '#FFB703', 40, 70, 30, -12], ['heart', '#E4572E', 420, 60, 34, 10], ['burst', '#3A86FF', 70, 300, 38, 0], ['bolt', '#7B5CFA', 440, 290, 26, 14], ['ellipse', '#5CC4A0', 120, 40, 18, 0], ['hexagon', '#FF4F79', 380, 190, 22, 20], ['speech', '#F2A541', 30, 190, 36, -8], ['cloud', '#9AD1B9', 300, 340, 40, 0]];
  return (
    <Stage>
      {bits.map(([s, c, x, y, w, r], i) => { const ar = R.SHAPE_INFO[s][1]; return (
        <Float key={i} x={x} y={y} rot={r} delay={i * .35}>
          <div style={{ position: 'relative', width: w, height: w / ar }}>{R.renderEl(h, { id: 'tour-d' + i, type: 'shape', shape: s, x: 0, y: 0, w, h: w / ar, rot: 0, opacity: 1, fill: c, stroke: null, sw: 0, radius: 0, points: s === 'burst' ? 14 : 5, inner: s === 'burst' ? .78 : .5, sides: 6 }, {})}</div>
        </Float>
      ); })}
      <div style={{ position: 'absolute', left: 160, top: 90, width: 200, height: 200, borderRadius: 100, background: 'var(--pw-surface)', boxShadow: '0 20px 50px rgba(20,18,15,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pw-tour-spin pw-tour-anim"><Mark size={140} /></div>
      </div>
    </Stage>
  );
}

/* ---------- the slides ---------- */
function slides(kit) {
  const s = kit.stats;
  return [
    { id: 'welcome', eyebrow: 'Welcome', tint: '#9AD1B9', Vis: WelcomeVis,
      title: 'Design anything, right in your browser',
      body: 'Pinwheel Studio is a complete design studio for social posts, thumbnails, decks, flyers and print. Here is a quick look at what it can do. It takes about a minute, and you can skip ahead whenever you like.',
      points: [['grid', `${n(s.templates)} templates`, `Across ${s.formats} formats, each one made of real text, shapes and frames you can edit.`], ['lock', 'Private by design', 'Everything runs on your device. Your designs and photos stay with you.'], ['heart', 'Free and open source', 'The app is MIT licensed and the templates are CC0, so what you make is entirely yours.']] },
    { id: 'templates', eyebrow: 'Templates', tint: '#F4D58D', Vis: TemplatesVis,
      title: 'Start from thousands of templates',
      body: 'Browse by format or occasion, or search for exactly what you need: “birthday”, “menu”, “podcast”. Every template opens fully editable.',
      points: [['search', 'Search and filter', `Narrow by platform and format, or pick one of ${s.occasions} occasions, from birthdays and weddings to Eid, Diwali and Christmas.`], ['calendar', 'Festivals, right on time', 'A Coming up row on the home page brings forward templates for celebrations just around the corner.'], ['swap', 'Your words come along', 'Switch templates mid-design and the title, subtitle and call to action you wrote move into the new layout.']] },
    { id: 'restyle', eyebrow: 'One-click restyle', tint: '#F5B7A3', Vis: RestyleVis,
      title: 'Restyle a whole design in one click',
      body: 'Every colour in a template plays a role: background, ink, accent. Pick a new palette and the whole design follows, patterns included. Pick a type pairing and every heading and paragraph changes face together.',
      points: [['palette', `${s.palettes} palettes`, 'Hand-tuned colour sets, each checked for readable contrast.'], ['type', `${s.pairings} type pairings`, 'Display and body faces that belong together, sized to fit the layout.'], ['shuffle', 'Shuffle', 'Feeling stuck? Shuffle tries a fresh palette and pairing on the spot.']] },
    { id: 'resize', eyebrow: 'Resize', tint: '#B8D4F0', Vis: ResizeVis,
      title: 'One design, every size',
      body: 'Need the same post as a story, a thumbnail and a banner? Resize it and the layout rebuilds itself for the new shape, keeping your words and colours.',
      points: [['resize', `${s.formats} formats`, 'Instagram, TikTok, YouTube, LinkedIn, Pinterest, decks, A4 flyers, menus and cards, plus any custom size.'], ['layout', 'Smart re-layout', 'Re-layout from template rearranges the design for its new shape. Switch it off to scale everything proportionally.'], ['pages', 'Multi-page designs', 'Decks, carousels, booklets and menus arrive with pages that flow from opening to close.']] },
    { id: 'type', eyebrow: 'Typography', tint: '#4A433B', dark: true, Vis: TypeVis,
      title: 'Type with real personality',
      body: `Every Google Font is in the picker, ${s.fonts ? n(s.fonts) + ' families' : 'close to 2,000 families'}, each previewed in its own face. Bring your own typefaces too.`,
      points: [['font', 'Every Google Font', 'Search by name, filter by category, and see each family before you pick it.'], ['upload', 'Your own fonts', 'Upload a typeface once and it is ready in every design and brand.'], ['sparkle', `${s.textStyles} one-click text styles`, 'Neon, outlined, retro offset, long shadow, highlighter and more, with full control over outline, shadow, tracking and line height.']] },
    { id: 'photos', eyebrow: 'Photos', tint: '#C9B8EC', Vis: PhotoVis,
      title: 'Photos that look finished',
      body: 'Drop, paste or upload a photo straight onto a frame. Crop it, mask it, tune it, and lift the subject off its background with a single click.',
      points: [['wand', 'One-click background removal', 'A neural network runs on your device to cut out the subject. The original is kept, so you can restore it any time.'], ['crop', 'Crop, masks and filters', 'Zoom and set a focus point, choose a circle or arch mask, and apply filter presets or fine adjustments.'], ['person', 'Borders that hug the subject', 'On a cutout, borders and shadows trace the outline of the person or object.']] },
    { id: 'elements', eyebrow: 'Elements', tint: '#A8DCD1', Vis: ElementsVis,
      title: 'Shapes, charts, codes and patterns',
      body: 'Everything you need to fill a page is a click away, and all of it picks up your palette automatically.',
      points: [['shapes', `${s.shapes} shapes and lines`, 'Stars, hearts, speech bubbles, ribbons and bolts, with fills, strokes, dashes, arrows and rounded corners.'], ['chart', 'Charts and QR codes', 'Bar, line, pie and donut charts from a few lines of data, and QR codes that point anywhere.'], ['dots', `${s.patterns} background patterns`, 'Dots, lines, geometric, nature, party and texture tiles in any colour, plus page photos and tiles of your own.']] },
    { id: 'brand', eyebrow: 'Brand kits', tint: '#E8C3A8', Vis: BrandVis,
      title: 'Your brand on every template',
      body: 'Save your colours, fonts and logo as a brand kit. Pick it on the home page and every template previews in your look, then opens already on-brand.',
      points: [['dropper', 'Build a brand from your logo', 'Upload a logo and the studio reads its colours and offers several kits. Fine-tune any colour with the eyedropper.'], ['stack', 'As many brands as you need', 'Each kit keeps logos, fonts, colour schemes, text styles and an image library.'], ['share', 'Take it to any device', 'Download a brand as one .pinwheel file and open it anywhere.']] },
    { id: 'layout', eyebrow: 'Layout', tint: '#F2C4DA', Vis: LayoutVis,
      title: 'Precise layout with a light touch',
      body: 'Elements snap to the page and to each other as you drag. Align, group and arrange with a click, and step back through your edits whenever you want.',
      points: [['magnet', 'Smart snapping', 'Guides appear the moment edges and centres line up.'], ['stack', 'Layers panel', 'Drag to reorder, hide or lock any element, and box-select several at once.'], ['undo', '150 steps of undo', 'Experiment freely and walk back any change.']] },
    { id: 'export', eyebrow: 'Export & files', tint: '#F7CE9B', Vis: ExportVis,
      title: 'Export for screen or print',
      body: 'Download PDF, PNG, JPG or SVG at standard, high or print resolution, with fonts embedded so every export looks exactly as designed.',
      points: [['download', 'Multi-page PDF', 'Decks and booklets come out as one tidy PDF, ready for the printer.'], ['save', 'Save back to your file', 'In desktop Chrome and Edge, Save writes straight to the file you opened. On a phone, exports go to the share sheet.'], ['file', 'The .pinwheel file', 'A zip holding your document and its original images. Easy to share, archive and open again later.']] },
    { id: 'app', eyebrow: 'The app', tint: '#9FD3C7', Vis: AppVis,
      title: 'Install it, open files, work offline',
      body: 'Pinwheel Studio is an installable app. Add it to your dock or home screen and it opens like any other app, with or without a connection.',
      points: [['install', 'Install to your dock', 'Use the install button in the address bar, or Add to Home Screen on a phone or tablet.'], ['file', 'Double-click .pinwheel files', 'Once installed, .pinwheel files open straight into the studio. Designs open in the editor and brand kits join your brands.'], ['phone', 'At home on phones and tablets', 'Panels become bottom sheets, and you drag and pinch right on the canvas.'], ['clock', 'Recents', 'Your last 100 designs stay on this device, with live thumbnails on the home page.']] },
    { id: 'done', eyebrow: 'All set', tint: '#9AD1B9', Vis: DoneVis, done: true,
      title: 'Ready when you are',
      body: 'Pick a template from the home page, or set up your brand first so every template appears in your colours. This tour is waiting under Help (the ? button) whenever you want another look.',
      points: [] }
  ];
}

/* ---------- the dialog ---------- */
export default function Tour({ open, kit, phone, onClose, onBrand }) {
  const list = useMemo(() => slides(kit), [kit]);
  const [i, setI] = useState(0); const [dir, setDir] = useState(1);
  const nextRef = useRef(null);
  useEffect(() => { if (open) { setI(0); setDir(1); } }, [open]);
  const go = k => { if (k < 0 || k >= list.length || k === i) return; setDir(k > i ? 1 : -1); setI(k); };
  const s = list[i], last = i === list.length - 1, Vis = s.Vis;
  const onKey = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); last ? onClose() : go(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  };
  useEffect(() => { if (open && nextRef.current) nextRef.current.focus({ preventScroll: true }); }, [i, open]);

  const btn = primary => ({ height: 40, padding: '0 18px', borderRadius: 10, border: primary ? 'none' : '1px solid var(--pw-line-2)', background: primary ? 'var(--pw-accent)' : 'var(--pw-surface)', color: primary ? '#FFFFFF' : 'var(--pw-ink)', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', fontFamily: UI });
  const visual = (
    <div style={{ position: 'relative', background: s.dark ? s.tint : `color-mix(in srgb, ${s.tint} 62%, var(--pw-surface))`, transition: 'background .35s ease', overflow: 'hidden', '--pw-tour-ink': s.dark ? '#F1EEE8' : '#24211D', ...(phone ? { height: 'min(42dvh, 340px)', flex: 'none' } : { flex: '1 1 56%', minWidth: 0 }) }}>
      <div key={s.id} className="pw-tour-in" style={{ position: 'absolute', inset: phone ? 10 : 24, '--pw-tour-dx': `${dir * 18}px` }}><Vis kit={kit} /></div>
    </div>
  );
  const dots = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} role="tablist" aria-label="Tour steps">
      {list.map((x, k) => <button key={x.id} role="tab" aria-selected={k === i} aria-label={`Step ${k + 1}: ${x.eyebrow}`} onClick={() => go(k)} style={{ width: k === i ? 22 : 8, height: 8, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: k === i ? 'var(--pw-accent)' : k < i ? 'var(--pw-accent-tint-line)' : 'var(--pw-line-strong)', transition: 'width .25s ease, background .25s ease' }} />)}
    </div>
  );
  const text = (
    <div key={s.id} className="pw-tour-in" style={{ '--pw-tour-dx': `${dir * 12}px`, display: 'flex', flexDirection: 'column', gap: phone ? 12 : 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--pw-accent-deep)' }}>{s.eyebrow} · {i + 1} of {list.length}</div>
      <Dialog.Title style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: phone ? 27 : 33, lineHeight: 1.1, letterSpacing: '-.005em', textWrap: 'balance' }}>{s.title}</Dialog.Title>
      <Dialog.Description style={{ margin: 0, color: 'var(--pw-text-2)', fontSize: phone ? 15 : 15.5, lineHeight: 1.55, textWrap: 'pretty' }}>{s.body}</Dialog.Description>
      {s.points.length ? (
        <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: phone ? 12 : 14 }}>
          {s.points.map(([ic, lead, t]) => (
            <li key={lead} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pw-accent-tint)', color: 'var(--pw-accent-deep)' }}><Icon name={ic} size={18} /></span>
              <span style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--pw-text-2)', paddingTop: 1 }}><b style={{ display: 'block', color: 'var(--pw-ink)', fontSize: 14.5 }}>{lead}</b>{t}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {s.done ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
          <button onClick={onClose} style={btn(true)} className="pw-tour-cta">Start designing<Icon name="arrow" size={17} /></button>
          <button onClick={onBrand} style={btn(false)} className="pw-h1"><Icon name="dropper" size={17} />Set up my brand</button>
        </div>
      ) : null}
    </div>
  );
  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: phone ? '12px 16px calc(12px + env(safe-area-inset-bottom))' : '16px 28px 22px', borderTop: phone ? '1px solid var(--pw-line)' : 'none', background: 'var(--pw-surface)', flex: 'none', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {phone ? null : dots}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: phone ? 0 : 'auto', flex: phone ? 1 : 'none', justifyContent: phone ? 'space-between' : 'flex-end' }}>
        {last ? null : <button onClick={onClose} style={{ ...btn(false), border: 'none', background: 'transparent', color: 'var(--pw-muted)', padding: '0 10px' }} className="pw-h4">Skip tour</button>}
        <div style={{ display: 'flex', gap: 8 }}>
          {i > 0 ? <button onClick={() => go(i - 1)} style={btn(false)} className="pw-h1" aria-label="Previous step">Back</button> : null}
          {last
            ? <button ref={nextRef} onClick={onClose} style={btn(true)} className="pw-tour-cta">Done<Icon name="check" size={17} /></button>
            : <button ref={nextRef} onClick={() => go(i + 1)} style={btn(true)} className="pw-tour-cta">{i === 0 ? 'Show me around' : 'Next'}<Icon name="arrow" size={17} /></button>}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="pw-dialog-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(24,22,19,.55)', backdropFilter: 'blur(3px)', zIndex: 110 }} />
        <Dialog.Content className="pw-tour pw-dialog" onKeyDown={onKey} onPointerDownOutside={e => e.preventDefault()} onOpenAutoFocus={e => { e.preventDefault(); nextRef.current && nextRef.current.focus(); }}
          style={{ position: 'fixed', zIndex: 111, outline: 'none', background: 'var(--pw-surface)', color: 'var(--pw-ink)', fontFamily: UI, display: 'flex', overflow: 'hidden',
            ...(phone ? { inset: 0, flexDirection: 'column' } : { inset: 0, margin: 'auto', width: 'min(1040px, calc(100vw - 48px))', height: 'min(640px, calc(100dvh - 48px))', borderRadius: 18, boxShadow: '0 30px 80px rgba(0,0,0,.35)', flexDirection: 'column' }) }}>
          {phone ? (
            <>
              {visual}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>{dots}</div>
              <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px 18px' }}>{text}</div>
              {footer}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              {visual}
              <div style={{ flex: '1 1 44%', minWidth: 300, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '36px 32px 12px', display: 'flex', flexDirection: 'column' }}><div style={{ margin: 'auto 0' }}>{text}</div></div>
                {footer}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
