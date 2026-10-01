// Pinwheel Studio — editor. The only stateful module: document state, history,
// selection, pointer gestures, snapping and the panel/properties model.
//
// renderVals() returns the flat object StudioView renders against, so every value
// the UI shows is derived in one place and the view stays free of logic.
import React from 'react';

import StudioView from './StudioView.jsx';
import './lib/hover.css';

let firstBrand = null;

export default class Studio extends React.Component {
  state = {
    ready: false, loadError: null, screen: 'home', doc: null, assets: {}, uploads: [], sel: [], page: 0, zoom: .5,
    panel: 'templates', editingId: null, guides: [], marquee: null, hoverId: null, dragInfo: null,
    galCat: 'All', galOcc: null, galQ: '', galLimit: 48, tplQ: '', tplSame: true, tplLimit: 24, menu: null, busy: null, toast: null,
    cropMode: false, exportScale: 2, relayout: true,
    brand: { bg: '#FBF7F0', ink: '#1F1B16', accent: '#1F7D62', accent2: '#2F6F73', heading: 'DM Serif Display', body: 'DM Sans', logo: null, assets: {}, palettes: [], textStyles: [] },
    brands: [], recents: [], recentsAll: false, wiz: null, propsOpen: false, phoneMenu: null, dialog: null, dialogValue: '', sliderEdit: null,
    // brandOn: templates and new designs take the active brand's colours and fonts.
    // Off on every visit, so the gallery always opens with templates in their own
    // style; the choice lasts for the session only.
    brandOn: false, fonts: {},
    customW: 1080, customH: 1080, fmtsAll: false,
    helpOpen: false, layerDrag: null, layerOver: null, fontQ: '', fontCat: 'all', fontAnchor: null,
    vw: typeof window !== 'undefined' ? window.innerWidth : 1280,
    theme: (() => { try { return localStorage.getItem('pinwheel.theme') || 'system'; } catch (e) { return 'system'; } })()
  };
  // Responsive breakpoints. Phones get a single column with bottom sheets, tablets
  // keep the rail but the flyout floats over the canvas, desktops get three columns.
  get layout() { const w = this.state.vw; return w < 720 ? 'phone' : w < 1080 ? 'tablet' : 'desktop'; }
  get coarse() { return typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches; }
  hist = []; fut = []; thumbCache = new Map(); builtCache = new Map(); clip = null;
  CORAL = 'var(--pw-accent-line)';
  /** Resolved value of a UI token, for the few places that need a literal (SVG fills). */
  cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  ONEW = ['Anton', 'Bebas Neue', 'Archivo Black', 'Abril Fatface', 'DM Serif Display', 'Pacifico', 'Instrument Serif', 'Permanent Marker', 'Alfa Slab One', 'Righteous', 'Lobster'];
  // Text styles: a face plus outline, shadow or highlight, with colours as theme roles
  // resolved when applied. Click adds a heading, or restyles the selected text.
  TEXT_STYLES = [
    { id: 'outline', name: 'Outlined', font: 'Anton', weight: 400, upper: true, ls: .02, color: 'ink', outline: 'ink', outlineW: 2 },
    { id: 'hard', name: 'Hard shadow', font: 'Archivo Black', weight: 400, upper: true, ls: -.01, color: 'ink', shadow: { x: .07, y: .07, blur: 0, color: 'accent' } },
    { id: 'offset', name: 'Retro offset', font: 'Abril Fatface', weight: 400, upper: false, ls: 0, color: 'accent', outline: 'ink', outlineW: 1.5, outlineFill: true, shadow: { x: .06, y: .06, blur: 0, color: 'accent2' } },
    { id: 'glow', name: 'Soft glow', font: 'Unbounded', weight: 700, upper: false, ls: -.02, color: 'accent', shadow: { x: 0, y: 0, blur: .4, color: 'accent' } },
    { id: 'neon', name: 'Neon', font: 'Pacifico', weight: 400, upper: false, ls: 0, color: 'bg', outline: 'accent', outlineW: 1.2, outlineFill: true, shadow: { x: 0, y: 0, blur: .3, color: 'accent' } },
    { id: 'highlight', name: 'Highlighter', font: 'Playfair Display', weight: 700, upper: false, ls: -.01, color: 'ink', bg: 'accent2' },
    { id: 'pill', name: 'Pill', font: 'DM Sans', weight: 700, upper: true, ls: .12, color: 'onAccent', bg: 'accent', sizeMul: .45 },
    { id: 'stamp', name: 'Stamp', font: 'Bebas Neue', weight: 400, upper: true, ls: .2, color: 'accent', outline: 'accent', outlineW: 1, outlineFill: true },
    { id: 'ghost', name: 'Ghost', font: 'Space Grotesk', weight: 700, upper: true, ls: .04, color: 'ink', outline: 'ink', outlineW: 1 },
    { id: 'long', name: 'Long shadow', font: 'Bebas Neue', weight: 400, upper: true, ls: .02, color: 'bg', shadow: { x: .14, y: .14, blur: 0, color: 'ink', long: true } },
    { id: 'poster', name: 'Poster 3D', font: 'Anton', weight: 400, upper: true, ls: .01, color: 'accent', outline: 'ink', outlineW: 1.2, outlineFill: true, shadow: { x: .12, y: .12, blur: 0, color: 'ink', long: true } },
    { id: 'marker', name: 'Marker', font: 'Permanent Marker', weight: 400, upper: false, ls: 0, color: 'accent', shadow: { x: .04, y: .04, blur: .12, color: 'rgba(0,0,0,.25)' } },
    { id: 'elegant', name: 'Elegant', font: 'Cormorant Garamond', weight: 700, upper: true, ls: .25, color: 'ink' },
    { id: 'script', name: 'Script', font: 'Dancing Script', weight: 700, upper: false, ls: 0, color: 'accent', shadow: { x: 0, y: .05, blur: .15, color: 'rgba(0,0,0,.2)' } },
    { id: 'slab', name: 'Slab', font: 'Alfa Slab One', weight: 400, upper: false, ls: 0, color: 'ink', shadow: { x: .05, y: .05, blur: 0, color: 'accent2' } },
  ];
  /** Resolve a text style's roles against the document theme at a given size. */
  styleProps(sty, size) {
    const t = this.state.doc.theme, role = c => ({ ink: t.ink, bg: t.bg, accent: t.accent, accent2: t.accent2, onAccent: t.onAccent, muted: t.muted }[c] || c);
    const sh = sty.shadow ? { x: Math.round(sty.shadow.x * size), y: Math.round(sty.shadow.y * size), blur: Math.round(sty.shadow.blur * size), color: role(sty.shadow.color), ...(sty.shadow.long ? { long: true } : {}) } : sty.softShadow ? true : null;
    return { font: sty.font, weight: sty.weight, italic: !!sty.italic, upper: !!sty.upper, ls: sty.ls || 0, color: role(sty.color), bg: sty.bg ? role(sty.bg) : null, outline: sty.outline ? role(sty.outline) : null, outlineW: sty.outlineW ? Math.max(1, Math.round(sty.outlineW * size / 40 * 10) / 10) : undefined, outlineFill: !!sty.outlineFill, shadow: sh };
  }
  applyTextStyle(sty) {
    const d = this.state.doc, sel = this.selEls().filter(e => e.type === 'text');
    if (sel.length) { const ids = new Set(sel.map(e => e.id)); this.setDoc((dd, p) => p.els.forEach(e => { if (ids.has(e.id)) Object.assign(e, this.styleProps(sty, e.size)); })); return; }
    const u = this.u(), size = Math.round(u * 9 * (sty.sizeMul || 1));
    this.addEls([this.mk('text', d.w * .7, size * 1.1, { name: sty.name, text: sty.id === 'pill' ? 'New' : 'Make it memorable', size, align: 'center', lh: 1.05, ...this.styleProps(sty, size) })]);
  }
  setCanvasRef = n => { this.canvasEl = n; };
  setImgInput = n => { this.imgInput = n; };
  setFileInput = n => { this.fileInput = n; };
  setLogoInput = n => { this.logoInput = n; };
  setBrandAssetInput = n => { this.brandAssetInput = n; };
  setFontInput = n => { this.fontInput = n; };

  // 'system' follows prefers-color-scheme; 'light' / 'dark' pin it via data-theme.
  applyTheme(t) { const r = document.documentElement; if (t === 'system') delete r.dataset.theme; else r.dataset.theme = t; }
  isDark() { const t = this.state.theme; return t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); }
  toggleHelp = () => this.setState(s => ({ helpOpen: !s.helpOpen, menu: null }));
  stopClick = e => e.stopPropagation();
  toggleTheme = () => { const t = this.isDark() ? 'light' : 'dark'; try { localStorage.setItem('pinwheel.theme', t); } catch (e) { } this.applyTheme(t); this.setState({ theme: t }); };
  componentDidMount() {
    if (import.meta.env.DEV) window.__studio = this; // for the browser smoke tests
    this.applyTheme(this.state.theme);
    this._mq = matchMedia('(prefers-color-scheme: dark)'); this._mqFn = () => this.forceUpdate(); this._mq.addEventListener('change', this._mqFn);
    this._key = e => this.onKey(e); window.addEventListener('keydown', this._key);
    this._paste = e => this.onPaste(e); window.addEventListener('paste', this._paste);
    this._rs = () => { const vw = window.innerWidth; if (vw !== this.state.vw) this.setState({ vw }); clearTimeout(this._rst); this._rst = setTimeout(() => this.state.screen === 'editor' && this.fitZoom(), 150); }; window.addEventListener('resize', this._rs);
    this._bu = () => this.flushAutosave(); window.addEventListener('pagehide', this._bu);
    // Spec §5: the PWA registers a .pinwheel file handler, so opening a file from the
    // OS launches the studio with that file.
    if ('launchQueue' in window && 'LaunchParams' in window && 'files' in window.LaunchParams.prototype) {
      window.launchQueue.setConsumer(async ({ files }) => { if (files && files.length) this.openProjectFile(await files[0].getFile(), files[0]); });
    }
    Promise.all([import('./presets.js'), import('./render.js'), import('./io.js'), import('./suggest.js'), import('./store.js'), import('./brand.js'), import('./palette.js')]).then(async ([P, R, IO, S, DB, B, PAL]) => {
      this.P = P; this.R = R; this.IO = IO; this.S = S; this.DB = DB; this.B = B; this.PAL = PAL;
      this.profile = S.loadProfile(); this._pv = 0; this._rankCache = new Map();
      // The renderer reads window.qrcode synchronously; pull it in now and repaint.
      IO.lib('qr').then(() => this.forceUpdate()).catch(() => { });
      P.FONTS.forEach(f => { const href = P.fontURL(f); if (document.querySelector(`link[href="${href}"]`)) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.crossOrigin = 'anonymous'; document.head.appendChild(l); });
      P.catalog();
      const { brands, brand } = await this.loadBrands();
      await this.migrateLocalStorage(brand);
      const recents = await this.loadRecents();
      const fonts = B.allFonts(brands); Object.values(fonts).forEach(f => IO.registerFont(f.family, f.src, f.mime));
      this.setState({ ready: true, brands, brand, fonts, recents, assets: { ...this.state.assets, ...brand.assets } }, () => {
        if (this._pendingFile) { const [f, h] = this._pendingFile; this._pendingFile = null; this.openProjectFile(f, h); }
        else if (this.props.startScreen === 'editor') this.newDoc('ig-post');
      });
    }).catch(err => { console.error(err); this.setState({ loadError: String(err) }); });
  }
  componentWillUnmount() { this._mq.removeEventListener('change', this._mqFn); window.removeEventListener('keydown', this._key); window.removeEventListener('paste', this._paste); window.removeEventListener('resize', this._rs); window.removeEventListener('pagehide', this._bu); }
  componentDidUpdate(pp, ps) {
    // Editing ended by some route other than blur: commit what was typed.
    if (ps.editingId && ps.editingId !== this.state.editingId) { const e = this._edit; this._edit = null; if (e && e.id === ps.editingId) this.onTextCommit(e.id, e.text); }
    if (this.state.doc && this.state.doc !== ps.doc) { this.scheduleMeasure(); this.scheduleAutosave(); }
    if (this.state.brand !== ps.brand && this.state.ready) this.saveBrandSoon();
  }

  /* ---------- storage: brands ---------- */
  // Several brands live side by side in IndexedDB; one is active. The active brand's
  // assets are merged into the editor's asset table so its logo and images can be
  // placed like any upload.
  async loadBrands() {
    const B = this.B, DB = this.DB; let brands = [];
    try { brands = (await DB.listBrands()).map(B.migrateBrand); } catch (e) { console.warn('Could not read brands', e); }
    if (!brands.length) {
      // First run on this device: the v1 kit in localStorage becomes the first brand.
      // Single-flight, because a development double-mount boots twice at once.
      firstBrand ||= (async () => {
        let old = null; try { old = JSON.parse(localStorage.getItem('pinwheel.brand') || 'null'); } catch (e) { }
        const b = B.migrateBrand(old ? { ...old, logo: null } : null);
        try { await DB.putBrand(b); localStorage.removeItem('pinwheel.brand'); } catch (e) { }
        return b;
      })();
      brands = [await firstBrand];
    }
    let id = null; try { id = await DB.getKV('brandId'); } catch (e) { }
    const brand = brands.find(b => b.id === id) || brands[0];
    return { brands, brand };
  }
  async migrateLocalStorage() {
    try {
      const a = JSON.parse(localStorage.getItem('pinwheel.autosave') || 'null');
      if (a && a.doc) { const doc = a.doc; if (!doc.id) doc.id = this.B.bid('d'); await this.writeRecent(doc, a.assets || {}); }
      localStorage.removeItem('pinwheel.autosave');
    } catch (e) { }
  }
  saveBrandSoon() { clearTimeout(this._bt); this._bt = setTimeout(() => { const b = this.state.brand; this.DB.putBrand(b).catch(e => console.warn('Could not save brand', e)); this.DB.setKV('brandId', b.id).catch(() => { }); }, 400); }
  /** Shallow update of the active brand, mirrored into the brands list. */
  setBrand(patch) { this.setState(s => { const b = { ...s.brand, ...patch, updated: Date.now() }; return { brand: b, brands: s.brands.map(x => x.id === b.id ? b : x) }; }); }
  activateBrand = id => { const b = this.state.brands.find(x => x.id === id); if (!b) return; this.setState(s => ({ brand: b, assets: { ...s.assets, ...b.assets }, menu: null })); this.DB.setKV('brandId', id).catch(() => { }); };
  /** Use a brand for templates and new designs (id), or none (null). */
  useBrand = id => { if (id) this.activateBrand(id); this.setState({ brandOn: !!id }); };
  /** Every uploaded font the editor knows: all brands' plus any that came in with a file. */
  refreshFonts(extra = {}) {
    const fonts = { ...this.B.allFonts(this.state.brands), ...(this._fileFonts || {}), ...extra };
    Object.values(fonts).forEach(f => this.IO.registerFont(f.family, f.src, f.mime));
    this.setState({ fonts }); return fonts;
  }
  onFontFile = async e => {
    const files = [...e.target.files]; e.target.value = ''; if (!files.length) return;
    this.setState({ busy: 'Adding font…' });
    try {
      let fonts = { ...this.state.brand.fonts };
      for (const f of files) {
        const r = await this.IO.readFontFile(f); const family = this.B.fontFamilyFrom(r.name, [...this.P.FONTS.map(x => x.name), ...Object.keys(this.state.fonts), ...Object.values(fonts).map(x => x.family)]);
        if (!(await this.IO.registerFont(family, r.src, r.mime))) throw new Error('That font could not be loaded');
        fonts = { ...fonts, ['f' + this.P.nid()]: { ...r, family } };
      }
      this.setBrand({ fonts }); this.setState(s => ({ fonts: { ...s.fonts, ...Object.fromEntries(Object.values(fonts).map(f => [f.family, f])) } }));
      this.toast(files.length > 1 ? `Added ${files.length} fonts to the brand` : 'Font added to the brand');
    } catch (err) { this.toast(err.message || 'Could not read that font'); }
    this.setState({ busy: null });
  };
  uploadFont = () => this.fontInput && this.fontInput.click();
  async removeBrandFont(id) {
    const b = this.state.brand, f = b.fonts[id]; if (!f) return;
    if (!(await this.ask({ title: `Remove “${f.family}”?`, body: 'Designs already using it fall back to a standard font on this device.', confirmLabel: 'Remove', danger: true }))) return;
    const fonts = { ...b.fonts }; delete fonts[id];
    const patch = { fonts }; if (b.heading === f.family) patch.heading = this.B.DEFAULT_BRAND.heading; if (b.body === f.family) patch.body = this.B.DEFAULT_BRAND.body;
    this.setBrand(patch); setTimeout(() => this.refreshFonts(), 0);
  }
  /** The uploaded fonts a document uses, keyed by a file-safe id, for packing. */
  fontsFor(doc) { const used = new Set(this.IO.usedFonts(doc)); return Object.fromEntries(Object.values(this.state.fonts).filter(f => used.has(f.family)).map(f => [f.family.replace(/\W+/g, '-').toLowerCase(), f])); }
  createBrand(partial) { const b = this.B.newBrand(partial); this.setState(s => ({ brands: [...s.brands, b], brand: b, assets: { ...s.assets, ...b.assets } }), () => this.saveBrandSoon()); return b; }
  renameBrand = async () => { const n = await this.ask({ title: 'Rename brand', input: { value: this.state.brand.name, placeholder: 'Brand name' }, confirmLabel: 'Rename' }); if (n) this.setBrand({ name: n }); };
  duplicateBrand = () => { const { id, ...rest } = structuredClone(this.state.brand); this.createBrand({ ...rest, name: rest.name + ' copy', created: Date.now() }); this.toast('Brand duplicated'); };
  deleteBrand = async () => {
    const b = this.state.brand; if (!(await this.ask({ title: `Delete “${b.name}”?`, body: 'Its saved images, colour schemes and text styles go with it. Designs made with it are not affected.', confirmLabel: 'Delete brand', danger: true }))) return;
    this.setState(s => { const brands = s.brands.filter(x => x.id !== b.id); const next = brands[0] || this.B.newBrand(); return { brands: brands.length ? brands : [next], brand: next, assets: { ...s.assets, ...next.assets }, menu: null }; }, () => { this.DB.deleteBrand(b.id).catch(() => { }); this.saveBrandSoon(); });
  };
  /** A kit opened from a .pinwheel file: replaces a brand with the same id, else is added. */
  async importBrandKit(json, assets, fonts = {}) {
    const b = this.B.brandFromKit(json, assets, fonts); const exists = this.state.brands.some(x => x.id === b.id);
    if (exists && !(await this.ask({ title: `Replace “${b.name}”?`, body: 'A brand with this id is already on this device. The one in the file replaces it, including its images, schemes and styles.', confirmLabel: 'Replace' }))) return;
    this.setState(s => ({ brands: exists ? s.brands.map(x => x.id === b.id ? b : x) : [...s.brands, b], brand: b, assets: { ...s.assets, ...b.assets }, menu: null, wiz: null }), () => { this.saveBrandSoon(); this.refreshFonts(); this.toast('Imported brand kit “' + b.name + '”'); });
  }
  exportBrandKit = async () => {
    const b = this.state.brand, name = this.IO.safe(b.name) + '-brand-kit.pinwheel';
    const sink = await this.IO.openSink(name, this.IO.TYPES.pinwheel); if (sink === 'cancel') return;
    this.setState({ busy: 'Packing brand kit…', menu: null, phoneMenu: null });
    try { const blob = await this.IO.packBrandKit(b, this.B.brandForKit(b)); if (sink) await sink.write(blob); else await this.IO.deliver(blob, name, b.name + ' brand kit'); this.toast('Brand kit ready'); }
    catch (err) { console.error(err); this.toast('Could not pack the brand kit — ' + (err.message || err)); }
    this.setState({ busy: null });
  };
  // Brand assets persist with the brand; the logo is one of them.
  onBrandAssetFile = async e => {
    const files = [...e.target.files]; e.target.value = ''; if (!files.length) return;
    this.setState({ busy: 'Adding to brand…' });
    try { for (const f of files) { const r = await this.IO.readImageFile(f); const id = 'a' + this.P.nid(); this.setState(s => ({ assets: { ...s.assets, [id]: r } })); this.setBrand({ assets: { ...this.state.brand.assets, [id]: r }, logo: this._assetFor === 'logo' ? id : this.state.brand.logo }); } }
    catch (err) { this.toast('Could not read that image'); }
    this._assetFor = null; this.setState({ busy: null });
  };
  pickBrandAsset = kind => { this._assetFor = kind; this.brandAssetInput && this.brandAssetInput.click(); };
  async removeBrandAsset(id) {
    if (!(await this.ask({ title: 'Remove this image from the brand?', body: 'Designs already using it keep their copy.', confirmLabel: 'Remove', danger: true }))) return;
    const b = this.state.brand; const assets = { ...b.assets }; delete assets[id]; this.setBrand({ assets, logo: b.logo === id ? null : b.logo });
  }
  savePaletteToBrand = () => { const t = this.state.doc.theme; const n = this.state.brand.palettes.length + 1; this.setBrand({ palettes: [...this.state.brand.palettes, this.B.paletteFrom(t, 'Scheme ' + n)] }); this.toast('Colour scheme saved to brand'); };
  saveTextStyleToBrand = () => {
    const el = this.selEls().find(e => e.type === 'text'); if (!el) return this.toast('Select some text first');
    const n = this.state.brand.textStyles.length + 1; this.setBrand({ textStyles: [...this.state.brand.textStyles, this.B.textStyleFrom(el, this.state.doc.theme, 'Style ' + n)] }); this.toast('Text style saved to brand');
  };

  /* ---------- storage: recents ---------- */
  // Every design the user touches is kept, saved or not, up to the last hundred.
  // The list record carries page 1 with low-res copies of its images so the home
  // page can draw live thumbnails without loading whole documents.
  async loadRecents() { try { const recents = await this.DB.listRecents(); this.setState({ recents }); return recents; } catch (e) { console.warn('Could not read recents', e); return []; } }
  async lowResFor(id, a) {
    this._lr ||= new Map(); const key = id + '|' + a.src.length;
    if (!this._lr.has(key)) this._lr.set(key, await this.IO.lowRes(a.src, 200, a.alpha));
    return this._lr.get(key);
  }
  async writeRecent(doc, assets) {
    const used = {}; doc.pages.forEach(p => { if (p.bgAsset && assets[p.bgAsset]) used[p.bgAsset] = assets[p.bgAsset]; p.els.forEach(e => { if (e.asset && assets[e.asset]) used[e.asset] = assets[e.asset]; if (e.origAsset && assets[e.origAsset]) used[e.origAsset] = assets[e.origAsset]; }); });
    const p1 = doc.pages[0], thumbs = {};
    for (const id of Object.keys(used)) { if (p1.bgAsset === id || p1.els.some(e => e.asset === id)) thumbs[id] = { ...used[id], src: await this.lowResFor(id, used[id]) }; }
    const meta = { id: doc.id, name: doc.name, fmt: doc.fmt, w: doc.w, h: doc.h, pages: doc.pages.length, created: doc.created, updated: Date.now(), tpl: doc.tpl || null, preview: { page: p1, assets: thumbs } };
    await this.DB.putRecent(meta, { id: doc.id, doc, assets: used });
    return meta;
  }
  scheduleAutosave() { clearTimeout(this._as); this._as = setTimeout(() => this.flushAutosave(), 1200); }
  flushAutosave() {
    clearTimeout(this._as); const { doc, assets } = this.state; if (!doc || !doc.id) return Promise.resolve();
    if (!doc.pages.some(p => p.els.length)) return Promise.resolve();
    return (this._asp = (this._asp || Promise.resolve()).then(() => this.writeRecent(doc, assets)).catch(e => console.warn('Autosave failed', e)));
  }
  openRecent = async id => {
    this.setState({ busy: 'Opening…' });
    try { const r = await this.DB.getRecentDoc(id); if (!r) throw new Error('That design is no longer stored'); this.fileHandle = null; this.openDoc(r.doc, r.assets || {}); }
    catch (err) { this.toast(err.message || 'Could not open that design'); await this.loadRecents(); }
    this.setState({ busy: null });
  };
  deleteRecent = async id => {
    const r = this.state.recents.find(x => x.id === id);
    if (!(await this.ask({ title: `Remove “${r ? r.name || 'Untitled' : 'this design'}” from recents?`, body: 'It is removed from this device. A .pinwheel file you saved is not affected.', confirmLabel: 'Remove', danger: true }))) return;
    await this.DB.deleteRecent(id).catch(() => { }); this.setState(s => ({ recents: s.recents.filter(x => x.id !== id) }));
  };
  clearRecents = async () => { if (!(await this.ask({ title: 'Clear recent designs?', body: 'Every design kept on this device is removed. Files you saved as .pinwheel are not affected.', confirmLabel: 'Clear all', danger: true }))) return; await this.DB.clearRecents().catch(() => { }); this.setState({ recents: [] }); };

  /* ---------- infra ---------- */
  // Suggestions: what the gallery shows before anyone asks, and in what order. See
  // suggest.js for the rules. Ranking is memoized per (hide, profile version, day).
  ranked(hide) {
    const key = `${hide}|${this._pv}|${new Date().toDateString()}`;
    if (!this._rankCache.has(key)) { this._rankCache.clear(); this._rankCache.set(key, this.S.rank(this.P.catalog(), { profile: this.profile, hide })); }
    return this._rankCache.get(key);
  }
  note(kind, id, weight = 1) { if (!this.S || !id) return; this.S.record(this.profile, kind, id, weight); this.S.saveProfile(this.profile); this._pv++; }
  noteQuery(q) { clearTimeout(this._qt); this._qt = setTimeout(() => this.S.topicsFor(q, this.P.TOPICS).forEach(id => this.note('topic', id, .6)), 600); }
  toast(t) { clearTimeout(this._tt); this.setState({ toast: t }); this._tt = setTimeout(() => this.setState({ toast: null }), 2600); }
  /* ---------- dialogs ---------- */
  // One modal (StudioView renders it with Radix Dialog) stands in for confirm() and
  // prompt(): `ask` resolves true/false, or the entered text / null with `input`.
  ask(opts) { return new Promise(resolve => this.setState({ dialog: { confirmLabel: 'OK', cancelLabel: 'Cancel', ...opts, resolve }, dialogValue: opts.input ? (opts.input.value || '') : '', menu: null })); }
  dialogDone = ok => {
    const d = this.state.dialog; if (!d) return; const val = this.state.dialogValue;
    this.setState({ dialog: null, dialogValue: '' });
    d.resolve(d.input ? (ok ? val.trim() || null : null) : !!ok);
  };
  // "Tainted": the design has been edited since it was opened or last re-templated.
  // Applying a template or re-laying out on resize replaces the page, so it asks
  // first, and the flag clears until the next edit.
  dirty = false;
  get pg() { const { doc, page } = this.state; return doc ? doc.pages[Math.min(page, doc.pages.length - 1)] : null; }
  selEls() { const p = this.pg; return p ? p.els.filter(e => this.state.sel.includes(e.id)) : []; }
  snap() { const d = this.state.doc; return JSON.stringify({ w: d.w, h: d.h, fmt: d.fmt, pages: d.pages, theme: d.theme }); }
  pushHist(key) {
    if (!this.state.doc) return; const now = Date.now(); this.dirty = true;
    if (typeof key === 'string' && key === this._hk && now - this._ht < 900) { this._ht = now; return; }
    this._hk = typeof key === 'string' ? key : null; this._ht = now;
    this.hist.push(this.snap()); if (this.hist.length > 150) this.hist.shift(); this.fut = [];
  }
  setDoc(fn, hist = true) {
    if (hist) this.pushHist(hist);
    this.setState(s => { const d = structuredClone(s.doc); fn(d, d.pages[Math.min(s.page, d.pages.length - 1)]); return { doc: d }; });
  }
  patchSel(patch, hist = true) { const ids = this.state.sel; this.setDoc((d, p) => p.els.forEach(e => { if (ids.includes(e.id)) typeof patch === 'function' ? patch(e) : Object.assign(e, patch); }), hist); }
  undo = () => { if (!this.hist.length) return; this.fut.push(this.snap()); const r = JSON.parse(this.hist.pop()); this._hk = null; this.setState(s => ({ doc: { ...s.doc, ...r }, editingId: null, sel: [], page: Math.min(s.page, r.pages.length - 1) })); };
  redo = () => { if (!this.fut.length) return; this.hist.push(this.snap()); const r = JSON.parse(this.fut.pop()); this._hk = null; this.setState(s => ({ doc: { ...s.doc, ...r }, editingId: null, sel: [], page: Math.min(s.page, r.pages.length - 1) })); };
  scheduleMeasure() {
    cancelAnimationFrame(this._mr);
    this._mr = requestAnimationFrame(() => {
      const d = this.state.doc; if (!d) return; const fixes = [];
      d.pages.forEach((p, pi) => p.els.forEach(el => { if (el.type !== 'text' || el.id === this.state.editingId) return; const n = document.querySelector(`[data-el-id="${el.id}"]`); if (!n) return; const hh = n.offsetHeight; if (hh && Math.abs(hh - el.h) > 1) fixes.push([pi, el.id, hh]); }));
      if (fixes.length) this.setState(s => { const doc = structuredClone(s.doc); fixes.forEach(([pi, id, hh]) => { const e = doc.pages[pi] && doc.pages[pi].els.find(x => x.id === id); if (e) e.h = hh; }); return { doc }; });
    });
  }
  reId(els) { const gm = {}; return els.map(e => { const n = structuredClone(e); n.id = this.P.nid(); if (n.groupId) n.groupId = gm[n.groupId] ||= this.P.nid(); return n; }); }

  /* ---------- documents ---------- */
  brandTheme() { const b = this.state.brand, P = this.P; return { ...P.makeTheme({ id: 'brand', name: 'Brand kit', bg: b.bg, ink: b.ink, accent: b.accent, accent2: b.accent2, surface: P.mix(b.bg, 'var(--pw-surface)', .6) }), display: b.heading, body: b.body, pairId: null }; }
  brandPair() { const b = this.state.brand; return { display: b.heading, body: b.body, dw: this.ONEW.includes(b.heading) ? 400 : 700, upper: false, track: -.01, id: null }; }
  /** Restyle a built document in the active brand's colours and fonts. In place. */
  brandify(doc) { this.applyThemeTo(doc, this.brandTheme()); this.applyPairingTo(doc, this.brandPair()); return doc; }
  /** What a blank design starts from: the brand when one is in use, else a neutral default. */
  defaultTheme() { if (this.state.brandOn) return this.brandTheme(); const P = this.P, pr = P.PAIRING.editorial; return { ...P.makeTheme(P.PALETTE.paper), display: pr.display, body: pr.body, pairId: pr.id }; }
  newDoc(fmtId, w, h) {
    this.note('format', fmtId, 1);
    const f = this.P.FORMAT[fmtId]; const W = f ? f.w : Math.max(16, Math.min(8000, w | 0)), H = f ? f.h : Math.max(16, Math.min(8000, h | 0));
    this.fileHandle = null;
    this.openDoc({ name: 'Untitled ' + (f ? f.name : 'design'), w: W, h: H, fmt: f ? f.id : 'custom', theme: this.defaultTheme(), created: new Date().toISOString(), pages: [{ id: this.P.nid(), bg: 'var(--pw-surface)', els: [] }] }, {});
  }
  openDoc(doc, assets) {
    this.hist = []; this.fut = []; this.dirty = false; if (!doc.id) doc.id = this.B.bid('d');
    const brandIds = new Set(Object.keys(this.state.brand.assets || {}));
    this.setState(s => ({ screen: 'editor', doc, assets: { ...s.assets, ...assets }, uploads: [...new Set([...s.uploads, ...Object.keys(assets).filter(id => !brandIds.has(id))])], sel: [], page: 0, editingId: null, cropMode: false, menu: null, phoneMenu: null, propsOpen: false, tplSame: true, tplLimit: 24 }), () => { setTimeout(() => this.fitZoom(), 40); this.ensureAlpha(assets); this.scheduleAutosave(); });
  }
  goHome = () => { this.flushAutosave().then(() => this.loadRecents()); this.setState({ screen: 'home', sel: [], editingId: null, menu: null, phoneMenu: null, propsOpen: false, wiz: null }); };
  // Assets restored from an autosave written before alpha detection existed.
  ensureAlpha(assets) { Object.entries(assets).forEach(([id, a]) => { if (!a || a.alpha !== undefined || !a.src) return; this.IO.hasAlpha(a.src).then(v => this.setState(s => s.assets[id] ? { assets: { ...s.assets, [id]: { ...s.assets[id], alpha: v } } } : null)); }); }
  fromTemplate(desc) {
    this.note('topic', desc.topic, 1.5); this.note('format', desc.fmt, 1); const b = this.P.build(desc); if (this.state.brandOn) this.brandify(b); b.created = new Date().toISOString(); this.fileHandle = null; this.openDoc(b, {}); }
  // Text the user wrote survives the swap: whatever differs from the design's own
  // template goes into the slot with the same role in the new one (title → title,
  // sub → sub …), so "My Shop Sale" stays "My Shop Sale" in every layout.
  editedText() { const P = this.P, d = this.state.doc, desc = P.descFor(d); if (!desc) return {}; try { return P.editedText(P.build(desc), d); } catch (e) { return {}; } }
  async applyTemplate(desc) {
    const edits = this.editedText(); const n = Object.keys(edits).length;
    if (this.dirty && !(await this.ask({ title: 'Switch template?', body: 'You have made changes to this design. The new template replaces its pages' + (n ? `, keeping the text you wrote (${n} field${n > 1 ? 's' : ''}).` : '.') + ' You can undo afterwards.', confirmLabel: 'Switch', cancelLabel: 'Keep my edits', danger: true }))) return;
    const b = this.P.build(desc); if (this.state.brandOn) this.brandify(b); const kept = this.P.carryText(b, edits); this.pushHist();
    this.setState(s => ({ doc: { ...s.doc, w: b.w, h: b.h, fmt: b.fmt, tpl: b.tpl, theme: b.theme, pages: b.pages, name: s.doc.name.startsWith('Untitled') ? b.name : s.doc.name }, sel: [], page: 0, editingId: null }), () => { this.dirty = false; setTimeout(() => this.fitZoom(), 30); if (n && kept.length < n) this.toast(`Kept ${kept.length} of ${n} edited texts — this layout has fewer slots`); });
  }
  fitZoom = () => { const n = this.canvasEl, d = this.state.doc; if (!n || !d) return; const ph = this.layout === 'phone'; const z = Math.min((n.clientWidth - (ph ? 32 : 100)) / d.w, (n.clientHeight - (ph ? 70 : 110)) / d.h, 3); this.setState({ zoom: Math.max(.04, Math.floor(z * 100) / 100) }); };
  setZoom(z) { this.setState({ zoom: Math.max(.04, Math.min(4, Math.round(z * 100) / 100)) }); }
  async resizeDoc(fid) {
    const f = this.P.FORMAT[fid]; if (!f) return; const d = this.state.doc; this.setState({ menu: null });
    if (this.state.relayout && d.tpl) {
      const [, layout, topic, j] = d.tpl.split('~'); const L = this.P.LAYOUT[layout]; const cls = (ar => ar >= 2.2 ? 'banner' : ar > 1.25 ? 'wide' : ar >= .8 ? 'square' : 'tall')(f.w / f.h);
      if (L && L.kinds.includes(f.kind) && L.cls.includes(f.kind === 'c' ? 'wide' : cls)) {
        if (this.dirty && !(await this.ask({ title: 'Re-layout and replace your edits?', body: 'Resizing rebuilds the page from its template, so the changes you made here are replaced. Turn off “Re-layout from template” to scale the design instead.', confirmLabel: 'Re-layout', cancelLabel: 'Keep my edits', danger: true }))) return;
        const edits = this.editedText();
        const b = this.P.build({ id: `${f.id}~${layout}~${topic}~${j}`, fmt: f.id, layout, topic, pal: d.theme.id in this.P.PALETTE ? d.theme.id : 'paper', pair: d.theme.pairId || 'editorial' });
        this.P.carryText(b, edits); this.applyThemeTo(b, d.theme); this.pushHist();
        this.setState(s => ({ doc: { ...s.doc, w: b.w, h: b.h, fmt: f.id, tpl: b.tpl, pages: b.pages }, sel: [], page: 0 }), () => { this.dirty = false; setTimeout(this.fitZoom, 30); }); return;
      }
      this.toast('This layout doesn’t fit that size — scaled instead');
    }
    const sx = f.w / d.w, sy = f.h / d.h, s = Math.min(sx, sy);
    this.setDoc(doc => {
      doc.pages.forEach(p => p.els.forEach(e => {
        const fw = e.x <= 1 && e.x + e.w >= d.w - 1, fh = e.y <= 1 && e.y + e.h >= d.h - 1;
        const cx = (e.x + e.w / 2) * sx, cy = (e.y + e.h / 2) * sy; let w = e.w * s, h = e.h * s;
        if (fw) w = e.w * sx; if (fh) h = e.h * sy;
        if (e.type === 'text') e.size = Math.round(e.size * s * 10) / 10;
        if (e.sw) e.sw *= s; if (e.borderW) e.borderW *= s;
        e.w = Math.round(w); e.h = Math.round(h); e.x = Math.round(fw ? e.x * sx : cx - w / 2); e.y = Math.round(fh ? e.y * sy : cy - h / 2);
      }));
      doc.w = f.w; doc.h = f.h; doc.fmt = f.id;
    });
    setTimeout(this.fitZoom, 40);
  }

  /* ---------- theme ---------- */
  applyThemeTo(doc, nt) {
    const old = doc.theme, map = {};
    this.P.THEME_KEYS.forEach(k => { if (old[k] && nt[k]) { const key = String(old[k]).toUpperCase(); if (!(key in map)) map[key] = nt[k]; } });
    const sw = c => (c && map[String(c).toUpperCase()]) || c;
    doc.pages.forEach(p => { p.bg = sw(p.bg); p.els.forEach(e => { ['color', 'fill', 'stroke', 'bg', 'outline', 'fg', 'qbg', 'ink', 'tint', 'hole', 'border'].forEach(k => { if (e[k]) e[k] = sw(e[k]); }); if (e.colors) e.colors = e.colors.map(sw); }); });
    doc.theme = { ...nt, display: old.display, body: old.body, pairId: old.pairId };
  }
  applyPalette(pal) { const t = this.P.makeTheme(pal); this.setDoc(d => this.applyThemeTo(d, t)); }
  applyPairingTo(d, pair) {
    const old = d.theme, u = Math.min(d.w, d.h) / 100; const oldP = this.P.PAIRING[old.pairId];
    d.pages.forEach(p => p.els.forEach(e => {
      if (e.type === 'chart') e.font = pair.body;
      if (e.type !== 'text') return;
      const isD = e.font === old.display && (old.display !== old.body || e.size >= u * 6);
      if (isD) { e.font = pair.display; e.weight = pair.dw || 700; if (!oldP || e.upper === oldP.upper) e.upper = !!pair.upper; e.ls = pair.track ?? 0; if (pair.lh && e.lh < 1.2) e.lh = pair.lh; }
      else if (e.font === old.body) { e.font = pair.body; if (this.ONEW.includes(pair.body)) e.weight = 400; }
    }));
    d.theme = { ...d.theme, display: pair.display, body: pair.body, pairId: pair.id || null };
  }
  applyPairing(pair) { this.setDoc(d => this.applyPairingTo(d, pair)); }
  applyBrand = () => {
    this.setDoc(d => this.brandify(d));
    this.toast('Brand applied');
  };
  shuffleStyle = () => { const P = this.P; const pal = P.PALETTES[Math.floor(Math.random() * P.PALETTES.length)], pair = P.PAIRINGS[Math.floor(Math.random() * P.PAIRINGS.length)]; this.applyPalette(pal); setTimeout(() => this.applyPairing(pair), 0); };

  /* ---------- elements ---------- */
  u() { const d = this.state.doc; return Math.min(d.w, d.h) / 100; }
  addEls(els) { this.setDoc((d, p) => p.els.push(...els)); this.setState({ sel: els.map(e => e.id), editingId: null }); }
  mk(type, w, h, extra) { const d = this.state.doc; return { id: this.P.nid(), type, name: extra.name || type[0].toUpperCase() + type.slice(1), x: Math.round((d.w - w) / 2), y: Math.round((d.h - h) / 2), w: Math.round(w), h: Math.round(h), rot: 0, opacity: 1, ...extra }; }
  addText(kind) {
    const d = this.state.doc, t = d.theme, u = this.u(); const pair = this.P.PAIRING[t.pairId];
    const cfg = { heading: [u * 9, t.display, pair ? pair.dw : (this.ONEW.includes(t.display) ? 400 : 700), 'Add a heading', 1.05], sub: [u * 5, t.body, this.ONEW.includes(t.body) ? 400 : 700, 'Add a subheading', 1.2], body: [u * 3.2, t.body, 400, 'Add a little bit of body text', 1.4] }[kind];
    this.addEls([this.mk('text', d.w * .7, cfg[0] * cfg[4], { name: kind === 'heading' ? 'Heading' : kind === 'sub' ? 'Subheading' : 'Body', text: cfg[3], font: cfg[1], size: Math.round(cfg[0]), weight: cfg[2], italic: false, color: t.ink, align: 'center', lh: cfg[4], ls: 0, upper: false, bg: null, outline: null })]);
  }
  addCombo(pair) {
    const d = this.state.doc, t = d.theme, u = this.u(), g = this.P.nid(); const w = d.w * .7;
    const a = this.mk('text', w, u * 10, { name: 'Heading', text: 'Make it memorable', font: pair.display, size: Math.round(u * 9), weight: pair.dw, italic: false, color: t.ink, align: 'center', lh: pair.lh, ls: pair.track, upper: pair.upper, bg: null, outline: null, groupId: g });
    const b = this.mk('text', w * .8, u * 5, { name: 'Body', text: 'A short line of supporting text goes right here.', font: pair.body, size: Math.round(u * 3.2), weight: 400, italic: false, color: t.muted || t.ink, align: 'center', lh: 1.4, ls: 0, upper: false, bg: null, outline: null, groupId: g });
    a.y -= u * 4; b.y = a.y + a.h + u * 3; this.addEls([a, b]);
  }
  addShape(shape, extra = {}) {
    const d = this.state.doc, t = d.theme, s = Math.min(d.w, d.h) * .3, [name, ar] = this.R.SHAPE_INFO[shape] || [shape, 1];
    this.addEls([this.mk('shape', ar >= 1 ? s : s * ar, ar >= 1 ? s / ar : s, { name, shape, fill: t.accent, stroke: null, sw: 0, radius: 0, points: shape === 'burst' ? 16 : shape === 'gear' ? 8 : 5, inner: shape === 'burst' ? .82 : shape === 'ring' ? .62 : .5, sides: 6, dash: false, ...extra })]);
  }
  addLine(o) { const d = this.state.doc, u = this.u(), sw = Math.max(2, Math.round(u * .45)); this.addEls([this.mk('line', d.w * .4, Math.max(sw * 3, 8), { name: o.arrow ? 'Arrow' : 'Line', stroke: d.theme.ink, sw, dash: !!o.dash, arrow: !!o.arrow })]); }
  addFrame(mask) { const d = this.state.doc, s = Math.min(d.w, d.h) * .42; this.addEls([this.mk('image', s, mask === 'arch' ? s * 1.3 : s, { name: 'Frame', asset: null, label: 'Drop image', tint: d.theme.tint || '#DDD', mask, radius: 0, cx: 50, cy: 50, zoom: 1, flip: false, filters: { ...this.P.NOFILTER }, border: null, borderW: 0 })]); }
  addImageAsset(id, at) {
    const d = this.state.doc, a = this.state.assets[id]; if (!a) return; const r = (a.w || 1) / (a.h || 1);
    let w = d.w * .6, h = w / r; if (h > d.h * .6) { h = d.h * .6; w = h * r; }
    const el = this.mk('image', w, h, { name: a.name || 'Image', asset: id, label: '', tint: '#DDD', mask: 'none', radius: 0, cx: 50, cy: 50, zoom: 1, flip: false, filters: { ...this.P.NOFILTER }, border: null, borderW: 0 });
    if (at) { el.x = Math.round(at.x - el.w / 2); el.y = Math.round(at.y - el.h / 2); }
    this.addEls([el]);
  }
  addChart(type) { const d = this.state.doc, t = d.theme; this.addEls([this.mk('chart', d.w * .6, d.h * .4, { name: 'Chart', chart: type, data: [{ l: 'Q1', v: 12 }, { l: 'Q2', v: 19 }, { l: 'Q3', v: 27 }, { l: 'Q4', v: 34 }], colors: [t.accent, t.accent2, t.ink, t.muted || '#999'], ink: t.ink, font: t.body, labels: true, hole: this.pg.bg })]); }
  addQR = () => { const d = this.state.doc, s = Math.min(d.w, d.h) * .3; this.addEls([this.mk('qr', s, s, { name: 'QR code', value: 'https://example.com', fg: d.theme.ink, qbg: '#FFFFFF' })]); };
  dup() { const els = this.reId(this.selEls()).map(e => ({ ...e, x: e.x + 20, y: e.y + 20, locked: false })); if (els.length) this.addEls(els); }
  del() { const ids = this.selEls().filter(e => !e.locked).map(e => e.id); if (!ids.length) return; this.setDoc((d, p) => { p.els = p.els.filter(e => !ids.includes(e.id)); }); this.setState({ sel: [], cropMode: false }); }
  copy() { this.clip = structuredClone(this.selEls()); if (this.clip.length) this.toast(`Copied ${this.clip.length} element${this.clip.length > 1 ? 's' : ''}`); }
  paste() { if (!this.clip || !this.clip.length) return; this.addEls(this.reId(this.clip).map(e => ({ ...e, x: e.x + 24, y: e.y + 24 }))); }
  group() { const ids = this.state.sel; if (ids.length < 2) return; const g = this.P.nid(); this.patchSel(e => { e.groupId = g; }); this.toast('Grouped'); }
  ungroup() { this.patchSel(e => { delete e.groupId; }); this.toast('Ungrouped'); }
  arrange(kind) {
    const ids = this.state.sel;
    this.setDoc((d, p) => {
      const sel = p.els.filter(e => ids.includes(e.id)), rest = p.els.filter(e => !ids.includes(e.id));
      if (kind === 'front') p.els = [...rest, ...sel]; else if (kind === 'back') p.els = [...sel, ...rest];
      else { const arr = p.els; const idxs = arr.map((e, i) => ids.includes(e.id) ? i : -1).filter(i => i >= 0); const dir = kind === 'forward' ? 1 : -1; (dir > 0 ? idxs.reverse() : idxs).forEach(i => { const j = i + dir; if (j >= 0 && j < arr.length && !ids.includes(arr[j].id)) [arr[i], arr[j]] = [arr[j], arr[i]]; }); }
    });
  }
  /* ---------- layers panel: drag to reorder ---------- */
  // The panel lists the front-most element first, so dropping "above" a row in the
  // list means placing the moved elements after it in z-order.
  layerDragStart = (e, id) => { e.dataTransfer.setData('text/pw-layer', id); e.dataTransfer.effectAllowed = 'move'; this._layerDrag = id; const sel = this.state.sel.includes(id) ? this.state.sel : [id]; this.setState({ layerDrag: id, sel, editingId: null }); };
  layerDragOver = (e, id) => { if (!this._layerDrag) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const r = e.currentTarget.getBoundingClientRect(); const above = e.clientY < r.top + r.height / 2; const o = this.state.layerOver; if (!o || o.id !== id || o.above !== above) this.setState({ layerOver: { id, above } }); };
  layerDrop = (e, id) => { e.preventDefault(); const src = this._layerDrag; if (!src) return; const ids = this.state.sel.includes(src) ? this.state.sel : [src]; const o = this.state.layerOver; this.moveLayers(ids, id, o && o.id === id ? o.above : true); this.layerDragEnd(); };
  layerDragEnd = () => { this._layerDrag = null; if (this.state.layerDrag || this.state.layerOver) this.setState({ layerDrag: null, layerOver: null }); };
  moveLayers(ids, targetId, above) {
    if (ids.includes(targetId)) return;
    this.setDoc((d, p) => { const moving = p.els.filter(e => ids.includes(e.id)), rest = p.els.filter(e => !ids.includes(e.id)); const ti = rest.findIndex(e => e.id === targetId); if (!moving.length || ti < 0) return; rest.splice(above ? ti + 1 : ti, 0, ...moving); p.els = rest; });
  }
  bbox(els) { const x = Math.min(...els.map(e => e.x)), y = Math.min(...els.map(e => e.y)); return { x, y, w: Math.max(...els.map(e => e.x + e.w)) - x, h: Math.max(...els.map(e => e.y + e.h)) - y }; }
  align(kind) {
    const els = this.selEls(), d = this.state.doc; const R = els.length > 1 ? this.bbox(els) : { x: 0, y: 0, w: d.w, h: d.h };
    this.patchSel(e => { if (kind === 'left') e.x = R.x; if (kind === 'center') e.x = Math.round(R.x + R.w / 2 - e.w / 2); if (kind === 'right') e.x = R.x + R.w - e.w; if (kind === 'top') e.y = R.y; if (kind === 'middle') e.y = Math.round(R.y + R.h / 2 - e.h / 2); if (kind === 'bottom') e.y = R.y + R.h - e.h; });
  }
  addPage(after) { const i = after ?? this.state.page; this.setDoc(d => { d.pages.splice(i + 1, 0, { id: this.P.nid(), bg: d.pages[i] ? d.pages[i].bg : '#FFFFFF', els: [] }); }); this.setState({ page: i + 1, sel: [] }); }
  dupPage(i) { this.setDoc(d => { const p = d.pages[i]; d.pages.splice(i + 1, 0, { ...structuredClone(p), id: this.P.nid(), els: this.reId(p.els) }); }); this.setState({ page: i + 1, sel: [] }); }
  delPage(i) { if (this.state.doc.pages.length < 2) return this.toast('A design needs at least one page'); this.setDoc(d => { d.pages.splice(i, 1); }); this.setState(s => ({ page: Math.max(0, Math.min(s.page, s.doc.pages.length - 2)), sel: [] })); }
  movePage(i, dir) { const j = i + dir; if (j < 0 || j >= this.state.doc.pages.length) return; this.setDoc(d => { [d.pages[i], d.pages[j]] = [d.pages[j], d.pages[i]]; }); this.setState({ page: j }); }

  /* ---------- pointer ---------- */
  toPage(e, pid) { const n = document.querySelector(`[data-page-node="${pid}"]`); const r = n.getBoundingClientRect(); const z = this.state.zoom; return { x: (e.clientX - r.left) / z, y: (e.clientY - r.top) / z }; }
  // Gestures follow one pointer: a second finger (a pinch) must not steer a drag.
  drag(move, up, e) {
    const pid = e ? e.pointerId : null; const mm = ev => { if (pid == null || ev.pointerId === pid) move(ev); };
    const uu = ev => { if (pid != null && ev.pointerId !== pid) return; window.removeEventListener('pointermove', mm); window.removeEventListener('pointerup', uu); window.removeEventListener('pointercancel', uu); up && up(ev); };
    window.addEventListener('pointermove', mm); window.addEventListener('pointerup', uu); window.addEventListener('pointercancel', uu);
  }
  // Pinch to zoom on touch screens. The canvas container sees every pointer first;
  // with two down, their distance drives the zoom and any element drag is left alone.
  onCanvasPointerDownCapture = e => {
    if (e.pointerType !== 'touch') return;
    this._pts ||= new Map(); this._pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this._pts.size === 2) {
      const [a, b] = [...this._pts.values()]; this._pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y), z0: this.state.zoom }; this._dragging = true;
      if (!this._pinchMove) {
        this._pinchMove = ev => { const p = this._pts.get(ev.pointerId); if (!p || !this._pinch) return; p.x = ev.clientX; p.y = ev.clientY; if (this._pts.size < 2) return; const [m, n] = [...this._pts.values()]; const d = Math.hypot(m.x - n.x, m.y - n.y); cancelAnimationFrame(this._pz); this._pz = requestAnimationFrame(() => this.setZoom(this._pinch.z0 * d / this._pinch.d0)); };
        this._pinchUp = ev => { this._pts.delete(ev.pointerId); if (this._pts.size < 2) { this._pinch = null; this._dragging = false; } if (!this._pts.size) { window.removeEventListener('pointermove', this._pinchMove); window.removeEventListener('pointerup', this._pinchUp); window.removeEventListener('pointercancel', this._pinchUp); this._pinchOn = false; } };
      }
      if (!this._pinchOn) { this._pinchOn = true; window.addEventListener('pointermove', this._pinchMove); window.addEventListener('pointerup', this._pinchUp); window.addEventListener('pointercancel', this._pinchUp); }
    }
    const rm = ev => { if (ev.pointerId !== e.pointerId) return; window.removeEventListener('pointerup', rm); window.removeEventListener('pointercancel', rm); if (!this._pinchOn) this._pts.delete(e.pointerId); };
    window.addEventListener('pointerup', rm); window.addEventListener('pointercancel', rm);
  };
  pageIdxOf(id) { return this.state.doc.pages.findIndex(p => p.els.some(e => e.id === id)); }
  onElDown = (e, el) => {
    if (e.button !== 0) return; e.stopPropagation();
    if (this.state.editingId === el.id) return;
    if (this._pinch) return;
    // Touch screens do not send dblclick reliably: a second tap on the same element
    // within 350 ms edits it (text), toggles crop (image) or picks a file (frame).
    if (e.pointerType === 'touch') { const now = Date.now(); if (this._tapId === el.id && now - this._tapT < 350) { this._tapT = 0; this.onElDbl(e, el); return; } this._tapId = el.id; this._tapT = now; }
    const pi = this.pageIdxOf(el.id); const page = this.state.doc.pages[pi];
    const grp = el.groupId ? page.els.filter(x => x.groupId === el.groupId).map(x => x.id) : [el.id];
    let sel = pi === this.state.page ? this.state.sel : [];
    if (e.shiftKey) { sel = sel.includes(el.id) ? sel.filter(id => !grp.includes(id)) : [...sel, ...grp]; this.setState({ sel, page: pi, editingId: null }); return; }
    if (!sel.includes(el.id)) sel = grp;
    this.setState({ sel, page: pi, editingId: null, cropMode: this.state.cropMode && sel.length === 1 && sel[0] === el.id });
    if (el.locked) return;
    if (this.state.cropMode && sel.length === 1 && sel[0] === el.id && el.type === 'image') return this.startCropPan(e, el);
    this.startMove(e, sel, pi);
  };
  onElDbl = (e, el) => { e.stopPropagation(); if (el.locked) return; if (el.type === 'text') this.setState({ editingId: el.id, sel: [el.id] }); else if (el.type === 'image' && el.asset) this.setState(s => ({ cropMode: !s.cropMode, sel: [el.id] })); else if (el.type === 'image') { this.replaceTarget = el.id; this.imgInput && this.imgInput.click(); } };
  onTextInput = (id, text) => { this._edit = { id, text }; };
  // Idempotent: blur and the end-of-edit check can both report the same text.
  onTextCommit = (id, text) => {
    if (this._edit && this._edit.id === id) this._edit = null;
    this.setState(s => s.editingId === id ? { editingId: null } : null);
    const d = this.state.doc; let el = null; d && d.pages.forEach(p => p.els.forEach(x => { if (x.id === id) el = x; }));
    if (!el || el.text === text) return;
    this.setDoc(dd => dd.pages.forEach(p => p.els.forEach(x => { if (x.id === id) x.text = text; })));
  };
  // Leaving an element clears the hover after a beat, so the pointer can cross
  // onto the "Replace image" pill (drawn in the overlay, outside the frame's DOM)
  // without the pill vanishing underneath it. Entering anything cancels the clear.
  onHover = id => {
    if (this._dragging) return; clearTimeout(this._hoverT);
    if (id) { if (this.state.hoverId !== id) this.setState({ hoverId: id }); }
    else this._hoverT = setTimeout(() => { if (this.state.hoverId) this.setState({ hoverId: null }); }, 160);
  };
  startMove(e, sel, pi) {
    const d = this.state.doc, pg = d.pages[pi], z = this.state.zoom, sx = e.clientX, sy = e.clientY;
    const start = pg.els.filter(x => sel.includes(x.id)).map(x => ({ id: x.id, x: x.x, y: x.y }));
    const bb0 = this.bbox(pg.els.filter(x => sel.includes(x.id)));
    const others = pg.els.filter(x => !sel.includes(x.id) && !x.hidden);
    const vx = [0, d.w / 2, d.w, ...others.flatMap(o => [o.x, o.x + o.w / 2, o.x + o.w])], vy = [0, d.h / 2, d.h, ...others.flatMap(o => [o.y, o.y + o.h / 2, o.y + o.h])];
    const snapOn = this.props.snapping ?? true, thrPx = this.props.snapThreshold ?? 6;
    let moved = false;
    this.drag(ev => {
      if (this._pinch) return;
      let dx = (ev.clientX - sx) / z, dy = (ev.clientY - sy) / z;
      if (!moved && Math.hypot(dx, dy) * z < 3) return;
      if (!moved) { moved = true; this._dragging = true; this.pushHist(); }
      const guides = [];
      if (snapOn && !ev.altKey) {
        const thr = thrPx / z;
        const best = (cands, lines) => { let b = null; cands.forEach(c => lines.forEach(v => { const dd = v - c; if (Math.abs(dd) < thr && (!b || Math.abs(dd) < Math.abs(b.d))) b = { d: dd, v }; })); return b; };
        const bx = best([bb0.x + dx, bb0.x + dx + bb0.w / 2, bb0.x + dx + bb0.w], vx); if (bx) { dx += bx.d; guides.push({ x: bx.v }); }
        const by = best([bb0.y + dy, bb0.y + dy + bb0.h / 2, bb0.y + dy + bb0.h], vy); if (by) { dy += by.d; guides.push({ y: by.v }); }
      }
      this.setState(s => { const doc = structuredClone(s.doc); const p = doc.pages[pi]; start.forEach(st => { const el = p.els.find(x => x.id === st.id); if (el) { el.x = Math.round(st.x + dx); el.y = Math.round(st.y + dy); } }); return { doc, guides, dragInfo: `${Math.round(bb0.x + dx)}, ${Math.round(bb0.y + dy)}` }; });
    }, () => { this._dragging = false; this.setState({ guides: [], dragInfo: null }); }, e);
  }
  startCropPan(e, el) {
    const sx = e.clientX, sy = e.clientY, z = this.state.zoom, c0 = { cx: el.cx ?? 50, cy: el.cy ?? 50 }; this.pushHist();
    this.drag(ev => { const dx = (ev.clientX - sx) / z, dy = (ev.clientY - sy) / z; const k = 100 / Math.max(40, Math.min(el.w, el.h)) / (el.zoom || 1); this.setDoc((d, p) => { const x = p.els.find(q => q.id === el.id); x.cx = Math.max(0, Math.min(100, c0.cx - dx * k)); x.cy = Math.max(0, Math.min(100, c0.cy - dy * k)); }, false); }, null, e);
  }
  startResize(e, dir) {
    e.stopPropagation(); e.preventDefault();
    const { doc, page, zoom: z } = this.state; const els = this.selEls(); if (!els.length) return;
    this.pushHist(); this._dragging = true; const sx = e.clientX, sy = e.clientY;
    const hasE = dir.includes('e'), hasW = dir.includes('w'), hasN = dir.includes('n'), hasS = dir.includes('s'), corner = (hasE || hasW) && (hasN || hasS);
    if (els.length === 1) {
      const e0 = structuredClone(els[0]); const a = (e0.rot || 0) * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
      const ocx = e0.x + e0.w / 2, ocy = e0.y + e0.h / 2;
      this.drag(ev => {
        const gx = (ev.clientX - sx) / z, gy = (ev.clientY - sy) / z; const lx = gx * cos + gy * sin, ly = -gx * sin + gy * cos;
        let nw = e0.w + (hasE ? lx : 0) - (hasW ? lx : 0), nh = e0.h + (hasS ? ly : 0) - (hasN ? ly : 0);
        const ratioTypes = ['image', 'text', 'qr', 'chart'];
        const keep = e0.type === 'qr' || (corner && (ratioTypes.includes(e0.type) ? !ev.shiftKey : ev.shiftKey));
        if (e0.type === 'line') nh = e0.h;
        if (keep) { const r = e0.w / e0.h; if (!corner) { if (hasE || hasW) nh = nw / r; else nw = nh * r; } else if (Math.abs(nw / e0.w) > Math.abs(nh / e0.h)) nh = nw / r; else nw = nh * r; }
        nw = Math.max(8, nw); nh = Math.max(e0.type === 'line' ? e0.h : 8, nh);
        const dcx = hasE ? (nw - e0.w) / 2 : hasW ? -(nw - e0.w) / 2 : 0, dcy = hasS ? (nh - e0.h) / 2 : hasN ? -(nh - e0.h) / 2 : 0;
        const ncx = ocx + dcx * cos - dcy * sin, ncy = ocy + dcx * sin + dcy * cos;
        this.setState(s => { const d = structuredClone(s.doc); const x = d.pages[page].els.find(q => q.id === e0.id);
          if (e0.type === 'text') { if (corner) x.size = Math.max(4, Math.round(e0.size * nw / e0.w * 10) / 10); x.w = Math.round(nw); }
          else { x.w = Math.round(nw); x.h = Math.round(nh); }
          x.x = Math.round(ncx - x.w / 2); x.y = Math.round((e0.type === 'text' ? ncy - (corner ? nh : e0.h) / 2 : ncy - x.h / 2));
          return { doc: d, dragInfo: `${x.w} × ${Math.round(e0.type === 'text' ? (corner ? nh : e0.h) : x.h)}` }; });
      }, () => { this._dragging = false; this.setState({ dragInfo: null }); }, e);
    } else {
      const B = this.bbox(els), starts = structuredClone(els);
      this.drag(ev => {
        const gx = (ev.clientX - sx) / z, gy = (ev.clientY - sy) / z;
        let nw = B.w + (hasE ? gx : 0) - (hasW ? gx : 0), nh = B.h + (hasS ? gy : 0) - (hasN ? gy : 0);
        let kx = Math.max(.05, nw / B.w), ky = Math.max(.05, nh / B.h); if (corner || true) { const k = corner ? Math.max(kx, ky) : (hasE || hasW ? kx : ky); kx = ky = k; }
        const ax = hasW ? B.x + B.w : B.x, ay = hasN ? B.y + B.h : B.y;
        this.setState(s => { const d = structuredClone(s.doc); starts.forEach(st => { const x = d.pages[page].els.find(q => q.id === st.id); x.x = Math.round(ax + (st.x - ax) * kx); x.y = Math.round(ay + (st.y - ay) * ky); x.w = Math.round(st.w * kx); x.h = Math.round(st.h * ky); if (x.type === 'text') x.size = Math.round(st.size * kx * 10) / 10; if (x.sw) x.sw = st.sw * kx; }); return { doc: d }; });
      }, () => { this._dragging = false; }, e);
    }
  }
  startRotate = e => {
    e.stopPropagation(); e.preventDefault(); const el = this.selEls()[0]; if (!el) return;
    const n = document.querySelector(`[data-page-node="${this.pg.id}"]`).getBoundingClientRect(), z = this.state.zoom;
    const cx = n.left + (el.x + el.w / 2) * z, cy = n.top + (el.y + el.h / 2) * z; this.pushHist(); this._dragging = true;
    // Rotation is relative to where the drag began: the handle hangs below the
    // element, so an absolute angle would read 180° before the pointer had moved.
    const ang = ev => Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
    const a0 = ang(e), r0 = el.rot || 0;
    this.drag(ev => { let a = r0 + ang(ev) - a0; if (ev.shiftKey) a = Math.round(a / 15) * 15; else { const r = Math.round(a / 45) * 45; if (Math.abs(a - r) < 3) a = r; } a = ((Math.round(a) % 360) + 540) % 360 - 180; this.setDoc((d, p) => { p.els.find(q => q.id === el.id).rot = a; }, false); this.setState({ dragInfo: a + '°' }); }, () => { this._dragging = false; this.setState({ dragInfo: null }); }, e);
  };
  onPageDown(e, i) {
    if (e.button !== 0) return; e.stopPropagation();
    const pid = this.state.doc.pages[i].id; const shift = e.shiftKey; const base = shift && i === this.state.page ? this.state.sel : [];
    this.setState({ page: i, sel: base, editingId: null, cropMode: false });
    // A finger on the page background pans the canvas; a mouse draws a marquee.
    if (e.pointerType === 'touch') { const c = this.canvasEl; if (!c) return; const sx = e.clientX, sy = e.clientY, sl = c.scrollLeft, st = c.scrollTop; this.drag(ev => { if (this._pinch) return; c.scrollLeft = sl - (ev.clientX - sx); c.scrollTop = st - (ev.clientY - sy); }, null, e); return; }
    const p0 = this.toPage(e, pid);
    this.drag(ev => { const p = this.toPage(ev, pid); this.setState({ marquee: { pi: i, x: Math.min(p0.x, p.x), y: Math.min(p0.y, p.y), w: Math.abs(p.x - p0.x), h: Math.abs(p.y - p0.y) } }); }, () => {
      const m = this.state.marquee; if (m && m.w > 3 && m.h > 3) { const els = this.state.doc.pages[i].els.filter(el => !el.locked && !el.hidden && el.x < m.x + m.w && el.x + el.w > m.x && el.y < m.y + m.h && el.y + el.h > m.y); this.setState({ sel: [...new Set([...base, ...els.map(x => x.id)])] }); }
      this.setState({ marquee: null });
    }, e);
  }
  onCanvasDown = e => { if (e.target === e.currentTarget || e.target.parentElement === e.currentTarget) this.setState({ sel: [], editingId: null, cropMode: false }); };
  onCanvasDragOver = e => { e.preventDefault(); };
  onCanvasDrop = async e => {
    e.preventDefault(); const d = this.state.doc; if (!d) return;
    let pi = this.state.page, pt = null;
    d.pages.forEach((p, i) => { const n = document.querySelector(`[data-page-node="${p.id}"]`); if (!n) return; const r = n.getBoundingClientRect(); if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { pi = i; pt = this.toPage(e, p.id); } });
    let id = e.dataTransfer.getData('text/pw-asset');
    if (!id) { const f = [...(e.dataTransfer.files || [])].find(f => f.type.startsWith('image/')); if (!f) return; id = await this.ingest(f); }
    this.setState({ page: pi }, () => this.placeAsset(id, pt));
  };
  placeAsset(id, pt) {
    const pg = this.pg; const hit = pt && [...pg.els].reverse().find(el => el.type === 'image' && !el.locked && pt.x >= el.x && pt.x <= el.x + el.w && pt.y >= el.y && pt.y <= el.y + el.h);
    if (hit) { this.setDoc((d, p) => { const x = p.els.find(q => q.id === hit.id); x.asset = id; x.cx = 50; x.cy = 50; x.zoom = 1; delete x.origAsset; }); this.setState({ sel: [hit.id] }); }
    else this.addImageAsset(id, pt);
  }
  async ingest(file) { const r = await this.IO.readImageFile(file); const id = 'a' + this.P.nid(); this.setState(s => ({ assets: { ...s.assets, [id]: r }, uploads: [id, ...s.uploads] })); await new Promise(res => setTimeout(res, 0)); return id; }
  onImageFile = async e => {
    const files = [...e.target.files]; e.target.value = ''; if (!files.length) return;
    this.setState({ busy: 'Importing images…' });
    try { for (const f of files) { const id = await this.ingest(f); if (this.replaceTarget) { const t = this.replaceTarget; this.replaceTarget = null; this.setDoc(d => d.pages.forEach(p => p.els.forEach(x => { if (x.id === t) { x.asset = id; x.cx = 50; x.cy = 50; x.zoom = 1; delete x.origAsset; } }))); } else if (this.state.screen === 'editor') this.addImageAsset(id); } }
    catch (err) { this.toast('Could not read that image'); }
    this.setState({ busy: null });
  };
  onPaste(e) { if (this.state.screen !== 'editor' || this.state.editingId) return; const t = e.target; if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return; const f = [...(e.clipboardData && e.clipboardData.files || [])].find(f => f.type.startsWith('image/')); if (f) { e.preventDefault(); this._pastedImage = Date.now(); this.ingest(f).then(id => this.addImageAsset(id)); } }
  onLogoFile = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const r = await this.IO.readImageFile(f); const id = 'a' + this.P.nid();
      if (this._logoFor === 'wiz') return this.wizLogo(id, r);
      this.setState(s => ({ assets: { ...s.assets, [id]: r } })); this.setBrand({ assets: { ...this.state.brand.assets, [id]: r }, logo: id });
    } catch (err) { this.toast('Could not read that image'); }
  };
  uploadLogo = () => { this._logoFor = null; this.logoInput && this.logoInput.click(); };
  addLogo = () => { const id = this.state.brand.logo; if (id && this.state.doc) this.addImageAsset(id); };

  onKey(e) {
    if (this.state.screen !== 'editor' || !this.state.doc) return; const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase(), sel = this.state.sel;
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); return; }
    if (mod && k === 'y') { e.preventDefault(); this.redo(); return; }
    if (mod && k === 's') { e.preventDefault(); this.saveProject(e.shiftKey); return; }
    if (mod && (k === '=' || k === '+')) { e.preventDefault(); this.setZoom(this.state.zoom * 1.2); return; }
    if (mod && k === '-') { e.preventDefault(); this.setZoom(this.state.zoom / 1.2); return; }
    if (mod && k === '0') { e.preventDefault(); this.fitZoom(); return; }
    if (mod && k === 'a') { e.preventDefault(); this.setState({ sel: this.pg.els.filter(x => !x.locked && !x.hidden).map(x => x.id) }); return; }
    if (mod && k === 'v') { setTimeout(() => { if (!this._pastedImage || Date.now() - this._pastedImage > 300) this.paste(); }, 60); return; }
    if (k === 'escape' && this.state.menu) { this.setState({ menu: null }); return; }
    if (!sel.length) { if (!mod && k === 't') this.addText('heading'); return; }
    if (mod && k === 'd') { e.preventDefault(); this.dup(); return; }
    if (mod && k === 'g') { e.preventDefault(); e.shiftKey ? this.ungroup() : this.group(); return; }
    if (mod && k === 'c') { this.copy(); return; }
    if (mod && k === 'x') { this.copy(); this.del(); return; }
    if (mod && k === ']') { e.preventDefault(); this.arrange(e.shiftKey ? 'front' : 'forward'); return; }
    if (mod && k === '[') { e.preventDefault(); this.arrange(e.shiftKey ? 'back' : 'backward'); return; }
    if (k === 'delete' || k === 'backspace') { e.preventDefault(); this.del(); return; }
    if (k === 'escape') { this.setState({ sel: [], cropMode: false }); return; }
    if (k === 'enter') { const el = this.selEls()[0]; if (el && el.type === 'text') { e.preventDefault(); this.setState({ editingId: el.id }); } return; }
    const ar = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] }[k];
    if (ar) { e.preventDefault(); const s = e.shiftKey ? 10 : 1; this.patchSel(x => { if (!x.locked) { x.x += ar[0] * s; x.y += ar[1] * s; } }, 'nudge'); }
  }

  /* ---------- files & export ---------- */
  pageNodes(scope) { const d = this.state.doc; return (scope === 'page' ? [this.pg] : d.pages).map(p => document.querySelector(`[data-page-node="${p.id}"]`)).filter(Boolean); }
  async prep(msg) { this.setState({ menu: null, sel: [], editingId: null, hoverId: null, cropMode: false, busy: msg }); await new Promise(r => setTimeout(r, 150)); }
  // Where a file goes is decided before the slow rendering starts: a save dialog
  // (desktop Chromium) has to open inside the click, and on a phone the finished
  // file goes to the share sheet. Anywhere else it is a download. See io.js.
  async doExport(kind, scope) {
    const doc = this.state.doc, IO = this.IO; const pages = scope === 'page' ? 1 : doc.pages.length;
    const name = IO.exportName(doc, kind, pages), type = IO.TYPES[name.endsWith('.zip') ? 'zip' : kind];
    const sink = await IO.openSink(name, type); if (sink === 'cancel') { this.setState({ menu: null, phoneMenu: null }); return; }
    const send = sink ? (blob => sink.write(blob)) : ((blob, n) => IO.deliver(blob, n, doc.name));
    await this.prep('Preparing export…');
    const opt = { scale: this.state.exportScale, onProgress: t => this.setState({ busy: t }), send, fonts: this.state.fonts };
    try {
      const nodes = this.pageNodes(scope);
      if (kind === 'pdf') await IO.exportPDF(nodes, doc, opt);
      else if (kind === 'svg') await IO.exportSVG(nodes, doc, opt);
      else await IO.exportImages(nodes, doc, { ...opt, fmt: kind });
      this.toast(sink ? 'Saved ' + name : 'Export ready');
    } catch (err) { console.error(err); this.toast('Export failed — ' + (err.message || err)); }
    this.setState({ busy: null });
  }
  // ⌘S writes back to the file the design came from when the browser gave us a
  // handle; ⇧⌘S (or the first save) asks where. Elsewhere it is a download or share.
  saveProject = async (as = false) => {
    const doc = this.state.doc, IO = this.IO; if (!doc) return; const name = IO.safe(doc.name) + '.pinwheel';
    let sink = null;
    if (IO.canPick()) {
      if (this.fileHandle && as !== true) sink = { handle: this.fileHandle, write: b => IO.writeHandle(this.fileHandle, b) };
      else { sink = await IO.openSink(name, IO.TYPES.pinwheel); if (sink === 'cancel') { this.setState({ menu: null, phoneMenu: null }); return; } if (sink) this.fileHandle = sink.handle; }
    }
    await this.prep('Packing .pinwheel file…');
    try {
      const blob = await IO.packProject({ ...doc, brand: this.B.brandForFile(this.state.brand) }, this.state.assets, this.pageNodes('all')[0], this.fontsFor(doc));
      if (sink) { await sink.write(blob); this.toast('Saved ' + (sink.handle && sink.handle.name || name)); }
      else { const r = await IO.deliver(blob, name, doc.name); if (r !== 'cancelled') this.toast(r === 'shared' ? 'Shared ' + name : 'Saved ' + name); }
    } catch (err) { console.error(err); this.fileHandle = null; this.toast('Save failed — ' + err.message); }
    this.setState({ busy: null });
  };
  saveProjectAs = () => this.saveProject(true);
  openFile = async () => {
    this.setState({ menu: null, phoneMenu: null });
    if (this.IO && this.IO.canPick()) { try { const r = await this.IO.pickOpenFile(); if (r) this.openProjectFile(r.file, r.handle); return; } catch (e) { } }
    this.fileInput && this.fileInput.click();
  };
  onProjectFile = async e => { const f = e.target.files[0]; e.target.value = ''; if (f) this.openProjectFile(f, null); };
  onHomeDrop = async e => { const f = [...(e.dataTransfer.files || [])].find(f => /\.(pinwheel|zip)$/i.test(f.name)); if (f) { e.preventDefault(); this.openProjectFile(f, null); } };
  // Shared by the file input, the open dialog, drag-and-drop and the PWA file
  // handler. A file can arrive before the io module has finished loading, so hold it
  // until the modules are in. The manifest says whether it is a design or a brand kit.
  openProjectFile = async (f, handle) => {
    if (!this.IO) { this._pendingFile = [f, handle]; return; }
    this.setState({ busy: 'Opening ' + f.name + '…' });
    try {
      const r = await this.IO.openProject(f);
      if (r.kind === 'brand') this.importBrandKit(r.brand, r.assets, r.fonts);
      else {
        // Fonts that came with the file stay available for the session.
        if (r.fonts && Object.keys(r.fonts).length) { this._fileFonts = { ...(this._fileFonts || {}), ...Object.fromEntries(Object.values(r.fonts).map(f => [f.family, f])) }; this.refreshFonts(); }
        this.fileHandle = handle && typeof handle.createWritable === 'function' ? handle : null; this.openDoc(r.doc, r.assets); this.toast('Opened ' + r.doc.name);
      }
    } catch (err) { console.error(err); this.toast(err.message || 'Could not open that file'); }
    this.setState({ busy: null });
  };

  /* ---------- brand builder ---------- */
  // A short wizard: name and logo, then a colour kit (several generated from the
  // logo, or curated ones without), then fonts. Editing an existing brand starts
  // from its values and writes back to it.
  startWizard = (edit = null, step = 1) => {
    const b = edit ? this.state.brands.find(x => x.id === edit) : null; const P = this.P;
    const curated = P.PALETTES.slice(0, 8).map(p => ({ id: p.id, name: p.name, note: 'Curated palette', bg: p.bg, ink: p.ink, accent: p.accent, accent2: p.accent2 }));
    const wiz = { step, editId: b ? b.id : null, name: b ? b.name : '', logo: null, logoId: b ? b.logo : null, kits: curated, fromLogo: false, kit: 0, bg: b ? b.bg : curated[0].bg, ink: b ? b.ink : curated[0].ink, accent: b ? b.accent : curated[0].accent, accent2: b ? b.accent2 : curated[0].accent2, heading: b ? b.heading : 'DM Serif Display', body: b ? b.body : 'DM Sans', busy: false };
    if (b && b.logo && b.assets[b.logo]) { wiz.logo = b.assets[b.logo]; this.setState({ wiz, menu: null, phoneMenu: null }, () => this.wizKits(b.assets[b.logo].src)); return; }
    this.setState({ wiz, menu: null, phoneMenu: null });
  };
  wizSet = patch => this.setState(s => s.wiz ? { wiz: { ...s.wiz, ...patch } } : null);
  closeWizard = () => this.setState({ wiz: null });
  pickWizLogo = () => { this._logoFor = 'wiz'; this.logoInput && this.logoInput.click(); };
  wizLogo(id, asset) { this._logoFor = null; this.wizSet({ logo: asset, logoId: id, newLogo: true }); this.wizKits(asset.src); }
  async wizKits(src) {
    this.wizSet({ busy: true });
    try { const px = await this.IO.imagePixels(src, 48); const kits = this.PAL.kitsFromPixels(px); if (kits.length) { const k = kits[0]; this.wizSet({ kits, fromLogo: true, kit: 0, bg: k.bg, ink: k.ink, accent: k.accent, accent2: k.accent2, busy: false }); return; } }
    catch (e) { console.warn('Palette extraction failed', e); }
    this.wizSet({ busy: false });
  }
  wizPickKit = i => { const k = this.state.wiz.kits[i]; if (k) this.wizSet({ kit: i, bg: k.bg, ink: k.ink, accent: k.accent, accent2: k.accent2 }); };
  wizFinish = () => {
    const w = this.state.wiz; if (!w) return; const name = w.name.trim() || 'My brand';
    const vals = { name, bg: w.bg, ink: w.ink, accent: w.accent, accent2: w.accent2, heading: w.heading, body: w.body };
    const logoAssets = w.logo && w.logoId && w.newLogo ? { [w.logoId]: w.logo } : {};
    if (w.editId) {
      const b = this.state.brands.find(x => x.id === w.editId); if (!b) return this.closeWizard();
      const nb = { ...b, ...vals, assets: { ...b.assets, ...logoAssets }, logo: w.logoId || b.logo, updated: Date.now() };
      this.setState(s => ({ brands: s.brands.map(x => x.id === nb.id ? nb : x), brand: nb, assets: { ...s.assets, ...logoAssets }, wiz: null }), () => this.saveBrandSoon());
      this.toast('Brand updated');
    } else {
      this.createBrand({ ...vals, assets: logoAssets, logo: w.logoId && w.logo ? w.logoId : null });
      this.setState({ wiz: null }); this.toast('Brand “' + name + '” is ready');
    }
  };
  removeBg = async () => {
    const el = this.selEls()[0]; if (!el || !el.asset) return;
    this.setState({ busy: 'Loading on-device model…' });
    try {
      const feather = el.feather ?? 0;
      const r = await this.IO.removeBackground(this.state.assets[el.asset].src, t => this.setState({ busy: t }), { feather });
      const id = 'a' + this.P.nid(); this.setState(s => ({ assets: { ...s.assets, [id]: { ...r, name: 'cutout.png' } }, uploads: [id, ...s.uploads] }));
      this.setDoc(d => d.pages.forEach(p => p.els.forEach(x => { if (x.id === el.id) { x.origAsset = x.origAsset || x.asset; x.asset = id; x.feather = feather; } })));
      this.toast('Background removed on this device');
    } catch (err) { console.error(err); this.toast(err.message || 'Background removal failed'); }
    this.setState({ busy: null });
  };
  // Feathering re-composites the cached mask over the original at the new softness and
  // swaps the cutout's pixels in place, so the document only records the number.
  // Debounced: the slider fires continuously and compositing a full-size image is
  // tens of milliseconds.
  setFeather(el, v) {
    this.patchSel({ feather: v }, 'feather');
    clearTimeout(this._ft);
    this._ft = setTimeout(async () => {
      const cur = this.pg && this.pg.els.find(x => x.id === el.id); const orig = cur && cur.origAsset && this.state.assets[cur.origAsset]; if (!cur || !orig) return;
      try {
        const r = await this.IO.removeBackground(orig.src, t => this.setState({ busy: t }), { feather: v });
        this.setState(s => s.assets[cur.asset] ? { assets: { ...s.assets, [cur.asset]: { ...s.assets[cur.asset], ...r } }, busy: null } : { busy: null });
      } catch (err) { console.error(err); this.setState({ busy: null }); this.toast(err.message || 'Could not re-feather the cutout'); }
    }, 160);
  }

  /* ---------- view helpers ---------- */
  segStyle(on, grow = true) { return { flex: grow ? '1 1 auto' : 'none', height: 28, padding: '0 9px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, background: on ? 'var(--pw-surface)' : 'transparent', color: on ? 'var(--pw-ink)' : 'var(--pw-muted)', boxShadow: on ? '0 1px 2px rgba(0,0,0,.1)' : 'none', whiteSpace: 'nowrap' }; }
  btnStyle(kind) { return { height: 32, padding: '0 11px', borderRadius: 7, border: kind === 'primary' ? 'none' : '1px solid var(--pw-line-2)', background: kind === 'primary' ? this.CORAL : kind === 'on' ? 'var(--pw-ink)' : 'var(--pw-surface)', color: kind === 'primary' || kind === 'on' ? 'var(--pw-surface)' : kind === 'danger' ? '#B23A22' : 'var(--pw-ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flex: kind === 'primary' ? '1 1 100%' : '1 1 auto' }; }
  thumbFor(desc, maxW, maxH) {
    const st = this.state, bk = st.brandOn ? `|${st.brand.id}:${st.brand.updated}` : '';
    const key = desc.id + '|' + maxW + '|' + maxH + bk; if (this.thumbCache.has(key)) return this.thumbCache.get(key);
    let b = this.builtCache.get(desc.id); if (!b) { b = this.P.build(desc); this.builtCache.set(desc.id, b); }
    if (bk) b = this.brandify(structuredClone(b));
    if (this.thumbCache.size > 800) this.thumbCache.clear();
    const n = this.R.renderThumb(React.createElement, b, b.pages[0], maxW, maxH, {}); this.thumbCache.set(key, n); return n;
  }
  miniEl(el, box = 48) { const h = React.createElement; return h('div', { style: { position: 'relative', width: box, height: box, pointerEvents: 'none' } }, this.R.renderEl(h, { id: 'mini', rot: 0, opacity: 1, x: (box - el.w) / 2, y: (box - el.h) / 2, ...el }, {})); }
  swatches(cur, set, allowNone) {
    const d = this.state.doc, t = d.theme, b = this.state.brand;
    const list = [...new Set([t.bg, t.ink, t.accent, t.accent2, t.surface, t.muted, b.accent, b.accent2, b.ink, '#FFFFFF', '#000000'].filter(Boolean).map(c => c.toUpperCase()))].slice(0, 12);
    const out = list.map(c => ({ title: c, onClick: () => set(c), style: { width: 26, height: 26, borderRadius: 7, border: '1px solid rgba(0,0,0,.12)', background: c, cursor: 'pointer', padding: 0, outline: cur && cur.toUpperCase() === c ? '2px solid ' + this.CORAL : 'none', outlineOffset: 2 } }));
    if (allowNone) out.unshift({ title: 'None', onClick: () => set(null), style: { width: 26, height: 26, borderRadius: 7, border: '1px solid var(--pw-line-strong)', background: 'linear-gradient(135deg, #FFF 45%, #D94B3A 45%, #D94B3A 55%, #FFF 55%)', cursor: 'pointer', padding: 0, outline: !cur ? '2px solid ' + this.CORAL : 'none', outlineOffset: 2 } });
    return out;
  }
  // A slider's number can be typed. The typed value is not clipped to the slider's
  // range: the range stretches to include whatever the value is, so a 500 px shadow
  // is as reachable as a 50 px one.
  sliderExtras(c) {
    const st = this.state, key = c.label, ed = st.sliderEdit && st.sliderEdit.key === key ? st.sliderEdit : null;
    const commit = () => { const e = this.state.sliderEdit; if (!e || e.key !== key) return; this.setState({ sliderEdit: null }); const v = parseFloat(e.text); if (Number.isFinite(v) && v !== c.value) c.onChange({ target: { value: String(v) } }); };
    return { min: Math.min(c.min, c.value), max: Math.max(c.max, c.value), editing: !!ed, editText: ed ? ed.text : '',
      startEdit: () => this.setState({ sliderEdit: { key, text: String(Math.round(c.value * 1000) / 1000) } }),
      onEditChange: e => this.setState({ sliderEdit: { key, text: e.target.value } }),
      onEditKey: e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { e.preventDefault(); this.setState({ sliderEdit: null }); } },
      commitEdit: commit, selectAll: e => e.target.select() };
  }
  ctl(c) {
    const k = c.k; if (k === 'slider') c = { ...c, ...this.sliderExtras(c) }; return { label: '', display: '', ...c, hasLabel: !!c.label && k !== 'btns', isSlider: k === 'slider', isNums: k === 'nums', isColor: k === 'color', isSelect: k === 'select', isSeg: k === 'seg', isText: k === 'text', isArea: k === 'area', isBtns: k === 'btns', isNote: k === 'note', gridStyle: { display: 'grid', gridTemplateColumns: `repeat(${c.cols || 2}, minmax(0, 1fr))`, gap: 6 }, selectNode: k === 'select' ? (c.selFont ? this.fontPickerEl('font:el', c.value, c.onPick) : this.selectEl(c.value, c.options, c.onChange, { height: 34, border: '1px solid var(--pw-line-2)', borderRadius: 7, padding: '0 8px', fontSize: 13, background: 'var(--pw-surface)', width: '100%' })) : null };
  }
  selectEl(value, options, onChange, style) {
    const h = React.createElement;
    return h('select', { value, onChange, style }, options.map(o => h('option', { key: o.value, value: o.value, style: { fontFamily: 'inherit' } }, o.label)));
  }
  /* ---------- font picker ---------- */
  // A popover that lists every family set in its own face, with search and category
  // chips. All the families are loaded as stylesheets at start-up, so the previews
  // are live text rather than images. Positioned fixed so the panel's scroll
  // container cannot clip it; the shared menu backdrop closes it.
  fontPickerEl(key, value, onPick, big) {
    const h = React.createElement, P = this.P, st = this.state, open = st.menu === key, C = this.CORAL;
    const toggle = e => { const r = e.currentTarget.getBoundingClientRect(); this.setState(s => ({ menu: s.menu === key ? null : key, fontQ: '', fontCat: 'all', fontAnchor: { left: r.left, top: r.bottom, bottom: r.top, width: r.width } })); };
    const kids = [h('button', { key: 'b', onClick: toggle, title: 'Change font', style: { height: big ? 36 : 34, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 10px', border: '1px solid ' + (open ? C : 'var(--pw-line-2)'), borderRadius: 7, background: 'var(--pw-surface)', color: 'var(--pw-ink)', cursor: 'pointer', textAlign: 'left' } },
      h('span', { style: { fontFamily: `'${value}'`, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, value), h('span', { style: { fontSize: 11, color: 'var(--pw-muted)', flex: 'none' } }, '▾'))];
    if (open) {
      const a = st.fontAnchor || { left: 0, top: 0, bottom: 0, width: 260 }, vh = window.innerHeight, up = vh - a.top < 360 && a.bottom > vh - a.top;
      const q = st.fontQ.trim().toLowerCase(), cat = st.fontCat, pick = name => { onPick(name); this.setState({ menu: null }); };
      const custom = Object.values(st.fonts).map(f => ({ name: f.family, cat: 'brand' })), cats = custom.length ? [P.FONT_CATS[0], ['brand', 'Uploaded'], ...P.FONT_CATS.slice(1)] : P.FONT_CATS;
      const list = [...custom, ...P.FONTS].filter(f => (cat === 'all' || f.cat === cat) && (!q || f.name.toLowerCase().includes(q)));
      const pos = up ? { bottom: vh - a.bottom + 4, maxHeight: Math.min(460, a.bottom - 16) } : { top: a.top + 4, maxHeight: Math.min(460, vh - a.top - 16) };
      const width = Math.max(a.width, 360), left = Math.max(8, Math.min(a.left, window.innerWidth - width - 8));
      kids.push(h('div', { key: 'p', onClick: e => e.stopPropagation(), style: { position: 'fixed', left, width, ...pos, zIndex: 32, display: 'flex', flexDirection: 'column', gap: 6, padding: 8, background: 'var(--pw-surface)', border: '1px solid var(--pw-line)', borderRadius: 10, boxShadow: '0 12px 32px rgba(36,33,29,.18)' } },
        h('input', { key: 'q', autoFocus: true, value: st.fontQ, placeholder: 'Search fonts', onChange: e => this.setState({ fontQ: e.target.value }), onKeyDown: e => { if (e.key === 'Escape') this.setState({ menu: null }); if (e.key === 'Enter' && list.length) pick(list[0].name); }, style: { height: 32, border: '1px solid var(--pw-line-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, outline: 'none', background: 'var(--pw-surface)', flex: 'none' } }),
        // One row of chips; it scrolls sideways rather than wrapping into orphans.
        h('div', { key: 'c', className: 'pw-chips', style: { display: 'flex', gap: 2, background: 'var(--pw-track)', padding: 3, borderRadius: 8, flex: 'none', overflowX: 'auto' } }, cats.map(([id, label]) => h('button', { key: id, onClick: () => this.setState({ fontCat: id }), style: { ...this.segStyle(cat === id, false), height: 24, fontSize: 12, padding: '0 8px' } }, label))),
        h('div', { key: 'l', style: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 } },
          list.length ? list.map(f => { const on = f.name === value; return h('button', { key: f.name, onClick: () => pick(f.name), title: f.name, className: on ? undefined : 'pw-h1', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 38, padding: '0 10px', border: 'none', borderRadius: 7, background: on ? 'var(--pw-accent-tint)' : 'transparent', color: 'var(--pw-ink)', cursor: 'pointer', textAlign: 'left', flex: 'none' } },
            h('span', { style: { fontFamily: `'${f.name}'`, fontSize: 17, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, f.name), h('span', { style: { fontSize: 11, color: on ? 'var(--pw-accent-deep)' : 'var(--pw-muted-2)', flex: 'none' } }, on ? '✓' : f.cat)); })
            : h('div', { style: { padding: '14px 10px', fontSize: 13, color: 'var(--pw-muted)' } }, 'No fonts match.'))));
    }
    return h('div', { style: { position: 'relative' } }, kids);
  }

  buildProps() {
    const d = this.state.doc, P = this.P; const els = this.selEls(); const S = [];
    const pp = (patch, key) => this.patchSel(patch, key || true);
    const slider = (label, value, min, max, step, fn, disp) => ({ k: 'slider', label, value, min, max, step, display: disp != null ? disp : String(Math.round(value * 100) / 100), onChange: e => fn(+e.target.value) });
    const color = (label, cur, fn, none) => ({ k: 'color', label, display: cur ? cur.toUpperCase() : 'None', hex: cur && /^#[0-9a-f]{6}$/i.test(cur) ? cur : '#000000', swatches: this.swatches(cur, fn, none), onPick: e => fn(e.target.value.toUpperCase()) });
    const seg = (label, opts) => ({ k: 'seg', label, opts: opts.map(([l, on, fn, title]) => ({ label: l, title: title || l, style: this.segStyle(on), onClick: fn })) });
    const btns = items => ({ k: 'btns', items: items.map(([label, fn, kind, title]) => ({ label, onClick: fn, title: title || label, style: this.btnStyle(kind) })) });
    const note = text => ({ k: 'note', text });
    if (!els.length) {
      const pg = this.pg;
      S.push({ title: 'Background', controls: [color('Page color', pg.bg, c => this.setDoc((dd, p) => { p.bg = c || '#FFFFFF'; }, 'pagebg'))] });
      S.push({ title: 'Pages', controls: [btns([['Add page', () => this.addPage()], ['Duplicate', () => this.dupPage(this.state.page)], ['Delete', () => this.delPage(this.state.page), 'danger']])] });
      S.push({ title: 'Size', controls: [note(`${d.w} × ${d.h} px${P.FORMAT[d.fmt] ? ' · ' + P.FORMAT[d.fmt].name : ''}`), { k: 'select', label: 'Resize to', value: d.fmt, options: [{ value: 'custom', label: 'Choose a format…' }, ...P.FORMATS.map(f => ({ value: f.id, label: `${f.name} · ${f.w}×${f.h}` }))], onChange: e => this.resizeDoc(e.target.value) }] });
      S.push({ title: 'Shortcuts', controls: [note('Double-click text to edit · Drag photos onto frames · Shift-click or drag a box to multi-select · ⌘G group · ⌘D duplicate · ⌘Z undo · Arrows nudge · ⌘S save · T adds a heading')] });
      return { title: `Page ${this.state.page + 1} of ${d.pages.length}`, sections: S };
    }
    const el = els[0], one = els.length === 1;
    if (one && el.type === 'text') {
      S.push({ title: 'Text', controls: [
        { k: 'select', label: 'Font', value: el.font, selFont: true, onPick: v => pp(x => { x.font = v; if (this.ONEW.includes(v)) x.weight = 400; }) },
        slider('Size', Math.round(el.size), 4, 800, 1, v => pp({ size: Math.max(4, v) }, 'size')),
        seg('Style', [['Bold', el.weight >= 600, () => pp(x => { x.weight = x.weight >= 600 ? 400 : (this.ONEW.includes(x.font) ? 400 : 700); })], ['Italic', el.italic, () => pp(x => { x.italic = !x.italic; })], ['Caps', el.upper, () => pp(x => { x.upper = !x.upper; })]]),
        seg('Align', [['Left', el.align === 'left', () => pp({ align: 'left' })], ['Center', el.align === 'center', () => pp({ align: 'center' })], ['Right', el.align === 'right', () => pp({ align: 'right' })]]),
        slider('Line height', el.lh, .7, 2.4, .01, v => pp({ lh: v }, 'lh')),
        slider('Letter spacing', el.ls, -.1, .5, .005, v => pp({ ls: v }, 'ls')),
        color('Color', el.color, c => pp({ color: c || '#000000' }, 'tcolor')),
        color('Highlight', el.bg, c => pp({ bg: c }, 'thl'), true),
        btns([['Edit text', () => this.setState({ editingId: el.id })]])
      ] });
      const sh = typeof el.shadow === 'object' && el.shadow ? el.shadow : null, long = !!(sh && sh.long);
      const cur = x => (typeof x.shadow === 'object' && x.shadow ? x.shadow : null);
      const setShadow = (patch, key) => pp(x => { x.shadow = { ...(cur(x) || { x: 0, y: Math.round(x.size * .06), blur: Math.round(x.size * .18), color: 'rgba(0,0,0,.35)' }), ...patch }; }, key);
      // A long shadow is stored as (x, y) like any other; its sliders speak angle and
      // length, and the renderer extrudes the glyphs along that vector.
      const len = sh ? Math.round(Math.hypot(sh.x || 0, sh.y || 0)) : 0, ang = sh && len ? ((Math.round(Math.atan2(sh.y || 0, sh.x || 0) * 180 / Math.PI) % 360) + 360) % 360 : 45;
      const setLong = (a, l, key) => setShadow({ x: Math.round(Math.cos(a * Math.PI / 180) * l), y: Math.round(Math.sin(a * Math.PI / 180) * l), blur: 0, long: true }, key);
      const maxOff = Math.max(60, Math.round(el.size * 1.5));
      S.push({ title: 'Effects', controls: [
        color('Outline', el.outline, c => pp(x => { x.outline = c; if (c && x.outlineW == null) x.outlineW = Math.max(1, Math.round(x.size / 34)); }, 'tol'), true),
        ...(el.outline ? [
          slider('Outline width', el.outlineW ?? Math.max(1, el.size / 34), .5, 24, .5, v => pp({ outlineW: v }, 'tow')),
          seg('Outline fill', [['Hollow', !el.outlineFill, () => pp({ outlineFill: false })], ['Keep colour', !!el.outlineFill, () => pp({ outlineFill: true })]]),
        ] : []),
        seg('Shadow', [
          ['None', !el.shadow, () => pp({ shadow: null })], ['Soft', el.shadow === true, () => pp({ shadow: true })],
          ['Drop', !!sh && !long, () => pp(x => { const c = cur(x); x.shadow = c ? { ...c, long: false } : { x: Math.round(x.size * .05), y: Math.round(x.size * .05), blur: 0, color: 'rgba(0,0,0,.35)' }; }, 'sh'), 'A single offset copy, sharp or blurred'],
          ['Long', long, () => pp(x => { const c = cur(x), l = Math.max(4, Math.round(x.size * .18)); x.shadow = { x: Math.round(l * Math.SQRT1_2), y: Math.round(l * Math.SQRT1_2), blur: 0, color: c ? c.color : 'rgba(0,0,0,.35)', long: true }; }, 'sh'), 'Sharp extruded shadow, like a classic poster']
        ]),
        ...(sh && !long ? [
          color('Shadow colour', /^#/.test(sh.color) ? sh.color : null, c => setShadow({ color: c || 'rgba(0,0,0,.35)' }, 'shc'), true),
          slider('Offset X', sh.x, -maxOff, maxOff, 1, v => setShadow({ x: v }, 'shx')),
          slider('Offset Y', sh.y, -maxOff, maxOff, 1, v => setShadow({ y: v }, 'shy')),
          slider('Blur', sh.blur, 0, 80, 1, v => setShadow({ blur: v }, 'shb')),
        ] : []),
        ...(long ? [
          color('Shadow colour', /^#/.test(sh.color) ? sh.color : null, c => setShadow({ color: c || 'rgba(0,0,0,.35)' }, 'shc'), true),
          slider('Length', len, 0, Math.max(40, Math.round(el.size * 2)), 1, v => setLong(ang, v, 'shl'), len + 'px'),
          slider('Angle', ang, 0, 359, 1, v => setLong(v, len, 'sha'), ang + '°'),
        ] : []),
      ] });
    }
    if (one && el.type === 'shape') {
      const c = [
        { k: 'select', label: 'Shape', value: el.shape, options: [...this.R.SHAPES.map(s => ({ value: s, label: this.R.SHAPE_INFO[s][0] })), ...(el.shape === 'poly' || el.shape === 'path' ? [{ value: el.shape, label: el.shape === 'path' ? 'Motif' : 'Custom' }] : [])], onChange: e => pp({ shape: e.target.value }) },
        color('Fill', el.fill, v => pp({ fill: v }, 'fill'), true),
        color('Stroke', el.stroke, v => pp(x => { x.stroke = v; if (v && !x.sw) x.sw = Math.max(2, Math.round(this.u() * .5)); }, 'stroke'), true),
        slider('Stroke width', el.sw || 0, 0, Math.max(10, Math.round(Math.min(el.w, el.h) / 4)), 1, v => pp({ sw: v }, 'sw'), String(Math.round(el.sw || 0)))
      ];
      if (el.shape === 'rect') c.push(slider('Corner radius', el.radius || 0, 0, Math.round(Math.min(el.w, el.h) / 2), 1, v => pp({ radius: v }, 'rad'), String(Math.round(el.radius || 0))));
      if (el.shape === 'star' || el.shape === 'burst') { c.push(slider('Points', el.points || 5, 3, 32, 1, v => pp({ points: v }, 'pts'), String(el.points))); c.push(slider('Inner radius', el.inner || .5, .1, .95, .01, v => pp({ inner: v }, 'inn'))); }
      if (el.shape === 'polygon') c.push(slider('Sides', el.sides || 6, 3, 12, 1, v => pp({ sides: v }, 'sides'), String(el.sides)));
      if (el.shape === 'gear') c.push(slider('Teeth', Math.max(5, el.points || 8), 5, 24, 1, v => pp({ points: v }, 'pts'), String(Math.max(5, el.points || 8))));
      if (el.shape === 'ring') c.push(slider('Thickness', Math.round((1 - (el.inner ?? .62)) * 100), 8, 90, 1, v => pp({ inner: 1 - v / 100 }, 'inn'), Math.round((1 - (el.inner ?? .62)) * 100) + '%'));
      c.push(seg('Effects', [['Dashed', !!el.dash, () => pp(x => { x.dash = !x.dash; })], ['Shadow', !!el.shadow, () => pp(x => { x.shadow = !x.shadow; })]]));
      S.push({ title: 'Shape', controls: c });
    }
    if (one && el.type === 'line') {
      S.push({ title: 'Line', controls: [color('Color', el.stroke, v => pp({ stroke: v || '#000000' }, 'lc')), slider('Weight', el.sw, 1, 60, 1, v => pp(x => { x.sw = v; const nh = Math.max(v * 3, 8); x.y += (x.h - nh) / 2; x.h = nh; }, 'lw'), String(el.sw)), seg('Style', [['Solid', !el.dash, () => pp({ dash: false })], ['Dashed', !!el.dash, () => pp({ dash: true })]]), seg('End', [['None', !el.arrow, () => pp({ arrow: false })], ['Arrow', !!el.arrow, () => pp({ arrow: true })]])] });
    }
    if (one && el.type === 'image') {
      const f = el.filters || P.NOFILTER; const setF = (k, v) => pp(x => { x.filters = { ...(x.filters || P.NOFILTER), [k]: v }; }, 'f' + k);
      const asset = this.state.assets[el.asset], alpha = !!(asset && asset.alpha), edge = this.R.imageEdge(el, asset);
      const ish = typeof el.shadow === 'object' && el.shadow ? el.shadow : null, maxO = Math.max(60, Math.round(Math.min(el.w, el.h) / 2));
      const setIsh = (patch, key) => pp(x => { x.shadow = { ...(typeof x.shadow === 'object' && x.shadow ? x.shadow : {}), ...patch }; }, key);
      const presets = { Original: P.NOFILTER, Mono: { ...P.NOFILTER, g: 1, c: 1.1 }, Warm: { ...P.NOFILTER, se: .28, s: 1.15, b: 1.03 }, Cool: { ...P.NOFILTER, hu: -14, s: .9, b: 1.03 }, Fade: { ...P.NOFILTER, c: .8, b: 1.1, s: .75 }, Vivid: { ...P.NOFILTER, s: 1.55, c: 1.12 }, Noir: { ...P.NOFILTER, g: 1, c: 1.5, b: .88 } };
      const c = [];
      if (!el.asset) c.push(note('Empty frame. Drop a photo onto it, drag one from Uploads, or choose a file.'));
      c.push(btns([[el.asset ? 'Replace' : 'Choose image', () => { this.replaceTarget = el.id; this.imgInput && this.imgInput.click(); }, el.asset ? undefined : 'primary'], ...(el.asset ? [['Crop', () => this.setState(s => ({ cropMode: !s.cropMode })), this.state.cropMode ? 'on' : undefined], ['Flip', () => pp(x => { x.flip = !x.flip; })]] : [])]));
      if (el.asset) c.push(btns([el.origAsset ? ['Restore original', () => pp(x => { x.asset = x.origAsset; delete x.origAsset; delete x.feather; })] : ['Remove background', this.removeBg, 'primary', 'Runs U²-Netp on this device — nothing is uploaded']]));
      if (el.asset && el.origAsset) c.push(slider('Feather edge', el.feather ?? 0, 0, 40, 1, v => this.setFeather(el, v), (el.feather ?? 0) + 'px'));
      if (this.state.cropMode && el.asset) { c.push(note('Drag the image on the canvas to reposition. Esc when done.')); c.push(slider('Zoom', el.zoom || 1, 1, 4, .01, v => pp({ zoom: v }, 'zoom'), (el.zoom || 1).toFixed(2) + '×')); c.push(slider('Focus X', el.cx ?? 50, 0, 100, 1, v => pp({ cx: v }, 'cx'), Math.round(el.cx ?? 50) + '%')); c.push(slider('Focus Y', el.cy ?? 50, 0, 100, 1, v => pp({ cy: v }, 'cy'), Math.round(el.cy ?? 50) + '%')); }
      c.push(seg('Mask', [['Rect', !el.mask || el.mask === 'none', () => pp({ mask: 'none' })], ['Rounded', el.mask === 'rounded', () => pp({ mask: 'rounded' })], ['Circle', el.mask === 'circle', () => pp({ mask: 'circle' })], ['Arch', el.mask === 'arch', () => pp({ mask: 'arch' })]]));
      if (!el.mask || el.mask === 'none') c.push(slider('Corner radius', el.radius || 0, 0, Math.round(Math.min(el.w, el.h) / 2), 1, v => pp({ radius: v }, 'irad'), String(Math.round(el.radius || 0))));
      S.push({ title: 'Image', controls: c });
      if (el.asset) S.push({ title: 'Adjust', controls: [
        seg('Filter', Object.entries(presets).map(([n, v]) => [n, JSON.stringify(f) === JSON.stringify(v), () => pp({ filters: { ...v } })])),
        slider('Brightness', f.b ?? 1, .3, 1.8, .01, v => setF('b', v)), slider('Contrast', f.c ?? 1, .3, 1.8, .01, v => setF('c', v)), slider('Saturation', f.s ?? 1, 0, 2, .01, v => setF('s', v)),
        slider('Warmth', f.se || 0, 0, 1, .01, v => setF('se', v)), slider('Hue', f.hu || 0, -180, 180, 1, v => setF('hu', v), (f.hu || 0) + '°'), slider('Blur', f.bl || 0, 0, 20, .5, v => setF('bl', v), (f.bl || 0) + 'px'),
        color('Border', el.border, v => pp(x => { x.border = v; if (v && !x.borderW) x.borderW = Math.round(this.u() * 1); }, 'ib'), true),
        slider('Border width', el.borderW || 0, 0, Math.round(Math.min(el.w, el.h) / 8), 1, v => pp({ borderW: v }, 'ibw'), String(Math.round(el.borderW || 0))),
        seg('Shadow', [['None', !el.shadow, () => pp({ shadow: null })], ['Soft', el.shadow === true, () => pp({ shadow: true })], ['Custom', !!ish, () => pp(x => { if (typeof x.shadow !== 'object' || !x.shadow) x.shadow = { x: Math.round(this.u() * .8), y: Math.round(this.u() * .8), blur: 0, color: 'rgba(0,0,0,.35)' }; }, 'ish')]]),
        ...(ish ? [
          color('Shadow colour', /^#/.test(ish.color) ? ish.color : null, c => setIsh({ color: c || 'rgba(0,0,0,.35)' }, 'ishc'), true),
          slider('Offset X', ish.x || 0, -maxO, maxO, 1, v => setIsh({ x: v }, 'ishx')), slider('Offset Y', ish.y || 0, -maxO, maxO, 1, v => setIsh({ y: v }, 'ishy')), slider('Blur', ish.blur || 0, 0, 120, 1, v => setIsh({ blur: v }, 'ishb'))
        ] : []),
        // A cutout or transparent PNG: the border and shadow can hug the subject.
        ...(alpha && (!el.mask || el.mask === 'none') ? [seg('Border & shadow', [['Around subject', edge === 'subject', () => pp({ edge: 'subject' }), 'Follow the silhouette of the picture'], ['Around frame', edge === 'frame', () => pp({ edge: 'frame' }), 'Draw around the rectangular frame']])] : []),
        ...(alpha && el.mask && el.mask !== 'none' ? [note('With a mask the border and shadow follow the frame. Set the mask to Rect to draw them around the subject.')] : [])
      ] });
    }
    if (one && el.type === 'chart') {
      S.push({ title: 'Chart', controls: [
        seg('Type', [['Bar', el.chart === 'bar', () => pp({ chart: 'bar' })], ['Line', el.chart === 'line', () => pp({ chart: 'line' })], ['Pie', el.chart === 'pie', () => pp({ chart: 'pie' })], ['Donut', el.chart === 'donut', () => pp({ chart: 'donut' })]]),
        { k: 'area', label: 'Data', display: 'label, value', value: this.state.chartDraft != null && this.state.chartDraftId === el.id ? this.state.chartDraft : el.data.map(r => `${r.l}, ${r.v}`).join('\n'), onChange: e => { const v = e.target.value; this.setState({ chartDraft: v, chartDraftId: el.id }); const rows = v.split('\n').map(l => l.split(',')).filter(p => p.length >= 2 && p[0].trim()).map(p => ({ l: p[0].trim(), v: parseFloat(p.slice(1).join('').replace(/[^\d.\-]/g, '')) || 0 })); if (rows.length) pp({ data: rows }, 'cdata'); } },
        color('Highlight', el.colors[0], v => pp(x => { x.colors = [v || '#000', ...x.colors.slice(1)]; }, 'cc0')),
        color('Secondary', el.colors[1], v => pp(x => { const c = [...x.colors]; c[1] = v || '#999'; x.colors = c; }, 'cc1')),
        color('Labels', el.ink, v => pp({ ink: v || '#000' }, 'cink')),
        seg('Values', [['Show', el.labels !== false, () => pp({ labels: true })], ['Hide', el.labels === false, () => pp({ labels: false })]])
      ] });
    }
    if (one && el.type === 'qr') S.push({ title: 'QR code', controls: [{ k: 'text', label: 'Link or text', value: el.value, onChange: e => pp({ value: e.target.value }, 'qrv') }, color('Code color', el.fg, v => pp({ fg: v || '#000' }, 'qfg')), color('Background', el.qbg, v => pp({ qbg: v || '#FFF' }, 'qbg')), note('Keep strong contrast so phones can scan it.')] });
    const locked = els.every(x => x.locked), grouped = els.some(x => x.groupId);
    S.push({ title: one ? 'Arrange' : `${els.length} selected`, controls: [
      ...(one ? [{ k: 'nums', cols: 2, items: [['X', 'x'], ['Y', 'y'], ['W', 'w'], ['H', 'h']].map(([l, k]) => ({ label: l, value: Math.round(el[k]), step: 1, onChange: e => { const v = +e.target.value; pp(x => { if (k === 'w' && x.type === 'qr') { x.w = x.h = Math.max(8, v); } else x[k] = k === 'w' || k === 'h' ? Math.max(4, v) : v; }, 'pos' + k); } })).concat([{ label: '∠', value: el.rot || 0, step: 1, onChange: e => pp({ rot: +e.target.value || 0 }, 'rot') }]) }] : []),
      slider('Opacity', Math.round((el.opacity ?? 1) * 100), 0, 100, 1, v => pp({ opacity: v / 100 }, 'op'), Math.round((el.opacity ?? 1) * 100) + '%'),
      seg(one ? 'Align to page' : 'Align', [['⇤', false, () => this.align('left'), 'Left'], ['↔', false, () => this.align('center'), 'Center'], ['⇥', false, () => this.align('right'), 'Right'], ['⤒', false, () => this.align('top'), 'Top'], ['↕', false, () => this.align('middle'), 'Middle'], ['⤓', false, () => this.align('bottom'), 'Bottom']]),
      seg('Layer', [['Forward', false, () => this.arrange('forward')], ['Back', false, () => this.arrange('backward')], ['Front', false, () => this.arrange('front')], ['Bottom', false, () => this.arrange('back')]]),
      btns([['Duplicate', () => this.dup()], ...(els.length > 1 && !grouped ? [['Group', () => this.group()]] : []), ...(grouped ? [['Ungroup', () => this.ungroup()]] : []), [locked ? 'Unlock' : 'Lock', () => pp(x => { x.locked = !locked; })], ['Delete', () => this.del(), 'danger']])
    ] });
    const t = one ? ({ text: 'Text', shape: 'Shape', line: 'Line', image: el.asset ? 'Image' : 'Image frame', chart: 'Chart', qr: 'QR code' }[el.type]) : 'Selection';
    return { title: t + (locked ? ' · locked' : ''), sections: S };
  }

  overlay(pi) {
    const { doc, zoom: z, sel, page, hoverId, marquee, guides } = this.state; const p = doc.pages[pi]; const C = this.CORAL;
    const out = { hasSel: false, handles: [], multi: [], guides: [], hasHover: false, hasMarquee: false, showRot: false, showInfo: false };
    if (pi !== page) return out;
    const els = p.els.filter(e => sel.includes(e.id));
    if (hoverId && !sel.includes(hoverId) && !this._dragging) { const h = p.els.find(e => e.id === hoverId); if (h) {
      out.hasHover = true; out.hoverStyle = { position: 'absolute', left: h.x * z, top: h.y * z, width: h.w * z, height: h.h * z, transform: `rotate(${h.rot || 0}deg)`, outline: `1.5px solid ${C}`, opacity: .55, pointerEvents: 'none', zIndex: 2 };
      // A frame still showing sample art or a placeholder is an invitation: say so on hover.
      if (h.type === 'image' && !h.asset && !h.locked) {
        out.hoverHint = 'Replace image'; out.hoverTintStyle = { ...out.hoverStyle, outline: 'none', opacity: 1, background: 'rgba(36,33,29,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: h.mask === 'circle' ? '50%' : h.mask === 'rounded' ? Math.max(h.radius || 0, Math.min(h.w, h.h) * .08) * z : (h.radius || 0) * z };
        // The pill is the one part of the overlay that takes the pointer: it opens the
        // file picker for this frame, and keeps the hover alive while the pointer is on it.
        out.onHoverKeep = () => this.onHover(h.id); out.onHoverLeave = () => this.onHover(null);
        out.onHoverReplace = e => { e.stopPropagation(); e.preventDefault(); this.replaceTarget = h.id; this.setState({ sel: [h.id], page: pi, editingId: null }); this.imgInput && this.imgInput.click(); };
      }
    } }
    if (els.length) {
      const one = els.length === 1, e0 = els[0]; const b = one ? { x: e0.x, y: e0.y, w: e0.w, h: e0.h, rot: e0.rot || 0 } : { ...this.bbox(els), rot: 0 };
      out.hasSel = true; const crop = this.state.cropMode && one && e0.type === 'image';
      out.selStyle = { position: 'absolute', left: b.x * z, top: b.y * z, width: b.w * z, height: b.h * z, transform: `rotate(${b.rot}deg)`, outline: `${crop ? 2 : 1.5}px ${crop ? 'dashed' : 'solid'} ${C}`, pointerEvents: 'none', zIndex: 3 };
      const locked = els.some(e => e.locked);
      if (!locked && !this.state.editingId && !crop) {
        const dirs = one ? (e0.type === 'text' ? ['nw', 'ne', 'se', 'sw', 'e', 'w'] : e0.type === 'line' ? ['e', 'w'] : e0.type === 'qr' ? ['nw', 'ne', 'se', 'sw'] : ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) : ['nw', 'ne', 'se', 'sw'];
        const pos = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
        const cur = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' };
        const big = this.coarse ? 1.6 : 1;
        out.handles = dirs.map(d => { const [fx, fy] = pos[d]; const side = d.length === 1; const hw = (side ? (d === 'e' || d === 'w' ? 6 : 18) : 11) * big, hh = (side ? (d === 'e' || d === 'w' ? 18 : 6) : 11) * big; return { onDown: e => this.startResize(e, d), style: { position: 'absolute', left: `calc(${fx * 100}% - ${hw / 2}px)`, top: `calc(${fy * 100}% - ${hh / 2}px)`, width: hw, height: hh, background: 'var(--pw-surface)', border: `1.5px solid ${C}`, borderRadius: side ? 4 : '50%', pointerEvents: 'auto', cursor: cur[d], boxShadow: '0 1px 3px rgba(0,0,0,.18)' } }; });
        out.showRot = one && e0.type !== 'line' ? true : one; out.onRot = this.startRotate;
      }
      if (!one) out.multi = els.map(e => ({ position: 'absolute', left: e.x * z, top: e.y * z, width: e.w * z, height: e.h * z, transform: `rotate(${e.rot || 0}deg)`, outline: `1px dashed ${C}`, pointerEvents: 'none', zIndex: 2 }));
      out.info = this.state.dragInfo || ''; out.showInfo = !!this.state.dragInfo;
    }
    out.guides = guides.map(g => g.x != null ? { position: 'absolute', left: g.x * z, top: 0, width: 1, height: doc.h * z, background: '#E23D9A', pointerEvents: 'none', zIndex: 4 } : { position: 'absolute', top: g.y * z, left: 0, height: 1, width: doc.w * z, background: '#E23D9A', pointerEvents: 'none', zIndex: 4 });
    if (marquee && marquee.pi === pi) { out.hasMarquee = true; out.marqueeStyle = { position: 'absolute', left: marquee.x * z, top: marquee.y * z, width: marquee.w * z, height: marquee.h * z, background: 'rgba(232,103,74,.08)', border: `1px solid ${C}`, pointerEvents: 'none', zIndex: 5 }; }
    return out;
  }

  /* ---------- brand builder view ---------- */
  wizVals() {
    const w = this.state.wiz, P = this.P, h = React.createElement, C = this.CORAL; if (!w) return null;
    const steps = ['Name & logo', 'Colours', 'Fonts'];
    const sw = k => [k.bg, k.ink, k.accent, k.accent2].map(c => ({ flex: 1, background: c }));
    const sample = k => ({ background: k.bg, color: k.ink, borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 64, justifyContent: 'center' });
    return {
      title: w.editId ? 'Edit brand' : 'Create a brand', step: w.step, stepLabel: `Step ${w.step} of 3 · ${steps[w.step - 1]}`,
      steps: steps.map((l, i) => ({ label: l, style: { flex: 1, height: 4, borderRadius: 2, background: i < w.step ? C : 'var(--pw-line-strong)' } })),
      isName: w.step === 1, isColors: w.step === 2, isFonts: w.step === 3, isLast: w.step === 3, isFirst: w.step === 1,
      name: w.name, onName: e => this.wizSet({ name: e.target.value }), namePh: 'e.g. Northwind Coffee',
      hasLogo: !!w.logo, logoStyle: { width: '100%', height: '100%', backgroundImage: w.logo ? `url("${w.logo.src}")` : 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' },
      pickLogo: this.pickWizLogo, logoLabel: w.logo ? 'Replace logo' : 'Upload a logo', busy: w.busy,
      logoNote: w.logo ? (w.fromLogo ? 'Colour kits on the next step were drawn from this logo.' : 'Reading the colours in this logo…') : 'Optional. With a logo, the next step offers colour kits taken from it.',
      kitsTitle: w.fromLogo ? 'Kits from your logo' : 'Curated kits',
      kits: w.kits.map((k, i) => ({ name: k.name, note: k.note, sw: sw(k), on: w.kit === i, onClick: () => this.wizPickKit(i), sampleStyle: sample(k), hStyle: { fontFamily: `'${w.heading}'`, fontSize: 18, lineHeight: 1.1, fontWeight: this.ONEW.includes(w.heading) ? 400 : 700, color: k.ink }, aStyle: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: k.accent, color: k.ink === k.accent ? k.bg : (P.contrast(k.accent, k.ink) >= 3 ? k.ink : k.bg), fontSize: 11, fontWeight: 700, alignSelf: 'flex-start' }, style: { display: 'flex', flexDirection: 'column', gap: 6, padding: 8, border: '2px solid ' + (w.kit === i ? C : 'var(--pw-line-soft)'), background: 'var(--pw-surface)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', color: 'var(--pw-ink)', minWidth: 0 } })),
      colors: [['bg', 'Background'], ['ink', 'Text'], ['accent', 'Primary'], ['accent2', 'Secondary']].map(([k, l]) => ({ label: l, value: w[k], onChange: e => this.wizSet({ [k]: e.target.value.toUpperCase(), kit: -1 }) })),
      pairs: P.PAIRINGS.slice(0, 10).map(p => ({ display: p.name, body: `${p.display} + ${p.body}`, on: w.heading === p.display && w.body === p.body, onClick: () => this.wizSet({ heading: p.display, body: p.body }), dStyle: { fontFamily: `'${p.display}'`, fontWeight: p.dw, fontSize: 20, lineHeight: 1.1, textTransform: p.upper ? 'uppercase' : 'none', letterSpacing: p.track + 'em', color: 'var(--pw-ink)' }, bStyle: { fontFamily: `'${p.body}'`, fontSize: 12, color: 'var(--pw-muted)' }, style: { display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start', padding: '10px 12px', border: '1px solid ' + (w.heading === p.display && w.body === p.body ? C : 'var(--pw-line-soft)'), background: 'var(--pw-surface)', borderRadius: 9, cursor: 'pointer', textAlign: 'left' } })),
      fonts: [['heading', 'Headings'], ['body', 'Body']].map(([k, l]) => ({ label: l, selectNode: this.fontPickerEl('font:wiz:' + k, w[k], val => this.wizSet({ [k]: val }), true) })),
      previewStyle: { background: w.bg, color: w.ink, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--pw-line-soft)' },
      previewH: { fontFamily: `'${w.heading}'`, fontSize: 26, lineHeight: 1.05, fontWeight: this.ONEW.includes(w.heading) ? 400 : 700, color: w.ink, margin: 0 },
      previewB: { fontFamily: `'${w.body}'`, fontSize: 14, lineHeight: 1.4, color: P.mix(w.ink, w.bg, .25), margin: 0 },
      previewBtn: { alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 8, background: w.accent, color: P.contrast(w.accent, w.bg) >= 3 && P.contrast(w.accent, w.ink) < 3 ? w.bg : (P.contrast(w.accent, '#FFFFFF') >= 3 ? '#FFFFFF' : '#111111'), fontFamily: `'${w.body}'`, fontWeight: 700, fontSize: 13 },
      previewTag: { alignSelf: 'flex-start', padding: '3px 8px', borderRadius: 8, background: w.accent2, color: P.contrast(w.accent2, '#FFFFFF') >= 3 ? '#FFFFFF' : '#111111', fontFamily: `'${w.body}'`, fontWeight: 600, fontSize: 11 },
      previewName: w.name.trim() || 'Your brand',
      back: () => this.wizSet({ step: Math.max(1, w.step - 1) }), next: () => this.wizSet({ step: Math.min(3, w.step + 1) }), finish: this.wizFinish, close: this.closeWizard,
      finishLabel: w.editId ? 'Save brand' : 'Create brand'
    };
  }

  renderVals() {
    const st = this.state, P = this.P, R = this.R, h = React.createElement;
    const layout = this.layout, phone = layout === 'phone', tablet = layout === 'tablet';
    const base = { loading: !st.ready, loadingText: st.loadError ? 'Could not start: ' + st.loadError : 'Warming up the studio…', isHome: false, isEditor: false, hasBusy: !!st.busy, busyText: st.busy || '', hasToast: !!st.toast, toastText: st.toast || '',
      dialog: st.dialog ? { open: true, title: st.dialog.title, body: st.dialog.body || '', hasBody: !!st.dialog.body, hasInput: !!st.dialog.input, value: st.dialogValue, placeholder: st.dialog.input ? st.dialog.input.placeholder || '' : '',
        onValue: e => this.setState({ dialogValue: e.target.value }), onKey: e => { if (e.key === 'Enter') { e.preventDefault(); this.dialogDone(true); } },
        confirmLabel: st.dialog.confirmLabel, cancelLabel: st.dialog.cancelLabel, confirm: () => this.dialogDone(true), cancel: () => this.dialogDone(false), onOpenChange: o => { if (!o) this.dialogDone(false); },
        confirmStyle: { height: 38, padding: '0 16px', borderRadius: 9, border: 'none', background: st.dialog.danger ? '#B23A22' : 'var(--pw-accent)', color: '#FFFFFF', fontWeight: 700, fontSize: 14, cursor: 'pointer' } } : { open: false },
      repoURL: 'https://github.com/theanam/pinwheel-studio', hasHelp: st.helpOpen, toggleHelp: this.toggleHelp, stopClick: this.stopClick, helpVersion: 'Pinwheel Studio ' + (import.meta.env.VITE_APP_VERSION || '1.0'),
      toggleTheme: this.toggleTheme, themeGlyph: this.isDark() ? '☀' : '☾', themeTitle: this.isDark() ? 'Switch to light mode' : 'Switch to dark mode',
      phone, tablet, desktop: layout === 'desktop',
      setImgInput: this.setImgInput, setFileInput: this.setFileInput, setLogoInput: this.setLogoInput, setBrandAssetInput: this.setBrandAssetInput, setFontInput: this.setFontInput, onImageFile: this.onImageFile, onProjectFile: this.onProjectFile, onLogoFile: this.onLogoFile, onBrandAssetFile: this.onBrandAssetFile, onFontFile: this.onFontFile, openFile: this.openFile,
      hasWiz: !!st.wiz, wiz: st.ready ? this.wizVals() : null, wizCardStyle: phone ? { position: 'fixed', inset: 0, borderRadius: 0, width: '100%', maxHeight: '100%', padding: '16px 16px calc(16px + env(safe-area-inset-bottom))' } : { width: 'min(720px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 40px)', borderRadius: 16, padding: 24 },
      menuOpen: !!st.menu, closeMenus: () => this.setState({ menu: null }) };
    if (!st.ready) return base;
    const cat = P.catalog();
    if (st.screen === 'home') {
      const q = st.galQ.trim().toLowerCase();
      const explicit = !!q || !!st.galOcc;
      const list = this.ranked(!explicit).filter(t => (st.galCat === 'All' || t.cat === st.galCat) && (!st.galOcc || t.topic === st.galOcc) && (!q || q.split(/\s+/).every(w => t.search.includes(w))));
      const soon = this.S.upcoming(Object.keys(this.S.SENSITIVE)).map(x => ({ ...x, name: P.TOPIC[x.id].name }));
      const rowH = this.props.galleryRowHeight ?? (phone ? 136 : 190);
      const cats = ['All', ...new Set(P.FORMATS.map(f => f.cat))];
      const recH = phone ? 110 : 140, recMax = phone ? 8 : 12;
      const b = st.brand;
      return { ...base, isHome: true, onHomeDrop: this.onHomeDrop, onHomeDragOver: e => { if ([...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault(); },
        // Spacing and type scale shrink with the viewport; the structure stays the same.
        headerStyle: { display: 'flex', alignItems: 'center', gap: phone ? 8 : 18, padding: phone ? '10px 16px' : '12px 32px', borderBottom: '1px solid var(--pw-line)', background: 'var(--pw-panel)', position: 'sticky', top: 0, zIndex: 10 },
        mainStyle: { maxWidth: 1360, margin: '0 auto', padding: phone ? '22px 16px 80px' : tablet ? '32px 24px 96px' : '40px 32px 96px', display: 'flex', flexDirection: 'column', gap: phone ? 26 : 36 },
        h1Style: { margin: 0, fontSize: phone ? 28 : tablet ? 34 : 40, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700, textWrap: 'pretty' },
        rowStyle: phone ? { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollSnapType: 'x proximity' } : { display: 'flex', flexWrap: 'wrap', gap: 10 },
        openLabel: phone ? 'Open' : 'Open .pinwheel file',
        statLine: `${cat.length.toLocaleString()} templates across ${P.FORMATS.length} formats · ${P.LAYOUTS.length} layouts, ${P.PALETTES.length} palettes and ${P.PAIRINGS.length} type pairings — every one fully editable.`,
        galQ: st.galQ, onGalQ: e => { this.noteQuery(e.target.value); this.setState({ galQ: e.target.value, galLimit: 48 }); },
        galHint: !explicit && soon.length ? 'Coming up: ' + soon.map(x => x.days === 0 ? `${x.name} today` : `${x.name} in ${x.days} day${x.days === 1 ? '' : 's'}`).join(' · ') : '',
        // Recents: every design touched on this device, newest first, drawn live from
        // its first page. Nothing here was necessarily saved as a file.
        hasRecents: st.recents.length > 0, recentsCount: `${st.recents.length} on this device`, clearRecents: this.clearRecents,
        recents: st.recents.slice(0, st.recentsAll ? this.DB.RECENTS_MAX : recMax).map(r => {
          const ar = (r.w || 1) / (r.h || 1); const w = Math.round(Math.max(recH * .6, Math.min(recH * ar, recH * 2.2)));
          const key = `rec|${r.id}|${r.updated}|${w}|${recH}`; let thumb = this.thumbCache.get(key);
          if (!thumb) { try { thumb = R.renderThumb(h, { w: r.w, h: r.h }, r.preview.page, w, recH, { assets: r.preview.assets || {} }); } catch (e) { thumb = null; } this.thumbCache.set(key, thumb); }
          const f = P.FORMAT[r.fmt];
          return { name: r.name || 'Untitled', meta: `${f ? f.name : `${r.w} × ${r.h}`}${r.pages > 1 ? ` · ${r.pages} pages` : ''} · ${this.B.ago(r.updated)}`, title: 'Open ' + (r.name || 'Untitled'), thumb, onClick: () => this.openRecent(r.id), onDelete: e => { e.stopPropagation(); this.deleteRecent(r.id); },
            cardStyle: { width: w, display: 'flex', flexDirection: 'column', gap: 5, padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', flex: 'none', position: 'relative', scrollSnapAlign: 'start' },
            boxStyle: { width: w, height: recH, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pw-canvas)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(36,33,29,.08), 0 4px 14px rgba(36,33,29,.06)' } };
        }),
        recentsHasMore: st.recents.length > recMax, recentsMoreLabel: st.recentsAll ? 'Show fewer' : `All ${st.recents.length} →`, toggleRecents: () => this.setState(s => ({ recentsAll: !s.recentsAll })),
        recentsRowStyle: phone ? { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x proximity' } : { display: 'flex', flexWrap: 'wrap', gap: '22px 18px', alignItems: 'flex-start' },
        // Brands: none (templates in their own style), or one whose colours and fonts
        // restyle every template preview and every design opened from here.
        brandCards: st.brands.map(x => { const on = st.brandOn && x.id === b.id; const logo = x.logo && x.assets[x.logo]; return { name: x.name, on, hint: on ? 'Previewing templates in this brand' : 'Tap to preview templates in this brand', hasLogo: !!logo, logoStyle: { width: 40, height: 40, borderRadius: 8, flex: 'none', background: x.bg, backgroundImage: logo ? `url("${logo.src}")` : 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', border: '1px solid var(--pw-line-soft)' }, sw: [x.bg, x.ink, x.accent, x.accent2].map(c => ({ flex: 1, background: c })), onClick: () => this.useBrand(x.id), onEdit: e => { e.stopPropagation(); this.startWizard(x.id); },
          style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px 10px 10px', borderRadius: 12, border: '1px solid ' + (on ? 'var(--pw-accent-line)' : 'var(--pw-line)'), background: on ? 'var(--pw-accent-tint)' : 'var(--pw-surface)', cursor: 'pointer', textAlign: 'left', color: 'var(--pw-ink)', flex: 'none', minWidth: phone ? 200 : 220, scrollSnapAlign: 'start' } }; }),
        noBrandOn: !st.brandOn, useNoBrand: () => this.useBrand(null),
        noBrandStyle: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 10px 10px', borderRadius: 12, border: '1px solid ' + (!st.brandOn ? 'var(--pw-accent-line)' : 'var(--pw-line)'), background: !st.brandOn ? 'var(--pw-accent-tint)' : 'var(--pw-surface)', cursor: 'pointer', textAlign: 'left', color: 'var(--pw-ink)', flex: 'none', scrollSnapAlign: 'start' },
        brandNote: st.brandOn ? `Previewing in ${b.name}’s colours and fonts` : '', clearBrandNote: () => this.useBrand(null),
        newBrand: () => this.startWizard(), importBrand: this.openFile,
        fmts: (st.fmtsAll ? P.FORMATS : P.FORMATS.slice(0, 12)).map(f => { const s = 28 / Math.max(f.w, f.h); return { name: f.name, dims: `${f.w} × ${f.h}`, onClick: () => this.newDoc(f.id), iconStyle: { width: Math.max(6, f.w * s), height: Math.max(6, f.h * s), border: '1.5px solid var(--pw-ink)', borderRadius: 2 } }; }),
        fmtsHasMore: P.FORMATS.length > 12, fmtsMoreLabel: st.fmtsAll ? 'Show fewer' : `All ${P.FORMATS.length} formats →`, toggleFmts: () => this.setState(s => ({ fmtsAll: !s.fmtsAll })),
        customW: st.customW, customH: st.customH, onCustomW: e => this.setState({ customW: e.target.value }), onCustomH: e => this.setState({ customH: e.target.value }), createCustom: () => this.newDoc(null, +st.customW, +st.customH),
        galOccs: [{ id: null, name: 'Any' }, ...P.OCCASIONS.map(id => P.TOPIC[id]).map(o => { const up = soon.find(x => x.id === o.id); return { ...o, up, order: !this.S.SENSITIVE[o.id] ? 0 : up ? 1 : 2 }; }).sort((a, b) => a.order - b.order || (a.up && b.up ? a.up.days - b.up.days : 0))].map(o => ({ label: o.up ? `${o.name} · ${o.up.days === 0 ? 'today' : o.up.days + 'd'}` : o.name, onClick: () => { this.note('topic', o.id, 1); this.setState({ galOcc: o.id, galLimit: 48 }); }, style: { height: 30, padding: '0 12px', borderRadius: 15, border: '1px solid ' + (st.galOcc === o.id ? 'var(--pw-accent-line)' : 'var(--pw-line-2)'), background: st.galOcc === o.id ? 'var(--pw-accent-tint)' : 'var(--pw-surface)', color: st.galOcc === o.id ? 'var(--pw-accent-deep)' : 'var(--pw-ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flex: 'none' } })),
        galCats: cats.map(c => ({ label: c, onClick: () => this.setState({ galCat: c, galLimit: 48 }), style: { height: 32, padding: '0 14px', borderRadius: 16, border: '1px solid ' + (st.galCat === c ? 'var(--pw-ink)' : 'var(--pw-line-2)'), background: st.galCat === c ? 'var(--pw-ink)' : 'var(--pw-surface)', color: st.galCat === c ? 'var(--pw-surface)' : 'var(--pw-ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flex: 'none' } })),
        chipRowStyle: phone ? { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' } : { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
        galCount: `${list.length.toLocaleString()} ${st.galOcc ? P.TOPIC[st.galOcc].name.toLowerCase() + ' ' : ''}${st.galCat === 'All' ? '' : st.galCat + ' '}templates`,
        galItems: list.slice(0, st.galLimit).map(t => { const ar = t.w / t.h; const w = Math.round(Math.min(rowH * ar, rowH * 2.5)); return { name: t.name, title: `${t.name} — ${t.layoutName}`, meta: `${t.fmtName} · ${t.layoutName}`, onClick: () => this.fromTemplate(t), thumb: this.thumbFor(t, w, rowH),
          cardStyle: { width: w, display: 'flex', flexDirection: 'column', gap: 5, padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', flex: 'none' },
          boxStyle: { width: w, height: rowH, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pw-canvas)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(36,33,29,.08), 0 4px 14px rgba(36,33,29,.06)' } }; }),
        galGridStyle: { display: 'flex', flexWrap: 'wrap', gap: phone ? '18px 12px' : '28px 22px', alignItems: 'flex-start' },
        galEmpty: !list.length, galHasMore: list.length > st.galLimit, galMore: () => this.setState(s => ({ galLimit: s.galLimit + 48 }))
      };
    }
    const d = st.doc, z = st.zoom, C = this.CORAL;
    const panels = [['templates', 'Templates', '▦'], ['styles', 'Styles', '◐'], ['elements', 'Elements', '△'], ['text', 'Text', 'T'], ['uploads', 'Uploads', '⇪'], ['data', 'Charts', '▥'], ['brand', 'Brand', '◆'], ['layers', 'Layers', '☰']];
    const canPick = this.IO.canPick(), mobile = this.IO.isMobile();
    // Menus hang from the top bar on a desktop and rise from the bottom on a phone.
    const popover = (pos, w) => phone ? { position: 'fixed', left: 8, right: 8, bottom: 'calc(68px + env(safe-area-inset-bottom))', maxHeight: '64vh', overflow: 'auto', zIndex: 31, display: 'flex', flexDirection: 'column', background: 'var(--pw-surface)', border: '1px solid var(--pw-line)', borderRadius: 14, boxShadow: '0 12px 32px rgba(36,33,29,.18)', padding: 8 }
      : { position: 'absolute', top: 46, ...pos, width: w, maxHeight: '70vh', overflow: 'auto', background: 'var(--pw-surface)', border: '1px solid var(--pw-line)', borderRadius: 12, boxShadow: '0 12px 32px rgba(36,33,29,.14)', padding: 6, zIndex: 31, display: 'flex', flexDirection: 'column' };
    const saveLabel = canPick && this.fileHandle ? 'Save' : mobile ? 'Share .pinwheel' : 'Save .pinwheel';
    const v = { ...base, isEditor: true, goHome: this.goHome,
      docName: d.name, onDocName: e => { const n = e.target.value; this.setState(s => ({ doc: { ...s.doc, name: n } })); },
      undo: this.undo, redo: this.redo,
      undoStyle: { width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 18, color: this.hist.length ? 'var(--pw-ink)' : 'var(--pw-disabled)' }, redoStyle: { width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 18, color: this.fut.length ? 'var(--pw-ink)' : 'var(--pw-disabled)' },
      sizeLabel: `${d.w}×${d.h}`, zoomLabel: Math.round(z * 100) + '%', zoomIn: () => this.setZoom(z * 1.2), zoomOut: () => this.setZoom(z / 1.2), zoomFit: this.fitZoom,
      menuOpen: !!st.menu, closeMenus: () => this.setState({ menu: null }),
      toggleFile: () => this.setState(s => ({ menu: s.menu === 'file' ? null : 'file' })), toggleResize: () => this.setState(s => ({ menu: s.menu === 'resize' ? null : 'resize' })), toggleExport: () => this.setState(s => ({ menu: s.menu === 'export' ? null : 'export' })),
      fileOpen: st.menu === 'file', resizeOpen: st.menu === 'resize', exportOpen: st.menu === 'export', saveProject: this.saveProject, saveLabel: canPick && this.fileHandle ? 'Save' : 'Save',
      saveTitle: canPick && this.fileHandle ? `Save to ${this.fileHandle.name} (⌘S)` : 'Save .pinwheel (⌘S)',
      fileMenuStyle: popover({ left: 120 }, 260), resizeMenuStyle: popover({ left: 170 }, 340), exportMenuStyle: { ...popover({ right: 12 }, 300), padding: 12, gap: 10 },
      fileItems: [
        { label: 'New design', hint: '', onClick: this.goHome }, { label: 'Open .pinwheel…', hint: '', onClick: this.openFile },
        { label: saveLabel, hint: '⌘S', onClick: () => this.saveProject(false) },
        ...(canPick ? [{ label: 'Save as…', hint: '⇧⌘S', onClick: this.saveProjectAs }] : []),
        { label: 'Import image…', hint: '', onClick: () => { this.setState({ menu: null }); this.imgInput && this.imgInput.click(); } }, { label: 'Help & support', hint: '', onClick: this.toggleHelp }],
      // Phone: one overflow menu holds what the desktop top bar spreads out.
      phoneMenuOpen: st.menu === 'phone', togglePhoneMenu: () => this.setState(s => ({ menu: s.menu === 'phone' ? null : 'phone' })),
      phoneMenuItems: [
        { label: 'Export…', hint: 'PDF, PNG, JPG, SVG', onClick: () => this.setState({ menu: 'export' }) },
        { label: saveLabel, hint: 'Editable file', onClick: () => this.saveProject(false) },
        { label: 'Open .pinwheel…', hint: '', onClick: this.openFile },
        { label: 'Resize…', hint: `${d.w}×${d.h}`, onClick: () => this.setState({ menu: 'resize' }) },
        { label: 'Import image…', hint: '', onClick: () => { this.setState({ menu: null }); this.imgInput && this.imgInput.click(); } },
        { label: this.isDark() ? 'Light mode' : 'Dark mode', hint: '', onClick: () => { this.toggleTheme(); this.setState({ menu: null }); } },
        { label: 'Help & support', hint: '', onClick: this.toggleHelp },
        { label: 'Source on GitHub', hint: 'theanam/pinwheel-studio', onClick: () => { this.setState({ menu: null }); window.open('https://github.com/theanam/pinwheel-studio', '_blank', 'noopener'); } }],
      canRelayout: !!d.tpl, toggleRelayout: () => this.setState(s => ({ relayout: !s.relayout })), relayoutBox: { width: 16, height: 16, borderRadius: 4, flex: 'none', marginTop: 2, border: '1.5px solid ' + (st.relayout ? C : 'var(--pw-line-strong)'), background: st.relayout ? C : 'var(--pw-surface)' },
      resizeItems: P.FORMATS.map(f => ({ label: f.name, dims: `${f.w}×${f.h}`, onClick: () => this.resizeDoc(f.id), style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, height: 34, padding: '0 10px', border: 'none', background: f.id === d.fmt ? 'var(--pw-accent-tint)' : 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 13.5, color: 'var(--pw-ink)', textAlign: 'left', flex: 'none' } })),
      scaleOpts: [[1, 'Standard'], [2, 'High'], [3, 'Print']].map(([s, l]) => ({ label: `${l} ${s}×`, onClick: () => this.setState({ exportScale: s }), style: this.segStyle(st.exportScale === s) })),
      exportItems: [
        { label: 'PDF', hint: `All ${d.pages.length} page${d.pages.length > 1 ? 's' : ''} in one document`, onClick: () => this.doExport('pdf', 'all') },
        { label: 'PNG', hint: d.pages.length > 1 ? 'Every page, zipped' : 'Transparent-ready image', onClick: () => this.doExport('png', 'all') },
        { label: 'PNG · current page', hint: `Page ${st.page + 1} only`, onClick: () => this.doExport('png', 'page') },
        { label: 'JPG', hint: 'Smaller files for social', onClick: () => this.doExport('jpg', 'all') },
        { label: 'SVG', hint: 'Scalable, fonts embedded', onClick: () => this.doExport('svg', 'all') },
        { label: 'Pinwheel project (.pinwheel)', hint: 'Editable file with all assets', onClick: this.saveProject }
      ],
      rail: panels.map(([id, label, glyph]) => { const on = st.panel === id; return { label, glyph, onClick: () => this.setState(s => ({ panel: s.panel === id ? null : id, propsOpen: false })), style: phone
        ? { flex: '1 0 64px', height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', borderRadius: 10, cursor: 'pointer', background: on ? 'var(--pw-accent-tint)' : 'transparent', color: on ? 'var(--pw-accent-deep)' : 'var(--pw-text-2)', padding: 0 }
        : { width: tablet ? 56 : 64, height: tablet ? 52 : 58, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, border: 'none', borderRadius: 10, cursor: 'pointer', background: on ? 'var(--pw-accent-tint)' : 'transparent', color: on ? 'var(--pw-accent-deep)' : 'var(--pw-text-2)' } }; }),
      railStyle: { width: tablet ? 64 : 76, flex: 'none', background: 'var(--pw-panel)', borderRight: '1px solid var(--pw-line)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 2, overflowY: 'auto' },
      tabbarStyle: { flex: 'none', display: 'flex', overflowX: 'auto', gap: 2, padding: '4px 6px calc(4px + env(safe-area-inset-bottom))', background: 'var(--pw-panel)', borderTop: '1px solid var(--pw-line)', zIndex: 22 },
      // The flyout: a column on a desktop, floating over the canvas on a tablet, a
      // bottom sheet on a phone. The properties panel likewise.
      panelStyle: phone ? { position: 'absolute', left: 0, right: 0, bottom: 0, height: '58%', zIndex: 21, background: 'var(--pw-panel)', borderTop: '1px solid var(--pw-line)', borderRadius: '14px 14px 0 0', boxShadow: '0 -8px 30px rgba(36,33,29,.14)', display: 'flex', flexDirection: 'column', minHeight: 0 }
        : tablet ? { position: 'absolute', left: 64, top: 0, bottom: 0, width: 300, zIndex: 21, background: 'var(--pw-panel)', borderRight: '1px solid var(--pw-line)', boxShadow: '8px 0 30px rgba(36,33,29,.08)', display: 'flex', flexDirection: 'column', minHeight: 0 }
        : { width: 320, flex: 'none', background: 'var(--pw-panel)', borderRight: '1px solid var(--pw-line)', display: 'flex', flexDirection: 'column', minHeight: 0 },
      propsStyle: phone ? { position: 'absolute', left: 0, right: 0, bottom: 0, height: '58%', zIndex: 21, background: 'var(--pw-panel)', borderTop: '1px solid var(--pw-line)', borderRadius: '14px 14px 0 0', boxShadow: '0 -8px 30px rgba(36,33,29,.14)', display: 'flex', flexDirection: 'column', minHeight: 0 }
        : { width: tablet ? 264 : 292, flex: 'none', background: 'var(--pw-panel)', borderLeft: '1px solid var(--pw-line)', display: 'flex', flexDirection: 'column', minHeight: 0 },
      showProps: !phone || st.propsOpen, propsOpen: st.propsOpen, closeProps: () => this.setState({ propsOpen: false }), showPill: phone && !st.panel && !st.propsOpen && !st.menu && !st.wiz && !st.helpOpen,
      togglePropsSheet: () => this.setState(s => ({ propsOpen: !s.propsOpen, panel: s.propsOpen ? s.panel : null })),
      propsPill: st.sel.length ? 'Edit' : 'Page', propsPillStyle: { position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', zIndex: 20, height: 40, padding: '0 18px', borderRadius: 20, border: 'none', background: 'var(--pw-ink)', color: 'var(--pw-surface)', fontWeight: 700, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,.22)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
      canvasPadStyle: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: phone ? 18 : 28, padding: phone ? '16px 16px 90px' : '36px 48px 64px', minWidth: 'max-content' },
      onCanvasPointerDownCapture: this.onCanvasPointerDownCapture,
      panelOpen: !!st.panel, panelTitle: (panels.find(p => p[0] === st.panel) || [])[1] || '', closePanel: () => this.setState({ panel: null }),
      pTemplates: st.panel === 'templates', pStyles: st.panel === 'styles', pElements: st.panel === 'elements', pText: st.panel === 'text', pUploads: st.panel === 'uploads', pData: st.panel === 'data', pBrand: st.panel === 'brand', pLayers: st.panel === 'layers',
      setCanvasRef: this.setCanvasRef, onCanvasDown: this.onCanvasDown, onCanvasDrop: this.onCanvasDrop, onCanvasDragOver: this.onCanvasDragOver,
      addPageEnd: () => this.addPage(d.pages.length - 1),
      addPageStyle: { width: Math.max(220, d.w * z), height: 44, borderRadius: 10, border: '1.5px dashed var(--pw-line-strong)', background: 'transparent', color: 'var(--pw-muted)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }
    };
    if (st.panel === 'templates') {
      const q = st.tplQ.trim().toLowerCase();
      const list = this.ranked(!q).filter(t => (!st.tplSame || t.fmt === d.fmt) && (!q || q.split(/\s+/).every(w => t.search.includes(w))));
      Object.assign(v, { tplQ: st.tplQ, onTplQ: e => { this.noteQuery(e.target.value); this.setState({ tplQ: e.target.value, tplLimit: 24 }); },
        tplScopes: [[true, P.FORMAT[d.fmt] ? 'This size' : 'This size (none)'], [false, 'All sizes']].map(([val, l]) => ({ label: l, onClick: () => this.setState({ tplSame: val, tplLimit: 24 }), style: this.segStyle(st.tplSame === val) })),
        tplItems: list.slice(0, st.tplLimit).map(t => ({ name: t.name, title: `${t.name} · ${t.layoutName} · ${t.fmtName}`, thumb: this.thumbFor(t, 136, 190), onClick: () => this.applyTemplate(t) })),
        tplHasMore: list.length > st.tplLimit, tplMore: () => this.setState(s => ({ tplLimit: s.tplLimit + 24 })) });
    }
    if (st.panel === 'styles') {
      Object.assign(v, { shuffleStyle: this.shuffleStyle,
        hasBrandPals: st.brand.palettes.length > 0, brandPalItems: st.brand.palettes.map(p => ({ name: p.name, onClick: () => this.applyPalette(p), sw: [p.bg, p.ink, p.accent, p.accent2].map(c => ({ flex: 1, background: c })), style: { display: 'flex', flexDirection: 'column', gap: 6, padding: 7, border: '1px solid ' + (d.theme.id === p.id ? C : 'var(--pw-line-soft)'), background: 'var(--pw-surface)', borderRadius: 9, cursor: 'pointer', textAlign: 'left' } })),
        palItems: P.PALETTES.map(p => ({ name: p.name, onClick: () => this.applyPalette(p), sw: [p.bg, p.ink, p.accent, p.accent2].map(c => ({ flex: 1, background: c })), style: { display: 'flex', flexDirection: 'column', gap: 6, padding: 7, border: '1px solid ' + (d.theme.id === p.id ? C : 'var(--pw-line-soft)'), background: 'var(--pw-surface)', borderRadius: 9, cursor: 'pointer', textAlign: 'left' } })),
        pairItems: P.PAIRINGS.map(p => ({ display: p.name, body: `${p.display} + ${p.body}`, onClick: () => this.applyPairing(p), dStyle: { fontFamily: `'${p.display}'`, fontWeight: p.dw, fontSize: 22, lineHeight: 1.1, textTransform: p.upper ? 'uppercase' : 'none', letterSpacing: p.track + 'em', color: 'var(--pw-ink)' }, bStyle: { fontFamily: `'${p.body}'`, fontSize: 12, color: 'var(--pw-muted)' }, style: { display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start', padding: '10px 12px', border: '1px solid ' + (d.theme.pairId === p.id ? C : 'var(--pw-line-soft)'), background: 'var(--pw-surface)', borderRadius: 9, cursor: 'pointer', textAlign: 'left' } })) });
    }
    if (st.panel === 'elements') {
      const ink = this.cssVar('--pw-ink'), C = this.cssVar('--pw-accent');
      Object.assign(v, {
        shapeItems: [...R.SHAPES.map(s => [s, {}]), ['star', { name: 'Sparkle', points: 4, inner: .32 }]].map(([s, x]) => { const [name, ar] = R.SHAPE_INFO[s], w = ar >= 1 ? 40 : 40 * ar, hh = ar >= 1 ? 40 / ar : 40; return { label: x.name || name, onClick: () => this.addShape(s, x), thumb: this.miniEl({ type: 'shape', shape: s, w, h: hh, fill: ['rect', 'ellipse', 'heart', 'star', 'cloud', 'bolt'].includes(s) ? C : ink, points: s === 'burst' ? 14 : s === 'gear' ? 8 : 5, inner: s === 'burst' ? .78 : s === 'ring' ? .62 : .5, sides: 6, ...x }) }; }),
        lineItems: [['Line', {}], ['Dashed', { dash: true }], ['Arrow', { arrow: true }]].map(([l, o]) => ({ label: l, onClick: () => this.addLine(o), thumb: this.miniEl({ type: 'line', w: 60, h: 10, stroke: ink, sw: 3, ...o }, 64) })),
        frameItems: [['Square image', 'none'], ['Rounded image', 'rounded'], ['Circle image', 'circle'], ['Arch image', 'arch']].map(([l, m]) => ({ label: l, onClick: () => this.addFrame(m), thumb: this.miniEl({ type: 'image', w: 38, h: m === 'arch' ? 46 : 38, mask: m, tint: '#E3DED6', label: ' ', filters: P.NOFILTER }) }))
      });
    }
    if (st.panel === 'text') {
      const t = d.theme;
      Object.assign(v, {
        textBtns: [['heading', 'Add a heading', { fontFamily: `'${t.display}'`, fontSize: 24, fontWeight: this.ONEW.includes(t.display) ? 400 : 700 }], ['sub', 'Add a subheading', { fontFamily: `'${t.body}'`, fontSize: 17, fontWeight: 700 }], ['body', 'Add body text', { fontFamily: `'${t.body}'`, fontSize: 14, fontWeight: 400 }]].map(([k, l, fs]) => ({ label: l, onClick: () => this.addText(k), style: { ...fs, textAlign: 'left', padding: '12px 14px', border: '1px solid var(--pw-line-soft)', background: 'var(--pw-surface)', borderRadius: 9, cursor: 'pointer', color: 'var(--pw-ink)' } })),
        styleItems: [...st.brand.textStyles, ...this.TEXT_STYLES].map(sty => { const pr = this.styleProps(sty, 26); const css = R.textStyle({ ...pr, size: 26, lh: 1, align: 'center' }); return { label: sty.custom ? sty.name + ' ◆' : sty.name, sample: 'Aa', onClick: () => this.applyTextStyle(sty), style: { ...css, display: 'block', padding: pr.bg ? '2px 8px' : 0, borderRadius: pr.bg ? 6 : 0, whiteSpace: 'nowrap' } }; }),
        comboItems: P.PAIRINGS.map(p => ({ display: p.upper ? 'HELLO' : 'Hello', body: p.display + ' · ' + p.body, onClick: () => this.addCombo(p), dStyle: { fontFamily: `'${p.display}'`, fontWeight: p.dw, fontSize: 24, lineHeight: 1.1, letterSpacing: p.track + 'em' }, bStyle: { fontFamily: `'${p.body}'`, fontSize: 10.5, color: 'var(--pw-muted)', textAlign: 'center' } }))
      });
    }
    if (st.panel === 'uploads') Object.assign(v, { uploadClick: () => { this.replaceTarget = null; this.imgInput && this.imgInput.click(); }, noUploads: !st.uploads.length, uploadItems: st.uploads.filter(id => st.assets[id]).map(id => ({ imgStyle: { width: '100%', height: '100%', backgroundImage: `url("${st.assets[id].src}")`, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }, onClick: () => this.addImageAsset(id), onDragStart: e => { e.dataTransfer.setData('text/pw-asset', id); e.dataTransfer.effectAllowed = 'copy'; } })) });
    if (st.panel === 'data') {
      const t = d.theme; const mk = type => this.miniEl({ type: 'chart', chart: type, w: 96, h: 60, data: [{ l: '', v: 3 }, { l: '', v: 5 }, { l: '', v: 4 }, { l: '', v: 7 }], colors: [C, 'var(--pw-ink)', 'var(--pw-line-strong)', 'var(--pw-line)'], ink: 'var(--pw-ink)', font: 'Source Sans 3', labels: false, hole: 'var(--pw-surface)' }, 100);
      Object.assign(v, { chartItems: [['bar', 'Bar'], ['line', 'Line'], ['pie', 'Pie'], ['donut', 'Donut']].map(([k, l]) => ({ label: l, thumb: mk(k), onClick: () => this.addChart(k) })), addQR: this.addQR, qrThumb: this.miniEl({ type: 'qr', w: 44, h: 44, value: 'pinwheel', fg: 'var(--pw-ink)', qbg: 'var(--pw-surface)' }, 48) });
    }
    if (st.panel === 'brand') {
      const b = st.brand; const setB = (k, val) => this.setBrand({ [k]: val }); const t = d.theme;
      const small = { height: 30, padding: '0 10px', borderRadius: 7, border: '1px solid var(--pw-line-2)', background: 'var(--pw-surface)', color: 'var(--pw-ink)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', flex: '1 1 auto' };
      const tiny = { width: 22, height: 22, borderRadius: 11, border: 'none', background: 'rgba(0,0,0,.55)', color: '#FFF', fontSize: 11, cursor: 'pointer', padding: 0, lineHeight: 1 };
      const canSaveStyle = this.selEls().some(e => e.type === 'text');
      Object.assign(v, {
        brandSelect: this.selectEl(b.id, [...st.brands.map(x => ({ value: x.id, label: x.name })), { value: '__new', label: '＋ New brand…' }], e => e.target.value === '__new' ? this.startWizard() : this.activateBrand(e.target.value), { height: 36, border: '1px solid var(--pw-line-2)', borderRadius: 8, padding: '0 8px', fontSize: 14, fontWeight: 600, background: 'var(--pw-surface)', width: '100%' }),
        brandActions: [['Rename', this.renameBrand], ['Duplicate', this.duplicateBrand], ['Delete', this.deleteBrand, 'danger']].map(([label, onClick, kind]) => ({ label, onClick, style: { ...small, color: kind === 'danger' ? '#B23A22' : 'var(--pw-ink)' } })),
        brandKitActions: [['Download brand kit', this.exportBrandKit, 'Everything in this brand as one .pinwheel file'], ['Import brand kit…', this.openFile, 'Open a .pinwheel brand kit from another device']].map(([label, onClick, title]) => ({ label, onClick, title, style: small })),
        brandBuilder: () => this.startWizard(b.id, b.logo ? 2 : 1), brandBuilderLabel: b.logo ? 'Generate colours from logo…' : 'Brand builder…',
        brandColors: [['bg', 'Background'], ['ink', 'Text'], ['accent', 'Primary'], ['accent2', 'Secondary']].map(([k, l]) => ({ label: l, value: b[k], onChange: e => setB(k, e.target.value.toUpperCase()) })),
        brandPals: b.palettes.map(p => ({ name: p.name, sw: [p.bg, p.ink, p.accent, p.accent2].map(c => ({ flex: 1, background: c })), onApply: () => this.applyPalette(p), onUse: () => { this.setBrand({ bg: p.bg, ink: p.ink, accent: p.accent, accent2: p.accent2 }); this.toast('Brand colours updated'); }, onRemove: () => this.setBrand({ palettes: b.palettes.filter(x => x.id !== p.id) }), style: { display: 'flex', flexDirection: 'column', gap: 6, padding: 8, border: '1px solid ' + (t.id === p.id ? C : 'var(--pw-line-soft)'), background: 'var(--pw-surface)', borderRadius: 9 } })),
        noPals: !b.palettes.length, savePalette: this.savePaletteToBrand,
        brandFonts: [['heading', 'Headings'], ['body', 'Body']].map(([k, l]) => ({ label: l, value: b[k], selectNode: this.fontPickerEl('font:' + k, b[k], val => setB(k, val), true) })),
        uploadFont: this.uploadFont, noFonts: !Object.keys(b.fonts || {}).length,
        brandFontItems: Object.entries(b.fonts || {}).map(([id, f]) => ({ label: f.family, file: f.name, sampleStyle: { fontFamily: `'${f.family}'`, fontSize: 20, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, isHeading: b.heading === f.family, isBody: b.body === f.family,
          onHeading: () => setB('heading', f.family), onBody: () => setB('body', f.family), onRemove: () => this.removeBrandFont(id),
          hStyle: { ...small, flex: 'none', padding: '0 8px', background: b.heading === f.family ? 'var(--pw-accent-tint)' : 'var(--pw-surface)' }, bStyle: { ...small, flex: 'none', padding: '0 8px', background: b.body === f.family ? 'var(--pw-accent-tint)' : 'var(--pw-surface)' } })),
        brandStyles: b.textStyles.map(sty => { const pr = this.styleProps(sty, 22); const css = R.textStyle({ ...pr, size: 22, lh: 1, align: 'center' }); return { label: sty.name, onClick: () => this.applyTextStyle(sty), onRemove: e => { e.stopPropagation(); this.setBrand({ textStyles: b.textStyles.filter(x => x.id !== sty.id) }); }, style: { ...css, display: 'block', padding: pr.bg ? '2px 8px' : 0, borderRadius: pr.bg ? 6 : 0, whiteSpace: 'nowrap' } }; }),
        noStyles: !b.textStyles.length, saveStyle: this.saveTextStyleToBrand, canSaveStyle, saveStyleStyle: { ...small, flex: 'none', opacity: canSaveStyle ? 1 : .5 },
        hasLogo: !!(b.logo && st.assets[b.logo]), logoStyle: { width: '100%', height: '100%', backgroundImage: b.logo && st.assets[b.logo] ? `url("${st.assets[b.logo].src}")` : 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }, addLogo: this.addLogo,
        uploadLogo: this.uploadLogo, logoBtnLabel: b.logo ? 'Replace logo' : 'Upload logo',
        brandAssets: Object.entries(b.assets).filter(([id]) => st.assets[id]).map(([id, a]) => ({ title: a.name || 'Brand image', isLogo: b.logo === id, imgStyle: { width: '100%', height: '100%', backgroundImage: `url("${st.assets[id].src}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', pointerEvents: 'none' }, onClick: () => this.addImageAsset(id), onDragStart: e => { e.dataTransfer.setData('text/pw-asset', id); e.dataTransfer.effectAllowed = 'copy'; },
          onLogo: e => { e.stopPropagation(); setB('logo', b.logo === id ? null : id); }, onRemove: e => { e.stopPropagation(); this.removeBrandAsset(id); }, logoBtnStyle: { ...tiny, background: b.logo === id ? C : 'rgba(0,0,0,.55)' }, removeBtnStyle: tiny })),
        noAssets: !Object.keys(b.assets).length, uploadBrandAsset: () => this.pickBrandAsset('asset'),
        applyBrand: this.applyBrand
      });
    }
    if (st.panel === 'layers') {
      const pg = this.pg, over = st.layerOver, dragging = st.layerDrag, movingSel = dragging && st.sel.includes(dragging);
      Object.assign(v, { noLayers: !pg.els.length, layerHint: pg.els.length > 1 ? 'Drag to reorder — the top of the list is in front.' : '', layerItems: [...pg.els].reverse().map(el => { const on = st.sel.includes(el.id); const nm = el.type === 'text' ? el.text.slice(0, 32) : el.name || el.type; const ic = { width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', fontSize: 12 };
        const isMoving = dragging === el.id || (movingSel && on), isOver = !!over && over.id === el.id && !isMoving;
        return { label: nm, meta: [el.type, el.groupId ? 'grouped' : '', el.locked ? 'locked' : '', el.hidden ? 'hidden' : ''].filter(Boolean).join(' · '), onClick: () => this.setState({ sel: [el.id] }),
          onDragStart: e => this.layerDragStart(e, el.id), onDragOver: e => this.layerDragOver(e, el.id), onDrop: e => this.layerDrop(e, el.id), onDragEnd: this.layerDragEnd,
          eye: el.hidden ? '◌' : '●', lock: el.locked ? '▣' : '□', eyeStyle: { ...ic, color: el.hidden ? 'var(--pw-line-strong)' : 'var(--pw-text-2)' }, lockStyle: { ...ic, color: el.locked ? C : 'var(--pw-placeholder)' },
          onEye: () => this.setDoc((dd, p) => { const x = p.els.find(q => q.id === el.id); x.hidden = !x.hidden; }), onLock: () => this.setDoc((dd, p) => { const x = p.els.find(q => q.id === el.id); x.locked = !x.locked; }),
          // The drop indicator is a 2px accent line on the edge the drop would land on.
          style: { display: 'flex', alignItems: 'center', gap: 2, padding: '0 6px 0 4px', borderRadius: 8, background: on ? 'var(--pw-accent-tint)' : 'var(--pw-surface)', border: '1px solid ' + (on ? 'var(--pw-accent-tint-line)' : 'var(--pw-line-soft)'), opacity: isMoving ? .45 : 1, boxShadow: isOver ? `inset 0 ${over.above ? '' : '-'}2px 0 ${C}` : 'none', cursor: 'grab' } }; }) });
    }
    const opts = { interactive: true, assets: st.assets, editingId: st.editingId, onElDown: this.onElDown, onElDbl: this.onElDbl, onTextCommit: this.onTextCommit, onTextInput: this.onTextInput, onHover: this.onHover };
    v.pages = d.pages.map((p, i) => ({ ...this.overlay(i), label: `Page ${i + 1}`, onFocus: () => this.setState({ page: i, sel: [] }),
      labelStyle: { border: 'none', background: 'transparent', padding: '0 4px', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: i === st.page ? 'var(--pw-ink)' : 'var(--pw-muted-2)' },
      wrapStyle: { position: 'relative', width: d.w * z, height: d.h * z, boxShadow: i === st.page ? `0 0 0 2px ${C}, 0 8px 30px rgba(36,33,29,.12)` : '0 2px 10px rgba(36,33,29,.1)', flex: 'none', touchAction: 'none' },
      stageStyle: { position: 'absolute', left: 0, top: 0, width: d.w, height: d.h, transform: `scale(${z})`, transformOrigin: '0 0', overflow: 'hidden', cursor: st.cropMode ? 'move' : 'default' },
      node: R.renderPage(h, p, d, { ...opts, onPageDown: e => this.onPageDown(e, i) }),
      onUp: () => this.movePage(i, -1), onDown: () => this.movePage(i, 1), onDup: () => this.dupPage(i), onDel: () => this.delPage(i), onAdd: () => this.addPage(i) }));
    const pr = this.buildProps();
    v.propsTitle = pr.title; v.sections = pr.sections.map(s => ({ title: s.title, controls: s.controls.map(c => this.ctl(c)) }));
    return v;
  }

  render() {
    return StudioView(this.renderVals());
  }
}
