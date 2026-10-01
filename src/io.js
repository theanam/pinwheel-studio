// Pinwheel Studio — I/O: export (PDF/PNG/JPG/SVG), native .pinwheel files, on-device background removal.
import { FONTS, fontURL } from './presets.js';
import { FONT_MIME, FONT_FORMAT } from './brand.js';

// Self-hosting mode (spec §3 and §12): `npm run vendor` downloads the pinned
// libraries and the model into public/vendor and turns on VITE_VENDOR, after which
// the app makes no requests to a CDN or to huggingface.co at all. Google Fonts stays
// remote in both modes — the families are referenced by name, not embedded.
const VENDOR = import.meta.env.VITE_VENDOR ? new URL('vendor/', document.baseURI).href : null;
const CDN = 'https://cdn.jsdelivr.net/npm/';
const at = (pkgPath, localName) => (VENDOR ? VENDOR + localName : CDN + pkgPath);

const LIBS = {
  h2i: [at('html-to-image@1.11.11/dist/html-to-image.js', 'html-to-image.js'), () => window.htmlToImage],
  jspdf: [at('jspdf@2.5.1/dist/jspdf.umd.min.js', 'jspdf.umd.min.js'), () => window.jspdf && window.jspdf.jsPDF],
  jszip: [at('jszip@3.10.1/dist/jszip.min.js', 'jszip.min.js'), () => window.JSZip],
  ort: [at('onnxruntime-web@1.18.0/dist/ort.min.js', 'ort.min.js'), () => window.ort],
  // Small enough to fetch up front; the renderer reads window.qrcode synchronously.
  qr: [at('qrcode-generator@1.4.4/qrcode.min.js', 'qrcode.min.js'), () => window.qrcode]
};
const ORT_WASM = VENDOR || CDN + 'onnxruntime-web@1.18.0/dist/';
export const MODEL_URLS = VENDOR ? [VENDOR + 'u2netp.onnx'] : [
  'https://huggingface.co/skillsafe-ai/u2netp/resolve/main/u2netp.onnx',
  'https://huggingface.co/chwshuang/Stable_diffusion_remove_background_model/resolve/main/u2netp.onnx'
];
const loading = {};
export function lib(name) {
  const [url, get] = LIBS[name];
  if (get()) return Promise.resolve(get());
  return loading[name] ||= new Promise((res, rej) => { const s = document.createElement('script'); s.src = url; s.crossOrigin = 'anonymous'; s.onload = () => res(get()); s.onerror = () => { delete loading[name]; rej(new Error('Could not load ' + name)); }; document.head.appendChild(s); });
}

export function download(data, filename) {
  const url = typeof data === 'string' ? data : URL.createObjectURL(data);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  if (typeof data !== 'string') setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
const dataURLToBlob = async d => (await fetch(d)).blob();
export const safe = s => (s || 'design').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'design';

/* ---------- getting files in and out ---------- */
// Three routes, in order of preference:
//   1. The File System Access API (desktop Chromium): a real save dialog, and a
//      handle we can write back to, so ⌘S saves in place.
//   2. The Web Share API on phones and tablets, where there is no file system to
//      speak of: the share sheet sends the file to Files, Photos, a chat or AirDrop.
//   3. A plain download link, everywhere else.
export const PINWHEEL_MIME = 'application/vnd.pinwheel+zip';
export const TYPES = {
  pinwheel: { description: 'Pinwheel file', mime: PINWHEEL_MIME, ext: '.pinwheel' },
  pdf: { description: 'PDF document', mime: 'application/pdf', ext: '.pdf' },
  png: { description: 'PNG image', mime: 'image/png', ext: '.png' },
  jpg: { description: 'JPEG image', mime: 'image/jpeg', ext: '.jpg' },
  svg: { description: 'SVG image', mime: 'image/svg+xml', ext: '.svg' },
  zip: { description: 'Zip archive', mime: 'application/zip', ext: '.zip' }
};
export const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
/** Whether a save dialog with a writable handle is available (and preferable). */
export const canPick = () => typeof window !== 'undefined' && 'showSaveFilePicker' in window && !isMobile();
const abort = e => e && (e.name === 'AbortError' || e.name === 'NotAllowedError');
/**
 * Ask where to save before doing the slow work, so the dialog opens inside the
 * user's click. Returns `{ write(blob), handle }`, `null` where the API is not the
 * route to use (the caller then calls `deliver`), or `'cancel'` if the user backed out.
 */
export async function openSink(filename, type) {
  if (!canPick()) return null;
  try {
    const handle = await window.showSaveFilePicker({ suggestedName: filename, types: [{ description: type.description, accept: { [type.mime]: [type.ext] } }] });
    return { handle, write: blob => writeHandle(handle, blob) };
  } catch (e) { if (abort(e)) return 'cancel'; console.warn('Save dialog unavailable', e); return null; }
}
export async function writeHandle(handle, blob) {
  if (handle.requestPermission && (await handle.queryPermission({ mode: 'readwrite' })) !== 'granted' && (await handle.requestPermission({ mode: 'readwrite' })) !== 'granted') throw new Error('No permission to write the file');
  const w = await handle.createWritable(); await w.write(blob); await w.close();
}
/** Hand a finished file to the user: the share sheet on mobile, else a download. */
export async function deliver(blob, filename, title) {
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  if (isMobile() && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    // A share needs a fresh user gesture; after a long render it can be refused
    // (NotAllowedError), and then the download route still delivers the file.
    try { await navigator.share({ files: [file], title: title || filename }); return 'shared'; }
    catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; console.warn('Share failed, downloading instead', e); }
  }
  download(blob, filename); return 'downloaded';
}
/** An open dialog that returns the file and, where supported, a handle to save back to. `null` = cancelled; throws when unsupported. */
export async function pickOpenFile() {
  if (!('showOpenFilePicker' in window)) throw new Error('unsupported');
  try {
    const [handle] = await window.showOpenFilePicker({ multiple: false, types: [{ description: 'Pinwheel file', accept: { [PINWHEEL_MIME]: ['.pinwheel'], 'application/zip': ['.zip'] } }] });
    return { file: await handle.getFile(), handle };
  } catch (e) { if (abort(e)) return null; throw e; }
}

/* ---------- fonts for export ---------- */
const fontCache = new Map();
export function usedFonts(doc) {
  const s = new Set(); doc.pages.forEach(p => p.els.forEach(e => { if (e.font) s.add(e.font); })); return [...s];
}
/** @font-face rules for the families a design uses: Google fonts fetched and inlined,
 *  uploaded fonts (`custom`, family → { src, mime }) written straight from their data URL. */
async function fontCSS(families, custom = {}) {
  const parts = await Promise.all(families.map(async fam => {
    if (custom[fam] && custom[fam].src) return `@font-face { font-family: '${fam.replace(/'/g, '')}'; src: url(${custom[fam].src})${FONT_FORMAT[custom[fam].mime] ? ` format('${FONT_FORMAT[custom[fam].mime]}')` : ''}; font-display: block; }`;
    if (fontCache.has(fam)) return fontCache.get(fam);
    const f = FONTS.find(x => x.name === fam); if (!f) return '';
    try {
      let css = await (await fetch(fontURL(f))).text();
      const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))];
      // only latin + latin-ext subsets keep exports small
      const blocks = css.split('@font-face').filter(b => /U\+0000-00FF|U\+0100/.test(b) || !/unicode-range/.test(b));
      css = blocks.map(b => b.trim() ? '@font-face' + b : '').join('\n');
      for (const u of urls) { if (!css.includes(u)) continue; const d = await blobToDataURL(await (await fetch(u)).blob()); css = css.split(u).join(d); }
      fontCache.set(fam, css); return css;
    } catch (e) { return ''; }
  }));
  return parts.join('\n');
}

const skipPlaceholders = n => !(n.dataset && n.dataset.placeholder);
export async function pageToCanvas(node, doc, scale = 2, css) {
  const h2i = await lib('h2i');
  return h2i.toCanvas(node, { width: doc.w, height: doc.h, pixelRatio: scale, fontEmbedCSS: css, filter: skipPlaceholders, cacheBust: false, style: { transform: 'none' } });
}

export async function exportPDF(nodes, doc, { scale = 2, onProgress, send = download, fonts = {} } = {}) {
  const [jsPDF, css] = await Promise.all([lib('jspdf'), fontCSS(usedFonts(doc), fonts)]);
  const pdf = new jsPDF({ orientation: doc.w >= doc.h ? 'l' : 'p', unit: 'px', format: [doc.w, doc.h], hotfixes: ['px_scaling'], compress: true });
  for (let i = 0; i < nodes.length; i++) {
    onProgress && onProgress(`Rendering page ${i + 1} of ${nodes.length}…`);
    const cv = await pageToCanvas(nodes[i], doc, scale, css);
    if (i > 0) pdf.addPage([doc.w, doc.h], doc.w >= doc.h ? 'l' : 'p');
    pdf.addImage(cv.toDataURL('image/jpeg', .93), 'JPEG', 0, 0, doc.w, doc.h, undefined, 'FAST');
  }
  pdf.setProperties({ title: doc.name, creator: 'Pinwheel Studio' });
  return send(pdf.output('blob'), safe(doc.name) + '.pdf');
}

export async function exportImages(nodes, doc, { fmt = 'png', scale = 2, onProgress, send = download, fonts = {} } = {}) {
  const css = await fontCSS(usedFonts(doc), fonts);
  const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
  const blobs = [];
  for (let i = 0; i < nodes.length; i++) {
    onProgress && onProgress(`Rendering page ${i + 1} of ${nodes.length}…`);
    const cv = await pageToCanvas(nodes[i], doc, scale, css);
    blobs.push(await new Promise(r => cv.toBlob(r, mime, .92)));
  }
  if (blobs.length === 1) return send(blobs[0], `${safe(doc.name)}.${fmt}`);
  const JSZip = await lib('jszip'); const z = new JSZip();
  blobs.forEach((b, i) => z.file(`${safe(doc.name)}-${String(i + 1).padStart(2, '0')}.${fmt}`, b));
  return send(await z.generateAsync({ type: 'blob', mimeType: 'application/zip' }), `${safe(doc.name)}-${fmt}.zip`);
}

export async function exportSVG(nodes, doc, { send = download, fonts = {} } = {}) {
  const [h2i, css] = await Promise.all([lib('h2i'), fontCSS(usedFonts(doc), fonts)]);
  const out = [];
  for (const n of nodes) out.push(await h2i.toSvg(n, { width: doc.w, height: doc.h, fontEmbedCSS: css, filter: skipPlaceholders, style: { transform: 'none' } }));
  const svgBlob = u => new Blob([decodeURIComponent(u.split(',')[1])], { type: 'image/svg+xml' });
  if (out.length === 1) return send(svgBlob(out[0]), safe(doc.name) + '.svg');
  const JSZip = await lib('jszip'); const z = new JSZip();
  for (let i = 0; i < out.length; i++) z.file(`${safe(doc.name)}-${String(i + 1).padStart(2, '0')}.svg`, decodeURIComponent(out[i].split(',')[1]));
  return send(await z.generateAsync({ type: 'blob', mimeType: 'application/zip' }), `${safe(doc.name)}-svg.zip`);
}
/** The file name an export will produce, so a save dialog can be opened before rendering. */
export function exportName(doc, kind, pages) {
  if (kind === 'pdf') return safe(doc.name) + '.pdf';
  return pages > 1 ? `${safe(doc.name)}-${kind}.zip` : `${safe(doc.name)}.${kind}`;
}

/* ---------- native file format ---------- */
// .pinwheel is a zip and the manifest says what kind of thing is inside:
//   kind "design"  { manifest.json, document.json, assets/<id>.<ext>, thumbnail.png }
//   kind "brand"   { manifest.json, brand.json, assets/<id>.<ext> }   — a brand kit
// Version 2 added `kind`; a manifest without it is a version-1 design.
export const FORMAT_VERSION = 2;
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
async function packAssets(z, ids, assets) {
  const index = {};
  for (const id of ids) {
    const a = assets[id]; if (!a || !a.src) continue;
    const blob = await dataURLToBlob(a.src); const ext = EXT[blob.type] || 'bin'; const path = `assets/${id}.${ext}`;
    z.file(path, blob); index[id] = { path, mime: blob.type, name: a.name || id, bytes: blob.size, w: a.w, h: a.h };
  }
  return index;
}
async function packFonts(z, fonts) {
  const index = {};
  for (const [id, f] of Object.entries(fonts || {})) {
    if (!f || !f.src) continue; const blob = await dataURLToBlob(f.src); const ext = Object.keys(FONT_MIME).find(k => FONT_MIME[k] === (f.mime || blob.type)) || 'ttf'; const path = `fonts/${id}.${ext}`;
    z.file(path, blob); index[id] = { path, mime: f.mime || blob.type, name: f.name || id, family: f.family, bytes: blob.size };
  }
  return index;
}
async function unpackFonts(z, index) {
  const fonts = {};
  for (const [id, f] of Object.entries(index || {})) { const file = z.file(f.path); if (!file) continue; const b = await file.async('blob'); fonts[id] = { name: f.name, family: f.family, mime: f.mime, src: await blobToDataURL(new Blob([b], { type: f.mime })) }; }
  return fonts;
}
async function unpackAssets(z, index) {
  const assets = {};
  for (const [id, a] of Object.entries(index || {})) { const f = z.file(a.path); if (!f) continue; const b = await f.async('blob'); const src = await blobToDataURL(new Blob([b], { type: a.mime })); assets[id] = { name: a.name, w: a.w, h: a.h, src, alpha: await hasAlpha(src, a.mime) }; }
  return assets;
}
const manifestBase = (kind, name) => ({ format: 'pinwheel', kind, version: FORMAT_VERSION, app: 'Pinwheel Studio', modified: new Date().toISOString(), name });
/** Build the .pinwheel blob for a design. */
export async function packProject(doc, assets, thumbNode, fonts = {}) {
  const JSZip = await lib('jszip'); const z = new JSZip();
  const used = new Set(); doc.pages.forEach(p => { if (p.bgAsset) used.add(p.bgAsset); p.els.forEach(e => { if (e.asset) used.add(e.asset); if (e.origAsset) used.add(e.origAsset); }); });
  if (doc.brand && doc.brand.logo) used.add(doc.brand.logo);
  const manifest = { ...manifestBase('design', doc.name), created: doc.created || new Date().toISOString(), size: { w: doc.w, h: doc.h, unit: 'px' }, pages: doc.pages.length, assets: {} };
  manifest.assets = await packAssets(z, used, assets);
  // Uploaded fonts the design uses travel in fonts/ (spec §5); Google fonts stay by name.
  const usedFam = new Set(usedFonts(doc)); const useFonts = Object.fromEntries(Object.entries(fonts).filter(([, f]) => f && usedFam.has(f.family)));
  if (Object.keys(useFonts).length) manifest.fonts = await packFonts(z, useFonts);
  z.file('manifest.json', JSON.stringify(manifest, null, 2));
  z.file('document.json', JSON.stringify(doc, null, 2));
  if (thumbNode) { try { const cv = await pageToCanvas(thumbNode, doc, Math.min(1, 480 / Math.max(doc.w, doc.h))); z.file('thumbnail.png', await new Promise(r => cv.toBlob(r, 'image/png'))); } catch (e) { } }
  return z.generateAsync({ type: 'blob', compression: 'DEFLATE', mimeType: PINWHEEL_MIME });
}
export async function saveProject(doc, assets, thumbNode, send = download, fonts) { return send(await packProject(doc, assets, thumbNode, fonts), safe(doc.name) + '.pinwheel'); }
/** Build the .pinwheel blob for a brand kit: colours, fonts, schemes, text styles and every brand asset. */
export async function packBrandKit(brand, brandJSON) {
  const JSZip = await lib('jszip'); const z = new JSZip();
  const manifest = { ...manifestBase('brand', brand.name), created: new Date(brand.created || Date.now()).toISOString(), assets: {} };
  manifest.assets = await packAssets(z, Object.keys(brand.assets || {}), brand.assets || {});
  if (Object.keys(brand.fonts || {}).length) manifest.fonts = await packFonts(z, brand.fonts);
  z.file('manifest.json', JSON.stringify(manifest, null, 2));
  z.file('brand.json', JSON.stringify(brandJSON, null, 2));
  return z.generateAsync({ type: 'blob', compression: 'DEFLATE', mimeType: PINWHEEL_MIME });
}
/** Open any .pinwheel file. Resolves to `{ kind: 'design', doc, assets }` or `{ kind: 'brand', brand, assets }`. */
export async function openProject(file) {
  const JSZip = await lib('jszip'); let z;
  try { z = await JSZip.loadAsync(file); } catch (e) { throw new Error('Not a Pinwheel file'); }
  const mf = z.file('manifest.json'); if (!mf) throw new Error('Not a Pinwheel file');
  const man = JSON.parse(await mf.async('string'));
  if (man.format !== 'pinwheel') throw new Error('Not a Pinwheel file');
  if (man.version > FORMAT_VERSION) throw new Error('This file was made with a newer version of Pinwheel Studio');
  const kind = man.kind || 'design';
  if (kind === 'brand') {
    const bf = z.file('brand.json'); if (!bf) throw new Error('This brand kit has no brand.json');
    return { kind, brand: JSON.parse(await bf.async('string')), assets: await unpackAssets(z, man.assets), fonts: await unpackFonts(z, man.fonts), manifest: man };
  }
  if (kind !== 'design') throw new Error(`Pinwheel Studio cannot open a "${kind}" file`);
  const df = z.file('document.json'); if (!df) throw new Error('This file has no document.json');
  const doc = JSON.parse(await df.async('string'));
  return { kind, doc: migrate(doc, man.version), assets: await unpackAssets(z, man.assets), fonts: await unpackFonts(z, man.fonts), manifest: man };
}
function migrate(doc, v) { return doc; }

/* ---------- uploaded fonts ---------- */
/** Read a font file (TTF, OTF, WOFF, WOFF2) as a data URL with its MIME type. */
export async function readFontFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase(); const mime = FONT_MIME[ext];
  if (!mime) throw new Error('Use a .ttf, .otf, .woff or .woff2 file');
  const src = await blobToDataURL(new Blob([await file.arrayBuffer()], { type: mime }));
  return { name: file.name, mime, src };
}
const registered = new Map();
/** Make an uploaded font available to the page under `family`. Idempotent. */
export async function registerFont(family, src, mime) {
  if (!family || !src || typeof FontFace === 'undefined') return false;
  if (registered.get(family) === src) return true;
  try {
    const old = registered.has(family) && [...document.fonts].find(f => f.family === family || f.family === `"${family}"`); if (old) document.fonts.delete(old);
    const face = new FontFace(family, `url(${src})${FONT_FORMAT[mime] ? ` format('${FONT_FORMAT[mime]}')` : ''}`, { display: 'block' });
    await face.load(); document.fonts.add(face); registered.set(family, src); return true;
  } catch (e) { console.warn('Could not load font', family, e); return false; }
}

/* ---------- images ---------- */
export function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
/** Whether an image has any see-through pixels — a cutout or a transparent PNG. The
 *  renderer draws borders and shadows around the subject of such an image rather
 *  than around its frame. Sampled at 64×64; JPEGs are opaque by definition. */
export async function hasAlpha(src, mime) {
  if (mime === 'image/jpeg' || /^data:image\/jpeg/.test(src)) return false;
  try {
    const img = await loadImage(src); const S = 64, cv = document.createElement('canvas'); cv.width = cv.height = S;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, S, S);
    const d = x.getImageData(0, 0, S, S).data; for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  } catch (e) { }
  return false;
}
/** A small copy of an image as a data URL, for the recents list. Keeps PNG where there is transparency. */
export async function lowRes(src, max = 160, alpha) {
  try {
    const img = await loadImage(src); let w = img.naturalWidth, h = img.naturalHeight; if (!w || !h) return src;
    const s = Math.min(1, max / Math.max(w, h)); w = Math.max(1, Math.round(w * s)); h = Math.max(1, Math.round(h * s));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
    return alpha ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', .8);
  } catch (e) { return src; }
}
/** RGBA bytes of an image scaled into a `size`-px box, for colour extraction. */
export async function imagePixels(src, size = 48) {
  const img = await loadImage(src); const s = Math.min(1, size / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const w = Math.max(1, Math.round((img.naturalWidth || 1) * s)), h = Math.max(1, Math.round((img.naturalHeight || 1) * s));
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
  return x.getImageData(0, 0, w, h).data;
}
export async function readImageFile(file) {
  let src = await blobToDataURL(file); const img = await loadImage(src);
  const max = 2400; let w = img.naturalWidth, h = img.naturalHeight;
  if (Math.max(w, h) > max) { const s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h); src = cv.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', .9); }
  return { src, w, h, name: file.name, alpha: await hasAlpha(src, file.type) };
}

/* ---------- background removal (U²-Netp, on device) ---------- */
let session = null;
async function fetchModel(onProgress) {
  let cache = null; try { cache = await caches.open('pinwheel-models'); } catch (e) { }
  for (const url of MODEL_URLS) {
    try {
      if (cache) { const hit = await cache.match(url); if (hit) return new Uint8Array(await hit.arrayBuffer()); }
      const res = await fetch(url); if (!res.ok) continue;
      const total = +res.headers.get('content-length') || 4.7e6; const reader = res.body.getReader(); const chunks = []; let got = 0;
      for (; ;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; onProgress && onProgress(`Downloading model… ${Math.min(99, Math.round(got / total * 100))}%`); }
      const buf = new Uint8Array(got); let o = 0; for (const c of chunks) { buf.set(c, o); o += c.length; }
      if (cache) try { await cache.put(url, new Response(buf)); } catch (e) { }
      return buf;
    } catch (e) { console.warn('Model mirror failed:', url, e); }
  }
  throw new Error('Could not download the background-removal model');
}
// Masks are cached per source image so the edge can be re-feathered without running
// the model again. A handful of entries is plenty; they are 320×320 canvases.
const maskCache = new Map();
async function segment(src, onProgress) {
  if (maskCache.has(src)) return maskCache.get(src);
  const ort = await lib('ort');
  ort.env.wasm.wasmPaths = ORT_WASM; ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
  if (!session) { const buf = await fetchModel(onProgress); onProgress && onProgress('Starting model…'); session = await ort.InferenceSession.create(buf, { executionProviders: ['wasm'] }); }
  onProgress && onProgress('Finding the subject…');
  const img = await loadImage(src); const S = 320;
  const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.drawImage(img, 0, 0, S, S);
  const px = x.getImageData(0, 0, S, S).data; const arr = new Float32Array(3 * S * S);
  const mean = [.485, .456, .406], std = [.229, .224, .225];
  for (let i = 0; i < S * S; i++) for (let k = 0; k < 3; k++) arr[k * S * S + i] = (px[i * 4 + k] / 255 - mean[k]) / std[k];
  const out = await session.run({ [session.inputNames[0]]: new ort.Tensor('float32', arr, [1, 3, S, S]) });
  const d = out[session.outputNames[0]].data; let mn = Infinity, mx = -Infinity; for (const v of d) { if (v < mn) mn = v; if (v > mx) mx = v; }
  const mc = document.createElement('canvas'); mc.width = mc.height = S; const mx2 = mc.getContext('2d'); const md = mx2.createImageData(S, S);
  for (let i = 0; i < S * S; i++) { let a = (d[i] - mn) / (mx - mn + 1e-8); a = Math.min(1, Math.max(0, (a - .08) / .84)); md.data[i * 4 + 3] = a * 255; }
  mx2.putImageData(md, 0, 0);
  if (maskCache.size > 8) maskCache.delete(maskCache.keys().next().value);
  maskCache.set(src, mc); return mc;
}
/**
 * Cut the subject out of an image. `feather` is the softness of the edge in output
 * pixels: the mask is blurred by that radius before it is applied, so 0 keeps the
 * model's own edge and larger values blend the subject into whatever sits behind it.
 */
export async function removeBackground(src, onProgress, { feather = 0 } = {}) {
  const [mc, img] = await Promise.all([segment(src, onProgress), loadImage(src)]);
  const W = img.naturalWidth, H = img.naturalHeight;
  const S = mc.width, f = Math.max(0, +feather || 0);
  // Blur at full output size so the feather is in output pixels, with a margin so
  // the blur does not pick up the transparent canvas edge and eat the subject.
  const pad = Math.ceil(f * 3), bc = document.createElement('canvas'); bc.width = W + pad * 2; bc.height = H + pad * 2; const bx = bc.getContext('2d');
  bx.imageSmoothingQuality = 'high'; if (f) bx.filter = `blur(${f}px)`;
  bx.drawImage(mc, 0, 0, S, S, pad, pad, W, H);
  const fc = document.createElement('canvas'); fc.width = W; fc.height = H; const fx = fc.getContext('2d');
  fx.drawImage(img, 0, 0); fx.globalCompositeOperation = 'destination-in'; fx.drawImage(bc, -pad, -pad);
  return { src: fc.toDataURL('image/png'), w: W, h: H, alpha: true };
}
