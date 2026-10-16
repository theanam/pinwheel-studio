// Measure the text metrics every type pairing carries (letter, capital and space
// widths of its faces) from text rendered in a browser, and print them as the
// fields presets.js expects. Needs the dev server. Pass --write to patch
// presets.js in place.
//   node tests/browser/audit/metrics.mjs [--write]
import { launch, page } from '../cdp.mjs';
import fs from 'node:fs';
const BASE = process.env.PINWHEEL_URL || 'http://localhost:5185/';
const chrome = await launch();
const p = await page(); await p.size(1200, 800); await p.goto(BASE);
await p.until(`document.body.innerText.includes('What are you making today?')`);
await p.eval(`(() => { const P = __studio.P; const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;white-space:nowrap'; for (const pr of P.PAIRINGS) for (const [fam, w] of [[pr.display, pr.dw || 700], [pr.body, 400], [pr.body, 700]]) { const s = document.createElement('span'); s.style.cssText = 'font-family:\\'' + fam + '\\';font-weight:' + w + ';font-size:100px'; s.textContent = 'Plant Trees'; box.appendChild(s); } document.body.appendChild(box); })()`);
// Wait for every face a pairing uses, at the weights measured, before measuring.
await p.eval(`(async () => { const P = __studio.P; await document.fonts.ready; const jobs = []; for (const pr of P.PAIRINGS) for (const [fam, w] of [[pr.display, pr.dw || 700], [pr.body, 400], [pr.body, 700]]) jobs.push(document.fonts.load(w + ' 100px "' + fam + '"').catch(() => {})); await Promise.all(jobs); })()`); await p.wait(1500);
const rows = await p.eval(`(async () => {
  const P = __studio.P; const out = [];
  // A face counts as loaded when the browser resolves its load; otherwise the
  // measurement would be of the fallback font.
  const loaded = async (fam, w) => { try { return (await document.fonts.load(w + ' 100px "' + fam + '"')).length > 0; } catch (e) { return false; } };
  const samples = ['Plant 10,000 Trees', 'How Great Ideas Actually Happen', 'Sunday Pasta Night', 'The Big Summer Sale', 'Build the Future of Field Science', 'Ruth & David’s Golden Anniversary', 'Hand-rolled pasta, natural wine and one long table. Bring a friend, leave with ten.', 'Quiet Layers', 'Is AI Coming for Your Job?', 'Eid Mubarak to You & Yours', 'Light-Filled Corner Home', 'A Shower for Baby Cole', 'The Vanishing at Pine Lake'];
  const sp = document.createElement('span'); sp.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;white-space:pre;font-size:100px'; document.body.appendChild(sp);
  const W = t => { sp.textContent = t; return sp.getBoundingClientRect().width; };
  const measure = (font, weight, upper) => { sp.style.fontFamily = '\\'' + font + '\\''; sp.style.fontWeight = weight; let tot = 0, chars = 0; for (const s of samples) { const t = (upper ? s.toUpperCase() : s).replace(/\\s+/g, ''); tot += W(t); chars += t.length; } return { l: tot / chars / 100, space: (W('a a') - W('aa')) / 100 }; };
  for (const pr of P.PAIRINGS) {
    const ok = (await loaded(pr.display, pr.dw || 700)) && (await loaded(pr.body, 400));
    const d = measure(pr.display, pr.dw || 700, false), du = measure(pr.display, pr.dw || 700, true), b = measure(pr.body, 400, false), bu = measure(pr.body, 400, true), bb = measure(pr.body, 700, false);
    out.push({ id: pr.id, loaded: ok, wf: +d.l.toFixed(3), wfu: +du.l.toFixed(3), sp: +d.space.toFixed(3), bwf: +b.l.toFixed(3), bwfu: +bu.l.toFixed(3), bwfb: +bb.l.toFixed(3), bsp: +b.space.toFixed(3) });
  }
  return out;
})()`);
p.close(); chrome.kill();
console.log('id              loaded wf    wfu   sp    | bwf   bwfu  bwfb  bsp');
for (const r of rows) console.log(r.id.padEnd(15), String(r.loaded).padEnd(6), String(r.wf).padEnd(5), String(r.wfu).padEnd(5), String(r.sp).padEnd(5), '|', String(r.bwf).padEnd(5), String(r.bwfu).padEnd(5), String(r.bwfb).padEnd(5), r.bsp);
if (process.argv.includes('--write')) {
  const file = new URL('../../../src/presets.js', import.meta.url); let s = fs.readFileSync(file, 'utf8'); let n = 0;
  for (const r of rows) {
    if (!r.loaded) { console.log('skip (font not loaded):', r.id); continue; }
    const re = new RegExp(`(\\{ id: '${r.id}', name: '[^']+', display: '[^']+', body: '[^']+', dw: \\d+, )wf: [\\d.]+, wfu: [\\d.]+, sp: [\\d.]+, bwf: [\\d.]+, bwfu: [\\d.]+, bwfb: [\\d.]+, bsp: [\\d.]+,`);
    if (!re.test(s)) { console.log('no pairing line for', r.id); continue; }
    s = s.replace(re, `$1wf: ${r.wf}, wfu: ${r.wfu}, sp: ${r.sp}, bwf: ${r.bwf}, bwfu: ${r.bwfu}, bwfb: ${r.bwfb}, bsp: ${r.bsp},`); n++;
  }
  fs.writeFileSync(file, s); console.log('wrote', n, 'pairings');
}
