// Pinwheel Studio — I/O: export (PDF/PNG/JPG/SVG), native .pinwheel files, on-device background removal.
import { FONTS, fontURL } from './presets.js';

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
const safe = s => (s || 'design').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'design';

/* ---------- fonts for export ---------- */
const fontCache = new Map();
export function usedFonts(doc) {
  const s = new Set(); doc.pages.forEach(p => p.els.forEach(e => { if (e.font) s.add(e.font); })); return [...s];
}
async function fontCSS(families) {
  const parts = await Promise.all(families.map(async fam => {
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

export async function exportPDF(nodes, doc, { scale = 2, onProgress } = {}) {
  const [jsPDF, css] = await Promise.all([lib('jspdf'), fontCSS(usedFonts(doc))]);
  const pdf = new jsPDF({ orientation: doc.w >= doc.h ? 'l' : 'p', unit: 'px', format: [doc.w, doc.h], hotfixes: ['px_scaling'], compress: true });
  for (let i = 0; i < nodes.length; i++) {
    onProgress && onProgress(`Rendering page ${i + 1} of ${nodes.length}…`);
    const cv = await pageToCanvas(nodes[i], doc, scale, css);
    if (i > 0) pdf.addPage([doc.w, doc.h], doc.w >= doc.h ? 'l' : 'p');
    pdf.addImage(cv.toDataURL('image/jpeg', .93), 'JPEG', 0, 0, doc.w, doc.h, undefined, 'FAST');
  }
  pdf.setProperties({ title: doc.name, creator: 'Pinwheel Studio' });
  download(pdf.output('blob'), safe(doc.name) + '.pdf');
}

export async function exportImages(nodes, doc, { fmt = 'png', scale = 2, onProgress } = {}) {
  const css = await fontCSS(usedFonts(doc));
  const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
  const blobs = [];
  for (let i = 0; i < nodes.length; i++) {
    onProgress && onProgress(`Rendering page ${i + 1} of ${nodes.length}…`);
    const cv = await pageToCanvas(nodes[i], doc, scale, css);
    blobs.push(await new Promise(r => cv.toBlob(r, mime, .92)));
  }
  if (blobs.length === 1) return download(blobs[0], `${safe(doc.name)}.${fmt}`);
  const JSZip = await lib('jszip'); const z = new JSZip();
  blobs.forEach((b, i) => z.file(`${safe(doc.name)}-${String(i + 1).padStart(2, '0')}.${fmt}`, b));
  download(await z.generateAsync({ type: 'blob' }), `${safe(doc.name)}-${fmt}.zip`);
}

export async function exportSVG(nodes, doc) {
  const [h2i, css] = await Promise.all([lib('h2i'), fontCSS(usedFonts(doc))]);
  const out = [];
  for (const n of nodes) out.push(await h2i.toSvg(n, { width: doc.w, height: doc.h, fontEmbedCSS: css, filter: skipPlaceholders, style: { transform: 'none' } }));
  if (out.length === 1) return download(out[0], safe(doc.name) + '.svg');
  const JSZip = await lib('jszip'); const z = new JSZip();
  for (let i = 0; i < out.length; i++) z.file(`${safe(doc.name)}-${String(i + 1).padStart(2, '0')}.svg`, decodeURIComponent(out[i].split(',')[1]));
  download(await z.generateAsync({ type: 'blob' }), `${safe(doc.name)}-svg.zip`);
}

/* ---------- native file format ---------- */
// .pinwheel = zip { manifest.json, document.json, assets/<id>.<ext>, thumbnail.png }
export const FORMAT_VERSION = 1;
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
export async function saveProject(doc, assets, thumbNode) {
  const JSZip = await lib('jszip'); const z = new JSZip();
  const used = new Set(); doc.pages.forEach(p => { if (p.bgAsset) used.add(p.bgAsset); p.els.forEach(e => { if (e.asset) used.add(e.asset); if (e.origAsset) used.add(e.origAsset); }); });
  if (doc.brand && doc.brand.logo) used.add(doc.brand.logo);
  const manifest = { format: 'pinwheel', version: FORMAT_VERSION, app: 'Pinwheel Studio', created: doc.created || new Date().toISOString(), modified: new Date().toISOString(), name: doc.name, size: { w: doc.w, h: doc.h, unit: 'px' }, pages: doc.pages.length, assets: {} };
  for (const id of used) {
    const a = assets[id]; if (!a) continue;
    const blob = await dataURLToBlob(a.src); const ext = EXT[blob.type] || 'bin'; const path = `assets/${id}.${ext}`;
    z.file(path, blob); manifest.assets[id] = { path, mime: blob.type, name: a.name || id, bytes: blob.size, w: a.w, h: a.h };
  }
  z.file('manifest.json', JSON.stringify(manifest, null, 2));
  z.file('document.json', JSON.stringify(doc, null, 2));
  if (thumbNode) { try { const cv = await pageToCanvas(thumbNode, doc, Math.min(1, 480 / Math.max(doc.w, doc.h))); z.file('thumbnail.png', await new Promise(r => cv.toBlob(r, 'image/png'))); } catch (e) { } }
  download(await z.generateAsync({ type: 'blob', compression: 'DEFLATE' }), safe(doc.name) + '.pinwheel');
}
export async function openProject(file) {
  const JSZip = await lib('jszip'); const z = await JSZip.loadAsync(file);
  const man = JSON.parse(await z.file('manifest.json').async('string'));
  if (man.format !== 'pinwheel') throw new Error('Not a Pinwheel file');
  if (man.version > FORMAT_VERSION) throw new Error('This file was made with a newer version of Pinwheel Studio');
  const doc = JSON.parse(await z.file('document.json').async('string'));
  const assets = {};
  for (const [id, a] of Object.entries(man.assets || {})) { const f = z.file(a.path); if (!f) continue; const b = await f.async('blob'); assets[id] = { name: a.name, w: a.w, h: a.h, src: await blobToDataURL(new Blob([b], { type: a.mime })) }; }
  return { doc: migrate(doc, man.version), assets };
}
function migrate(doc, v) { return doc; }

/* ---------- images ---------- */
export function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
export async function readImageFile(file) {
  let src = await blobToDataURL(file); const img = await loadImage(src);
  const max = 2400; let w = img.naturalWidth, h = img.naturalHeight;
  if (Math.max(w, h) > max) { const s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h); src = cv.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', .9); }
  return { src, w, h, name: file.name };
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
    } catch (e) { }
  }
  throw new Error('Could not download the background-removal model');
}
export async function removeBackground(src, onProgress) {
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
  const W = img.naturalWidth, H = img.naturalHeight; const fc = document.createElement('canvas'); fc.width = W; fc.height = H; const fx = fc.getContext('2d');
  fx.drawImage(img, 0, 0); fx.globalCompositeOperation = 'destination-in'; fx.imageSmoothingQuality = 'high'; fx.drawImage(mc, 0, 0, W, H);
  return { src: fc.toDataURL('image/png'), w: W, h: H };
}
