// Layout audit: for several templates per layout and format, compare each text's
// rendered height with the layout's estimate, and report text boxes that overlap
// or words wider than their box. Needs the dev server.
//   node tests/browser/audit/overlap.mjs [perFormat=2] [layoutId]
import { launch, page } from '../cdp.mjs';
const URL = process.env.PINWHEEL_URL || 'http://localhost:5185/';
const per = +(process.argv[2] || 2), onlyLayout = process.argv[3] || null;
const chrome = await launch();
const p = await page(); await p.size(1300, 1000); await p.goto(URL);
await p.until(`document.body.innerText.includes('What are you making today?')`);
await p.eval(`__studio.setState({ panel: null })`); await p.eval(`document.fonts.ready`); await p.wait(1500);
const picks = await p.eval(`(() => { const P = __studio.P; const out = []; const fmts = ['yt-thumb', 'ig-post', 'ig-story', 'a4-flyer', 'li-post', 'pres', 'yt-banner', 'bizcard', 'fb-post', 'pin']; for (const l of P.LAYOUTS) for (const f of fmts) { if (${JSON.stringify(onlyLayout)} && l.id !== ${JSON.stringify(onlyLayout)}) continue; const ts = P.catalog().filter(t => t.layout === l.id && t.fmt === f); const n = Math.min(${per}, ts.length); for (let i = 0; i < n; i++) out.push(ts[Math.floor(i * ts.length / n)].id); } return out; })()`);
console.log('templates', picks.length);
const over = [], tall = [], wide = [];
for (const id of picks) {
  await p.eval(`__studio.fromTemplate(__studio.P.catalog().find(t => t.id === ${JSON.stringify(id)}))`);
  await p.eval(`(async () => { const fams = [...new Set(__studio.pg.els.filter(e => e.font).map(e => e.font))]; await Promise.all(fams.map(f => document.fonts.load('16px "' + f + '"').catch(() => {}))); })()`);
  await p.wait(200);
  const r = await p.eval(`(() => { const d = __studio.state.doc, pg = d.pages[0]; const built = __studio.P.build(__studio.P.catalog().find(t => t.id === ${JSON.stringify(id)})).pages[0].els; const out = []; pg.els.forEach((e, i) => { if (e.type !== 'text' || e.hidden || e.name === 'Quote mark') return; const n = document.querySelector('[data-el-id="' + e.id + '"]'); if (!n) return; out.push({ id: e.id, name: e.name, text: String(e.text).slice(0, 30), est: built[i] ? built[i].h : e.h, real: n.offsetHeight, x: e.x, y: e.y, w: e.w, rot: e.rot || 0, g: e.groupId || null, overflowX: n.scrollWidth > n.clientWidth + 1 }); }); return { els: out }; })()`);
  for (const e of r.els) { if (e.real > e.est * 1.12 && e.real - e.est > 6) tall.push({ id, ...e }); if (e.overflowX) wide.push({ id, name: e.name, text: e.text }); }
  const T = r.els.filter(e => !e.rot);
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const a = T[i], b = T[j]; if (a.g && a.g === b.g) continue; const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.real, b.y + b.real) - Math.max(a.y, b.y); if (ox > 4 && oy > 3) over.push({ id, a: a.text, b: b.text, oy: Math.round(oy) }); }
}
p.close(); chrome.kill();
const layout = o => o.id.split('~')[1];
const tally = list => { const c = {}; for (const o of list) c[layout(o)] = (c[layout(o)] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1]); };
console.log('\nunder-estimated heights:', tall.length, JSON.stringify(tally(tall)));
for (const t of tall.slice(0, 12)) console.log('  ', t.id, t.name, JSON.stringify(t.text), 'est', t.est, 'real', t.real);
console.log('\ntext overlaps:', over.length, JSON.stringify(tally(over)));
for (const o of over.slice(0, 16)) console.log('  ', o.id, JSON.stringify(o.a), 'vs', JSON.stringify(o.b), 'by', o.oy);
console.log('\nhorizontal overflow:', wide.length, JSON.stringify(tally(wide)));
for (const o of wide.slice(0, 8)) console.log('  ', o.id, JSON.stringify(o.text));
process.exit(tall.length + over.length + wide.length ? 1 : 0);
