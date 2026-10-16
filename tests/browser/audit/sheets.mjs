// Contact sheets: every layout at a wide, square, tall and banner format, rendered
// in the editor and tiled into PNG sheets under tests/browser/shots/all*.png.
//   node tests/browser/audit/sheets.mjs [pairingIds]   (comma-separated pairing ids: one template per pairing and format class instead)
import { launch, page, OUT } from '../cdp.mjs';
import fs from 'node:fs';
const URL = process.env.PINWHEEL_URL || 'http://localhost:5185/';
const onlyPair = process.argv[2] || null;
const DIR = OUT + 'all/'; fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(DIR, { recursive: true });
const chrome = await launch();
const p = await page(); await p.size(1300, 1000); await p.goto(URL);
await p.until(`document.body.innerText.includes('What are you making today?')`);
await p.eval(`__studio.setState({ panel: null })`);
const picks = await p.eval(`(() => { const P = __studio.P; const out = []; const want = { wide: 'yt-thumb', square: 'ig-post', tall: 'ig-story', banner: 'yt-banner' }; const pairs = ${JSON.stringify(onlyPair)} ? ${JSON.stringify(onlyPair)}.split(',') : null;
  if (pairs) { for (const pr of pairs) for (const [cls, fmt] of Object.entries(want)) { const ts = P.catalog().filter(t => t.pair === pr && t.fmt === fmt); for (const t of ts.slice(0, 2)) out.push({ key: pr + ' · ' + t.layout + ' · ' + cls, id: t.id }); } return out; }
  for (const l of P.LAYOUTS) { for (const [cls, fmt] of Object.entries(want)) { const ts = P.catalog().filter(t => t.layout === l.id && t.fmt === fmt); if (ts.length) out.push({ key: l.id + ' · ' + cls, id: ts[Math.min(1, ts.length - 1)].id }); } if (!out.some(o => o.key.startsWith(l.id + ' ·'))) { const t = P.catalog().find(t => t.layout === l.id); if (t) out.push({ key: l.id + ' · ' + t.fmt, id: t.id }); } } return out; })()`);
console.log('renders', picks.length);
const cells = [];
for (const { key, id } of picks) {
  await p.eval(`__studio.fromTemplate(__studio.P.catalog().find(t => t.id === ${JSON.stringify(id)}))`);
  await p.eval(`(async () => { await document.fonts.ready; const fams = [...new Set(__studio.pg.els.filter(e => e.font).map(e => e.font))]; await Promise.all(fams.map(f => document.fonts.load('16px "' + f + '"').catch(() => {}))); })()`);
  await p.wait(250);
  const r = await p.eval(`(() => { const b = document.querySelector('[data-page-node]').getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; })()`);
  const shot = await p.send('Page.captureScreenshot', { format: 'jpeg', quality: 80, clip: { ...r, scale: Math.min(1, 300 / r.width, 300 / r.height) } });
  const fn = key.replace(/[^a-z0-9]+/gi, '_') + '.jpg'; fs.writeFileSync(DIR + fn, Buffer.from(shot.data, 'base64'));
  cells.push(`<figure><div class=b><img src="${fn}"></div><figcaption>${key}</figcaption></figure>`);
}
const per = 20, n = Math.ceil(cells.length / per);
for (let i = 0; i < n; i++) fs.writeFileSync(DIR + `sheet${i}.html`, '<!doctype html><meta charset=utf-8><style>body{margin:0;background:#222;color:#eee;font:11px sans-serif}figure{margin:0;width:280px;display:inline-block;vertical-align:top}.b{width:280px;height:300px;display:flex;align-items:center;justify-content:center;background:#333}img{max-width:276px;max-height:296px}figcaption{height:22px;padding:2px}</style><div style="width:1400px">' + cells.slice(i * per, (i + 1) * per).join('') + '</div>');
for (let i = 0; i < n; i++) { await p.goto('file://' + DIR + 'sheet' + i + '.html'); await p.wait(700); await p.shot('all' + i, true); }
console.log('sheets', n);
p.close(); chrome.kill();
