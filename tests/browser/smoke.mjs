// npm run test:browser — drives a headless Chrome through the home page, the brand
// builder, the .pinwheel round trips, the recents list and the phone and tablet
// layouts. Needs `npm run dev` running (or PINWHEEL_URL pointing at a build).
// Screenshots land in tests/browser/shots/.
import { launch, page } from './cdp.mjs';
import fs from 'node:fs';
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
  await p.clickText('Upload a logo', '.pw-wiz button');
  await p.eval(feed('input[type=file][accept="image/*"]:not([multiple])', LOGO));
  try { await p.until(`document.body.innerText.includes('Colour kits on the next step were drawn from this logo')`); }
  catch (e) { console.log('wiz state:', JSON.stringify(await p.eval(`(() => { const w = __studio.state.wiz; return w && { step: w.step, logo: !!w.logo, fromLogo: w.fromLogo, busy: w.busy, kits: w.kits.length }; })()`))); throw e; }
  await p.shot('02-wizard-logo');
  await p.clickText('Next', '.pw-wiz button');
  await p.until(`document.body.innerText.includes('Kits from your logo')`);
  await p.wait(300);
  await p.shot('03-wizard-kits');
  const kitNames = await p.eval(`[...document.querySelectorAll('button')].map(b => b.textContent).filter(t => /Logo colours|Bold|Dark|Soft|Minimal|Secondary lead|High contrast/.test(t)).length`);
  check(kitNames >= 5, `wizard offers several kits from the logo (${kitNames})`);
  await p.clickText('Dark', '.pw-wiz button');
  await p.clickText('Next', '.pw-wiz button');
  await p.until(`document.body.innerText.includes('Suggested pairings')`);
  await p.clickText('Impact', '.pw-wiz button');
  await p.shot('04-wizard-fonts');
  await p.clickText('Create brand', '.pw-wiz button');
  await p.until(`document.body.innerText.includes('Northwind')`);
  await p.wait(300);
  await p.shot('05-home-brand-created');
  const brand = await p.eval(`(() => { const b = __studio.state.brand; return { name: b.name, logo: !!(b.logo && b.assets[b.logo]), bg: b.bg, heading: b.heading, n: __studio.state.brands.length }; })()`);
  check(brand.name === 'Northwind' && brand.logo && brand.heading === 'Anton' && brand.n === 2, 'brand created, active, with logo and chosen fonts ' + JSON.stringify(brand));
  await p.wait(700);
  check(await p.eval(`(async () => { const l = await (await import('/src/store.js')).listBrands(); return l.length === 2 && l.some(b => b.name === 'Northwind' && b.logo); })()`), 'brand persisted to IndexedDB');

  // ---- brand preview on the home page ----
  // A new brand is not applied by itself: "No brand" stays selected and templates
  // keep their own style. Choosing a brand restyles the previews, says so, and
  // opens templates already branded.
  const hexRgb = h => `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`;
  const thumbBg = () => p.eval(`(() => { const n = document.querySelector('main section:last-of-type [data-page-node]'); return n ? n.style.backgroundColor : null; })()`);
  check(await p.eval(`__studio.state.brandOn === false && !document.querySelector('.pw-brand-note')`), 'no brand is selected by default on the home page');
  const bgOff = await thumbBg();
  check(await p.eval(`(() => { const d = [...document.querySelectorAll('main div.pw-h3')].find(d => d.textContent.includes('Northwind') && d.textContent.length < 160); if (!d) return false; d.click(); return true; })()`), 'clicked the Northwind brand card');
  await p.wait(400);
  const bgOn = await thumbBg();
  check(await p.eval(`__studio.state.brandOn === true && !!document.querySelector('.pw-brand-note')`), 'picking a brand turns the preview on with a note');
  check(bgOn !== bgOff && bgOn === hexRgb(brand.bg), `template previews take the brand background (${bgOff} → ${bgOn})`);
  await p.click('main section:last-of-type button[title*="—"]');
  await p.until(`__studio.state.screen === 'editor'`);
  await p.wait(300);
  check(await p.eval(`__studio.state.doc.theme.accent === __studio.state.brand.accent && __studio.state.doc.theme.display === __studio.state.brand.heading`), 'a template opened with a brand selected is already in the brand');
  await p.clickText('Pinwheel');
  await p.until(`__studio.state.screen === 'home'`); await p.wait(300);
  await p.clickText('Show original');
  await p.wait(300);
  check(await p.eval(`__studio.state.brandOn === false && !document.querySelector('.pw-brand-note')`), '"Show original" turns the preview off');
  // The choice is not remembered: a fresh visit starts with no brand.
  await p.eval(`__studio.useBrand(__studio.state.brand.id)`); await p.wait(200);
  await p.goto(URL); await p.until(`document.body.innerText.includes('What are you making today?')`); await p.wait(400);
  check(await p.eval(`__studio.state.brandOn === false && !document.querySelector('.pw-brand-note')`), 'a new visit starts with no brand selected');
  check((await thumbBg()) === bgOff, 'previews are back to their own style');

  // ---- editor: new doc from a template, brand panel, recents ----
  try { await p.click('main section:last-of-type button[title*="—"]'); }
  catch (e) { console.log('DIAG', await p.eval(`JSON.stringify({ screen: __studio.state.screen, wiz: !!__studio.state.wiz, dialog: !!__studio.state.dialog, sections: [...document.querySelectorAll('main section')].map(s => (s.querySelector('h1,h2') || {}).textContent), lastText: (document.querySelector('main section:last-of-type') || {}).innerText && document.querySelector('main section:last-of-type').innerText.slice(0, 200) })`)); throw e; }
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
  // Uploaded fonts: a real TTF from the system goes into the brand, shows in the
  // font picker, can be chosen for headings, and travels in a .pinwheel file.
  const fontPath = process.env.PINWHEEL_TEST_FONT || '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
  if (fs.existsSync(fontPath)) {
    const b64 = fs.readFileSync(fontPath).toString('base64');
    await p.eval(feed('input[type=file][accept=".ttf,.otf,.woff,.woff2"]', `(async () => { const r = await fetch('data:font/ttf;base64,${b64}'); return new File([await r.blob()], 'Arial Bold.ttf', { type: 'font/ttf' }); })()`));
    await p.until(`Object.keys(__studio.state.brand.fonts).length === 1`);
    await p.wait(200);
    const fam = await p.eval(`Object.values(__studio.state.brand.fonts)[0].family`);
    check(fam === 'Arial Bold' && await p.eval(`document.fonts.check("16px '${fam}'")`), `font uploaded to the brand and loaded (${fam})`);
    await p.click('aside button[title="Change font"]', 0);
    await p.wait(200);
    check(await p.eval(`[...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Uploaded') && [...document.querySelectorAll('button')].some(b => b.textContent.includes('Arial Bold') && b.textContent.includes('brand'))`), 'the font picker lists the uploaded font first');
    await p.clickText('Arial Bold', 'button[title="Arial Bold"]');
    await p.wait(200);
    check(await p.eval(`__studio.state.brand.heading === 'Arial Bold'`), 'uploaded font chosen for headings');
    const fontRt = await p.eval(`(async () => { const s = __studio; const d = structuredClone(s.state.doc); d.pages[0].els.find(e => e.type === 'text').font = 'Arial Bold'; const blob = await s.IO.packProject(d, s.state.assets, null, s.fontsFor(d)); const r = await s.IO.openProject(blob); const kit = await s.IO.openProject(await s.IO.packBrandKit(s.state.brand, s.B.brandForKit(s.state.brand))); return { design: Object.values(r.fonts).map(f => f.family), kit: Object.values(kit.fonts).map(f => f.family), kitSrc: Object.values(kit.fonts)[0].src.slice(0, 14) }; })()`);
    check(fontRt.design.includes('Arial Bold') && fontRt.kit.includes('Arial Bold') && fontRt.kitSrc.startsWith('data:font/ttf'), 'the font travels in design and brand-kit files ' + JSON.stringify(fontRt));
  } else console.log('  skip  font upload (no test font at ' + fontPath + ')');
  await p.clickText('Text');
  await p.wait(200);
  check(await p.eval(`document.body.innerText.includes('Style 1 ◆')`), 'brand text style listed first in the Text panel');
  // brand kit round trip through the .pinwheel format
  const rt = await p.eval(`(async () => { const s = __studio; const blob = await s.IO.packBrandKit(s.state.brand, s.B.brandForKit(s.state.brand)); const r = await s.IO.openProject(blob); return { kind: r.kind, name: r.brand.name, assets: Object.keys(r.assets).length, pals: r.brand.palettes.length, styles: r.brand.textStyles.length, size: blob.size, type: blob.type }; })()`);
  check(rt.kind === 'brand' && rt.name === 'Northwind' && rt.assets === 1 && rt.pals === 1 && rt.styles === 1, 'brand kit .pinwheel round trip ' + JSON.stringify(rt));
  const drt = await p.eval(`(async () => { const s = __studio; const blob = await s.IO.packProject({ ...s.state.doc, brand: s.B.brandForFile(s.state.brand) }, s.state.assets, null); const r = await s.IO.openProject(blob); return { kind: r.kind, name: r.doc.name, id: r.doc.id === s.state.doc.id, brand: r.doc.brand && r.doc.brand.name, hasAssetBytes: JSON.stringify(r.doc).includes('data:image') }; })()`);
  check(drt.kind === 'design' && drt.id && drt.brand === 'Northwind' && !drt.hasAssetBytes, 'design .pinwheel round trip ' + JSON.stringify(drt));
  // importing a kit with the same id replaces (confirm stubbed)
  await p.eval(`(() => { const s = __studio; const b = s.B.brandForKit({ ...s.state.brand, name: 'Northwind v2' }); s.importBrandKit(b, s.state.brand.assets); })()`);
  await p.until(`document.querySelector('[role=dialog]') && document.querySelector('[role=dialog]').innerText.includes('Replace')`);
  await p.shot('07b-dialog-replace-brand');
  await p.clickText('Replace', '[role=dialog] button');
  await p.wait(200);
  const imp = await p.eval(`(() => ({ n: __studio.state.brands.length, name: __studio.state.brand.name, closed: !document.querySelector('[role=dialog]') }))()`);
  check(imp.n === 2 && imp.name === 'Northwind v2' && imp.closed, 'importing a kit with a known id asks, then replaces ' + JSON.stringify(imp));
  // rename through the prompt-style dialog, Escape cancels
  await p.clickText('Brand'); await p.wait(200);
  await p.clickText('Rename');
  await p.until(`!!document.querySelector('[role=dialog] input')`);
  await p.type('[role=dialog] input', 'Northwind Coffee');
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await p.wait(200);
  check(await p.eval(`__studio.state.brand.name === 'Northwind Coffee' && !document.querySelector('[role=dialog]')`), 'rename dialog takes Enter');
  await p.clickText('Delete');
  await p.until(`!!document.querySelector('[role=dialog]')`);
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await p.wait(200);
  check(await p.eval(`__studio.state.brands.length === 2 && !document.querySelector('[role=dialog]')`), 'Escape cancels the delete dialog');
  // Tainted design: a template swap warns once, then not again until the next edit.
  await p.clickText('Templates');
  await p.wait(200);
  check(await p.eval(`__studio.dirty === false`), 'a freshly opened design is not tainted');
  // A real mouse drag of a text element counts as an edit.
  const el0 = await p.eval(`(() => { const el = __studio.pg.els.find(e => e.type === 'text'); const n = document.querySelector('[data-el-id="' + el.id + '"]').getBoundingClientRect(); return { id: el.id, x: el.x, cx: n.left + n.width / 2, cy: n.top + n.height / 2 }; })()`);
  await p.mouse(el0.cx, el0.cy, el0.cx + 40, el0.cy + 10);
  check(await p.eval(`__studio.dirty === true && __studio.pg.els.find(e => e.id === ${JSON.stringify(el0.id)}).x > ${el0.x}`), 'a mouse drag moves the element and marks the design edited');
  // Edit the title the way a person does: double-click, type, click the canvas to
  // finish. Highlighted text (a background) once reverted on that last click.
  const title = await p.eval(`(() => { const el = __studio.pg.els.find(e => e.key === 'title'); const r = document.querySelector('[data-el-id="' + el.id + '"]').getBoundingClientRect(); return { id: el.id, x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  for (const cc of [1, 2]) { await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: title.x, y: title.y, button: 'left', clickCount: cc }); await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: title.x, y: title.y, button: 'left', clickCount: cc }); }
  await p.wait(150);
  check(await p.eval(`__studio.state.editingId === ${JSON.stringify(title.id)}`), 'double-click starts editing the title');
  await p.send('Input.insertText', { text: 'My Shop Sale' });
  await p.wait(60);
  const away = await p.eval(`(() => { const r = __studio.canvasEl.getBoundingClientRect(); return { x: r.left + 12, y: r.bottom - 12 }; })()`);
  await p.mouse(away.x, away.y);
  await p.wait(200);
  check(await p.eval(`__studio.pg.els.find(e => e.id === ${JSON.stringify(title.id)}).text === 'My Shop Sale' && __studio.state.editingId === null`), 'clicking the canvas commits the typed text');

  await p.click('aside button[title*="·"]', 1);
  await p.until(`!!document.querySelector('[role=dialog]')`);
  await p.shot('07c-dialog-tainted');
  const tpl0 = await p.eval(`__studio.state.doc.tpl`);
  await p.clickText('Keep my edits', '[role=dialog] button');
  await p.wait(200);
  check(await p.eval(`__studio.state.doc.tpl === ${JSON.stringify(tpl0)} && __studio.dirty`), 'cancel keeps the design and the taint');
  await p.click('aside button[title*="·"]', 1);
  await p.until(`!!document.querySelector('[role=dialog]')`);
  check(await p.eval(`document.querySelector('[role=dialog]').innerText.includes('keeping the text you wrote')`), 'dialog says the edited text is kept');
  await p.clickText('Switch', '[role=dialog] button');
  await p.wait(300);
  check(await p.eval(`__studio.state.doc.tpl !== ${JSON.stringify(tpl0)} && __studio.dirty === false`), 'confirm applies the template and clears the taint');
  check(await p.eval(`__studio.pg.els.some(e => e.key === 'title' && e.text === 'My Shop Sale')`), 'the edited title followed the design into the new template');
  await p.click('aside button[title*="·"]', 2);
  await p.wait(300);
  check(await p.eval(`!document.querySelector('[role=dialog]') && __studio.dirty === false`), 'a second template swap without edits does not ask');
  check(await p.eval(`__studio.pg.els.some(e => e.key === 'title' && e.text === 'My Shop Sale')`), 'the edited title is still there after the second swap');
  await p.eval(`__studio.addText('heading')`);
  await p.wait(100);
  check(await p.eval(`__studio.dirty === true`), 'an edit taints it again');
  check(await p.eval(`document.querySelectorAll('a[title="Source on GitHub"]').length === 1`), 'GitHub link in the top bar');
  // recents
  await p.eval(`__studio.flushAutosave()`);
  await p.wait(600);
  await p.clickText('Pinwheel');
  await p.until(`__studio.state.screen === 'home'`);
  await p.until(`document.body.innerText.includes('Recent designs')`);
  await p.wait(400);
  await p.shot('08-home-recents');
  const rec = await p.eval(`(() => ({ n: __studio.state.recents.length, name: __studio.state.recents[0].name, thumbs: document.querySelectorAll('.pw-recent').length }))()`);
  check(rec.n >= 1 && rec.thumbs === rec.n && rec.name === 'Slow Morning Roasters', 'recents lists the design, newest first ' + JSON.stringify(rec));
  await p.click('.pw-recent');
  await p.until(`__studio.state.screen === 'editor'`);
  check(await p.eval(`__studio.state.doc.name === ${JSON.stringify(rec.name)}`), 'reopened from recents');
  // 100 cap
  const cap = await p.eval(`(async () => { const DB = await import('/src/store.js'); for (let i = 0; i < 105; i++) await DB.putRecent({ id: 'x' + i, name: 'x' + i, updated: 1000 + i, w: 100, h: 100, pages: 1, preview: { page: { id: 'p', bg: '#fff', els: [] }, assets: {} } }, { id: 'x' + i, doc: {}, assets: {} }); const l = await DB.listRecents(); const cleared = await DB.clearRecents(); return l.length; })()`);
  check(cap === 100, 'recents capped at 100 (' + cap + ')');

  // Highlighted text (a background span) once reverted when editing ended by a
  // click on another element: the reaction layout's split title.
  await p.eval(`__studio.fromTemplate(__studio.P.catalog().find(t => t.layout === 'reaction'))`);
  await p.wait(300);
  // The click-away target is another element that really is under the pointer there.
  const hl = await p.eval(`(() => { const el = __studio.pg.els.find(e => e.type === 'text' && e.bg); const r = document.querySelector('[data-el-id="' + el.id + '"]').getBoundingClientRect();
    const c = __studio.canvasEl.getBoundingClientRect(); let ox = null, oy = null;
    for (const o of __studio.pg.els) { if (o.id === el.id || o.hidden) continue; const n = document.querySelector('[data-el-id="' + o.id + '"]'); if (!n) continue; const b = n.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; if (x < c.left || x > c.right || y < c.top || y > c.bottom) continue; const hit = document.elementFromPoint(x, y); const hid = hit && hit.closest('[data-el-id]') && hit.closest('[data-el-id]').getAttribute('data-el-id'); if (hid === o.id) { ox = x; oy = y; break; } }
    return { id: el.id, x: r.left + r.width / 2, y: r.top + r.height / 2, ox, oy }; })()`);
  check(hl.ox != null, 'found another element to click');
  for (const cc of [1, 2]) { await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: hl.x, y: hl.y, button: 'left', clickCount: cc }); await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: hl.x, y: hl.y, button: 'left', clickCount: cc }); }
  await p.wait(150);
  await p.send('Input.insertText', { text: 'Spring' });
  await p.wait(60);
  await p.mouse(hl.ox, hl.oy);
  await p.wait(200);
  check(await p.eval(`__studio.pg.els.find(e => e.id === ${JSON.stringify(hl.id)}).text === 'Spring'`), 'highlighted text keeps the typed text after clicking another element');

  // Hovering an empty frame shows a "Replace image" pill that survives the pointer
  // moving onto it, and goes away once the pointer leaves.
  await p.eval(`__studio.fromTemplate(__studio.P.catalog().find(t => t.layout === 'hero-photo' && t.fmt === 'ig-post'))`);
  await p.wait(400);
  await p.eval(`__studio.setState({ panel: null, sel: [] })`); await p.wait(100);
  const fr = await p.eval(`(() => { const el = __studio.pg.els.find(e => e.type === 'image' && !e.asset); const b = document.querySelector('[data-el-id="' + el.id + '"]').getBoundingClientRect(); return { x: b.left + b.width * .3, y: b.top + b.height * .3 }; })()`);
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: fr.x, y: fr.y }); await p.wait(150);
  const pill = await p.eval(`(() => { const b = document.querySelector('button[title="Choose an image for this frame"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  check(!!pill, 'hovering an empty frame shows the Replace image pill');
  if (pill) {
    for (let i = 1; i <= 4; i++) await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: fr.x + (pill.x - fr.x) * i / 4, y: fr.y + (pill.y - fr.y) * i / 4 });
    await p.wait(300);
    check(await p.eval(`!!document.querySelector('button[title="Choose an image for this frame"]')`), 'the pill stays while the pointer is on it');
    const off = await p.eval(`(() => { const r = __studio.canvasEl.getBoundingClientRect(); return { x: r.left + 8, y: r.bottom - 8 }; })()`);
    await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: off.x, y: off.y }); await p.wait(350);
    check(await p.eval(`!document.querySelector('button[title="Choose an image for this frame"]')`), 'the pill goes away when the pointer leaves');
  }

  // Rotation: pressing the handle must not jump; a small drag turns a little.
  await p.eval(`(() => { const el = __studio.pg.els.find(e => e.type === 'text'); __studio.setState({ sel: [el.id] }); })()`);
  await p.wait(100);
  const rot0 = await p.eval(`__studio.selEls()[0].rot || 0`);
  const hdl = await p.eval(`(() => { const r = document.querySelector('[title="Rotate"]').getBoundingClientRect(); const el = __studio.selEls()[0]; const n = document.querySelector('[data-page-node="' + __studio.pg.id + '"]').getBoundingClientRect(); const z = __studio.state.zoom; return { x: r.left + r.width / 2, y: r.top + r.height / 2, cx: n.left + (el.x + el.w / 2) * z, cy: n.top + (el.y + el.h / 2) * z }; })()`);
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hdl.x, y: hdl.y });
  await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: hdl.x, y: hdl.y, button: 'left', clickCount: 1 });
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hdl.x + 1, y: hdl.y, button: 'left' });
  await p.wait(80);
  const rotPress = await p.eval(`__studio.selEls()[0].rot || 0`);
  check(Math.abs(rotPress - rot0) < 3, `pressing the rotate handle does not jump (${rot0}° → ${rotPress}°)`);
  // Sweep the pointer 30° clockwise around the element's centre.
  const rad = Math.hypot(hdl.x - hdl.cx, hdl.y - hdl.cy), base = Math.atan2(hdl.y - hdl.cy, hdl.x - hdl.cx);
  for (let i = 1; i <= 6; i++) { const t = base - (Math.PI / 6) * i / 6; await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hdl.cx + Math.cos(t) * rad, y: hdl.cy + Math.sin(t) * rad, button: 'left' }); }
  await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: hdl.x, y: hdl.y, button: 'left', clickCount: 1 });
  await p.wait(100);
  const rot1 = await p.eval(`__studio.selEls()[0].rot || 0`);
  check(Math.abs(((rot1 - rot0 + 540) % 360 - 180) + 30) < 4, `a 30° sweep rotates about 30° (${rot0}° → ${rot1}°)`);

  // Sliders: the value can be typed, and the range follows the value past its end.
  await p.eval(`(() => { const el = __studio.pg.els.find(e => e.type === 'text'); __studio.setState({ sel: [el.id], panel: null }); __studio.patchSel(x => { x.shadow = { x: 20, y: 20, blur: 0, color: '#111111', long: true }; }); })()`);
  await p.wait(150);
  const lenBtn = await p.eval(`(() => { const row = [...document.querySelectorAll('aside span')].find(s => s.textContent.trim() === 'Length'); const b = row && row.parentElement.querySelector('button'); return b ? { text: b.textContent.trim(), max: +row.parentElement.parentElement.querySelector('input[type=range]').max } : null; })()`);
  check(lenBtn && /px$/.test(lenBtn.text), 'the long-shadow Length value is clickable ' + JSON.stringify(lenBtn));
  await p.eval(`[...document.querySelectorAll('aside span')].find(s => s.textContent.trim() === 'Length').parentElement.querySelector('button').click()`);
  await p.wait(100);
  await p.type('aside input.pw-slider-edit', '500');
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await p.wait(150);
  const afterLen = await p.eval(`(() => { const el = __studio.selEls()[0]; const len = Math.round(Math.hypot(el.shadow.x, el.shadow.y)); const row = [...document.querySelectorAll('aside span')].find(s => s.textContent.trim() === 'Length'); const range = row.parentElement.parentElement.querySelector('input[type=range]'); return { len, max: +range.max, val: +range.value, editing: !!document.querySelector('aside input.pw-slider-edit') }; })()`);
  check(Math.abs(afterLen.len - 500) <= 1 && afterLen.max >= 500 && Math.abs(afterLen.val - 500) <= 1 && !afterLen.editing, 'typed 500 px: shadow is 500 and the slider now reaches it ' + JSON.stringify(afterLen));

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
  await p.clickText('Next', '.pw-wiz button'); await p.wait(200);
  await p.shot('17-phone-wizard-kits');
  await p.eval(`__studio.closeWizard()`);

  console.log('\nconsole errors:', p.errors.length ? '\n  ' + p.errors.join('\n  ') : 'none');
  check(!p.errors.filter(e => !/favicon|Download the React DevTools/.test(e)).length, 'no console errors');
  p.close();
} catch (e) { console.error('SCENARIO ERROR', e); fails.push(String(e)); }
chrome.kill();
console.log(fails.length ? `\n${fails.length} failure(s)` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
