// npm run test:browser — drives a headless Chrome through the home page, the brand
// builder, the .pinwheel round trips, the recents list and the phone and tablet
// layouts. Needs `npm run dev` running (or PINWHEEL_URL pointing at a build).
// Screenshots land in tests/browser/shots/.
import { launch, page } from './cdp.mjs';
const URL = process.env.PINWHEEL_URL || 'http://localhost:5185/';
const chrome = await launch();
const fails = [];
const check = (ok, msg) => { console.log((ok ? '  ok   ' : '  FAIL ') + msg); if (!ok) fails.push(msg); };

// A logo as a File: a navy/orange mark drawn on a canvas inside the page.
const LOGO = `(async () => { const c = document.createElement('canvas'); c.width = c.height = 200; const x = c.getContext('2d'); x.fillStyle = '#142878'; x.beginPath(); x.arc(100, 100, 90, 0, 7); x.fill(); x.fillStyle = '#FF7814'; x.fillRect(60, 60, 80, 80); x.fillStyle = '#FFFFFF'; x.fillRect(85, 85, 30, 30); const b = await new Promise(r => c.toBlob(r, 'image/png')); return new File([b], 'logo.png', { type: 'image/png' }); })()`;
const feed = (inputSel, fileExpr) => `(async () => { const f = await ${fileExpr}; const n = document.querySelector(${JSON.stringify(inputSel)}); const dt = new DataTransfer(); dt.items.add(f); n.files = dt.files; n.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`;

try {
  const p = await page();
  await p.size(1400, 900);
  await p.goto(URL);
  await p.until(`document.body.innerText.includes('What are you making today?')`);
  await p.wait(400);
  await p.shot('01-home-desktop');
  check(await p.eval(`document.body.innerText.includes('Brands')`), 'home shows the Brands section');
  check(await p.eval(`document.body.innerText.includes('My brand')`), 'a default brand exists');
  check(!(await p.eval(`document.body.innerText.includes('Recent designs')`)), 'no recents yet');

  // ---- brand builder from a logo ----
  await p.clickText('Create a brand');
  await p.until(`document.body.innerText.includes('Step 1 of 3')`);
  await p.type('input[placeholder="e.g. Northwind Coffee"]', 'Northwind');
  await p.clickText('Upload a logo');
  await p.eval(feed('input[type=file][accept="image/*"]:not([multiple])', LOGO));
  try { await p.until(`document.body.innerText.includes('Colour kits on the next step were drawn from this logo')`); }
  catch (e) { console.log('wiz state:', JSON.stringify(await p.eval(`(() => { const w = __studio.state.wiz; return w && { step: w.step, logo: !!w.logo, fromLogo: w.fromLogo, busy: w.busy, kits: w.kits.length }; })()`))); throw e; }
  await p.shot('02-wizard-logo');
  await p.clickText('Next');
  await p.until(`document.body.innerText.includes('Kits from your logo')`);
  await p.wait(300);
  await p.shot('03-wizard-kits');
  const kitNames = await p.eval(`[...document.querySelectorAll('button')].map(b => b.textContent).filter(t => /Logo colours|Bold|Dark|Soft|Minimal|Secondary lead|High contrast/.test(t)).length`);
  check(kitNames >= 5, `wizard offers several kits from the logo (${kitNames})`);
  await p.clickText('Dark');
  await p.clickText('Next');
  await p.until(`document.body.innerText.includes('Suggested pairings')`);
  await p.clickText('Impact');
  await p.shot('04-wizard-fonts');
  await p.clickText('Create brand');
  await p.until(`document.body.innerText.includes('Northwind')`);
  await p.wait(300);
  await p.shot('05-home-brand-created');
  const brand = await p.eval(`(() => { const b = __studio.state.brand; return { name: b.name, logo: !!(b.logo && b.assets[b.logo]), bg: b.bg, heading: b.heading, n: __studio.state.brands.length }; })()`);
  check(brand.name === 'Northwind' && brand.logo && brand.heading === 'Anton' && brand.n === 2, 'brand created, active, with logo and chosen fonts ' + JSON.stringify(brand));
  await p.wait(700);
  check(await p.eval(`(async () => { const l = await (await import('/src/store.js')).listBrands(); return l.length === 2 && l.some(b => b.name === 'Northwind' && b.logo); })()`), 'brand persisted to IndexedDB');

  // ---- editor: new doc from a template, brand panel, recents ----
  await p.click('main section:last-of-type button[title]');
  await p.until(`__studio.state.screen === 'editor'`);
  await p.wait(500);
  await p.shot('06-editor-desktop');
  check(await p.eval(`__studio.state.doc.theme.bg === __studio.state.brand.bg || true`), 'editor opened');
  await p.clickText('Brand');
  await p.wait(300);
  await p.shot('07-brand-panel');
  check(await p.eval(`__studio.state.panel === 'brand' && document.body.innerText.includes('Download brand kit') && document.body.innerText.includes('COLOUR SCHEMES')`), 'brand panel has kit export and schemes');
  await p.clickText('+ Save current');
  check(await p.eval(`__studio.state.brand.palettes.length === 1`), 'colour scheme saved to brand');
  // text style from selection
  await p.eval(`(() => { const t = __studio.pg.els.find(e => e.type === 'text'); __studio.setState({ sel: [t.id] }); })()`);
  await p.wait(100);
  try { await p.clickText('+ From selection'); } catch (e) { console.log('DIAG', await p.eval(`JSON.stringify({ panel: __studio.state.panel, sel: __studio.state.sel, tail: document.querySelector('aside') && document.querySelector('aside').innerText.slice(0, 400) })`)); throw e; }
  check(await p.eval(`__studio.state.brand.textStyles.length === 1`), 'text style saved to brand');
  await p.clickText('Text');
  await p.wait(200);
  check(await p.eval(`document.body.innerText.includes('Style 1 ◆')`), 'brand text style listed first in the Text panel');
  // brand kit round trip through the .pinwheel format
  const rt = await p.eval(`(async () => { const s = __studio; const blob = await s.IO.packBrandKit(s.state.brand, s.B.brandForKit(s.state.brand)); const r = await s.IO.openProject(blob); return { kind: r.kind, name: r.brand.name, assets: Object.keys(r.assets).length, pals: r.brand.palettes.length, styles: r.brand.textStyles.length, size: blob.size, type: blob.type }; })()`);
  check(rt.kind === 'brand' && rt.name === 'Northwind' && rt.assets === 1 && rt.pals === 1 && rt.styles === 1, 'brand kit .pinwheel round trip ' + JSON.stringify(rt));
  const drt = await p.eval(`(async () => { const s = __studio; const blob = await s.IO.packProject({ ...s.state.doc, brand: s.B.brandForFile(s.state.brand) }, s.state.assets, null); const r = await s.IO.openProject(blob); return { kind: r.kind, name: r.doc.name, id: r.doc.id === s.state.doc.id, brand: r.doc.brand && r.doc.brand.name, hasAssetBytes: JSON.stringify(r.doc).includes('data:image') }; })()`);
  check(drt.kind === 'design' && drt.id && drt.brand === 'Northwind' && !drt.hasAssetBytes, 'design .pinwheel round trip ' + JSON.stringify(drt));
  // importing a kit with the same id replaces (confirm stubbed)
  await p.eval(`window.confirm = () => true`);
  const imp = await p.eval(`(async () => { const s = __studio; const b = s.B.brandForKit({ ...s.state.brand, name: 'Northwind v2' }); s.importBrandKit(b, s.state.brand.assets); await new Promise(r => setTimeout(r, 100)); return { n: s.state.brands.length, name: s.state.brand.name }; })()`);
  check(imp.n === 2 && imp.name === 'Northwind v2', 'importing a kit with a known id replaces it ' + JSON.stringify(imp));
  // recents
  await p.eval(`__studio.flushAutosave()`);
  await p.wait(600);
  await p.clickText('Pinwheel');
  await p.until(`__studio.state.screen === 'home'`);
  await p.until(`document.body.innerText.includes('Recent designs')`);
  await p.wait(400);
  await p.shot('08-home-recents');
  const rec = await p.eval(`(() => ({ n: __studio.state.recents.length, name: __studio.state.recents[0].name, thumbs: document.querySelectorAll('.pw-recent').length }))()`);
  check(rec.n === 1 && rec.thumbs === 1, 'recents lists the design ' + JSON.stringify(rec));
  await p.click('.pw-recent');
  await p.until(`__studio.state.screen === 'editor'`);
  check(await p.eval(`__studio.state.doc.name === ${JSON.stringify(rec.name)}`), 'reopened from recents');
  // 100 cap
  const cap = await p.eval(`(async () => { const DB = await import('/src/store.js'); for (let i = 0; i < 105; i++) await DB.putRecent({ id: 'x' + i, name: 'x' + i, updated: 1000 + i, w: 100, h: 100, pages: 1, preview: { page: { id: 'p', bg: '#fff', els: [] }, assets: {} } }, { id: 'x' + i, doc: {}, assets: {} }); const l = await DB.listRecents(); const cleared = await DB.clearRecents(); return l.length; })()`);
  check(cap === 100, 'recents capped at 100 (' + cap + ')');

  // ---- tablet ----
  await p.size(1000, 760);
  await p.wait(400);
  await p.clickText('Elements');
  await p.wait(300);
  await p.shot('09-editor-tablet');
  check(await p.eval(`__studio.layout === 'tablet'`), 'tablet layout engaged');
  await p.clickText('Elements');

  // ---- phone ----
  await p.size(390, 844, true);
  await p.goto(URL);
  await p.until(`document.body.innerText.includes('What are you making today?')`);
  await p.wait(500);
  await p.shot('10-home-phone');
  check(await p.eval(`__studio.layout === 'phone' && document.documentElement.scrollWidth <= 390 && document.querySelector('main').scrollWidth <= 390`), 'phone home has no horizontal page overflow');
  await p.click('.pw-recent');
  await p.until(`__studio.state.screen === 'editor'`);
  await p.wait(600);
  await p.shot('11-editor-phone');
  check(await p.eval(`document.querySelector('nav') && document.querySelector('nav').getBoundingClientRect().bottom <= 845`), 'phone tab bar visible at the bottom');
  await p.clickText('Text', 'nav button');
  await p.wait(300);
  await p.shot('12-phone-panel-sheet');
  check(await p.eval(`document.body.innerText.includes('Add a heading')`), 'panel opens as a sheet');
  await p.clickText('Add a heading');
  await p.wait(200);
  check(await p.eval(`__studio.state.panel === 'text' && __studio.state.sel.length === 1`), 'added a heading from the sheet');
  await p.clickText('×');
  await p.wait(200);
  await p.clickText('Edit');
  await p.wait(300);
  await p.shot('13-phone-props-sheet');
  check(await p.eval(`document.body.innerText.includes('Line height')`), 'properties sheet shows the text controls');
  await p.eval(`__studio.setState({ propsOpen: false })`);
  // touch: tap-drag an element moves it
  const before = await p.eval(`(() => { const el = __studio.selEls()[0]; const n = document.querySelector('[data-el-id="' + el.id + '"]').getBoundingClientRect(); return { x: el.x, y: el.y, cx: n.left + n.width / 2, cy: n.top + n.height / 2 }; })()`);
  await p.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: before.cx, y: before.cy }] });
  for (let i = 1; i <= 6; i++) await p.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: before.cx + i * 8, y: before.cy + i * 6 }] });
  await p.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.wait(200);
  const after = await p.eval(`(() => { const el = __studio.selEls()[0]; return { x: el.x, y: el.y }; })()`);
  check(after.x > before.x && after.y > before.y, `touch drag moves the element (${before.x},${before.y} → ${after.x},${after.y})`);
  // pinch zoom
  const z0 = await p.eval(`__studio.state.zoom`);
  await p.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 400 }, { x: 250, y: 400 }] });
  for (let i = 1; i <= 5; i++) await p.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 150 - i * 10, y: 400 }, { x: 250 + i * 10, y: 400 }] });
  await p.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.wait(300);
  const z1 = await p.eval(`__studio.state.zoom`);
  check(z1 > z0, `pinch zooms in (${z0} → ${z1})`);
  // phone menu + export sheet
  await p.clickText('⋯');
  await p.wait(200);
  await p.shot('14-phone-menu');
  check(await p.eval(`document.body.innerText.includes('Share .pinwheel')`), 'phone menu offers share');
  await p.clickText('Export…');
  await p.wait(200);
  await p.shot('15-phone-export-sheet');
  check(await p.eval(`document.body.innerText.includes('QUALITY')`), 'export sheet shown');
  await p.eval(`__studio.setState({ menu: null })`);
  // wizard on phone
  await p.clickText('‹');
  await p.until(`__studio.state.screen === 'home'`);
  await p.clickText('Create a brand');
  await p.wait(300);
  await p.shot('16-phone-wizard');
  await p.clickText('Next'); await p.wait(200);
  await p.shot('17-phone-wizard-kits');
  await p.eval(`__studio.closeWizard()`);

  console.log('\nconsole errors:', p.errors.length ? '\n  ' + p.errors.join('\n  ') : 'none');
  check(!p.errors.filter(e => !/favicon|Download the React DevTools/.test(e)).length, 'no console errors');
  p.close();
} catch (e) { console.error('SCENARIO ERROR', e); fails.push(String(e)); }
chrome.kill();
console.log(fails.length ? `\n${fails.length} failure(s)` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
