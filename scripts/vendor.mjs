// Self-hosting / air-gapped installs (spec §3, §12).
//
// Downloads the pinned third-party libraries — and, with --model, the U²-Netp
// weights — into public/vendor. Build with VITE_VENDOR=1 afterwards and the app
// makes no CDN or huggingface.co requests; `npm run build:offline` does both.
//
// Google Fonts stays remote in either mode: .pinwheel files reference families by
// name rather than embedding them, so the studio needs the live faces.
import fs from 'fs';
import path from 'path';

const CDN = 'https://cdn.jsdelivr.net/npm/';
const OUT = 'public/vendor';

const LIBS = [
  'html-to-image@1.11.11/dist/html-to-image.js',
  'jspdf@2.5.1/dist/jspdf.umd.min.js',
  'jszip@3.10.1/dist/jszip.min.js',
  'qrcode-generator@1.4.4/qrcode.min.js',
  'onnxruntime-web@1.18.0/dist/ort.min.js',
  // onnxruntime loads these itself, from the same directory as ort.min.js.
  'onnxruntime-web@1.18.0/dist/ort-wasm-simd.wasm',
  'onnxruntime-web@1.18.0/dist/ort-wasm-simd-threaded.wasm',
  'onnxruntime-web@1.18.0/dist/ort-wasm.wasm',
  'onnxruntime-web@1.18.0/dist/ort-wasm-threaded.wasm',
];

const MODEL = {
  url: 'https://huggingface.co/skillsafe-ai/u2netp/resolve/main/u2netp.onnx',
  name: 'u2netp.onnx',
};

const mb = n => (n / 1e6).toFixed(1) + ' MB';

async function grab(url, dest) {
  if (fs.existsSync(dest)) {
    console.log(`  = ${path.basename(dest)} (${mb(fs.statSync(dest).size)}, cached)`);
    return;
  }
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`  + ${path.basename(dest)} (${mb(buf.length)})`);
}

fs.mkdirSync(OUT, { recursive: true });
console.log(`Vendoring into ${OUT}/`);

for (const lib of LIBS) {
  const name = lib.split('/').pop();
  try { await grab(CDN + lib, path.join(OUT, name)); }
  catch (err) { console.warn(`  ! ${name}: ${err.message}`); }
}

if (process.argv.includes('--model')) {
  await grab(MODEL.url, path.join(OUT, MODEL.name));
} else {
  console.log(`  - ${MODEL.name} skipped — pass --model to include it (~4.6 MB).`);
  console.log('    Without it, background removal still downloads the model on first use.');
}

console.log('\nBuild with: VITE_VENDOR=1 npm run build');
