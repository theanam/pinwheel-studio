// Pinwheel Studio — on-device storage (spec §11: IndexedDB in production).
//
// Everything here stays in the browser until the user clears site data. Four
// object stores:
//   recents  the last RECENTS_MAX designs the user touched, saved or not: a light
//            record per design (name, size, when, page 1 with low-res assets) that
//            the home page lists and renders live thumbnails from
//   docs     the full document and assets for each recent, loaded on open
//   brands   every brand kit, with its assets inline
//   kv       small settings: the active brand
// If IndexedDB is unavailable (some private windows) the same API runs on memory,
// so the app keeps working for the session.
export const RECENTS_MAX = 100;
const NAME = 'pinwheel', VERSION = 1, STORES = ['recents', 'docs', 'brands', 'kv'];

let dbp = null, mem = null;
const memory = () => mem ||= Object.fromEntries(STORES.map(s => [s, new Map()]));
function open() {
  if (dbp) return dbp;
  return dbp = new Promise(res => {
    if (typeof indexedDB === 'undefined') return res(null);
    let req; try { req = indexedDB.open(NAME, VERSION); } catch (e) { return res(null); }
    req.onupgradeneeded = () => { const db = req.result; STORES.forEach(s => { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: s === 'kv' ? 'k' : 'id' }); }); };
    req.onsuccess = () => { const db = req.result; db.onversionchange = () => { db.close(); dbp = null; }; res(db); };
    req.onerror = () => res(null); req.onblocked = () => res(null);
  });
}
const wrap = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function run(store, mode, fn) {
  const db = await open();
  if (!db) return fn(memShim(memory()[store]));
  const tx = db.transaction(store, mode); const out = await fn(tx.objectStore(store));
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
  return out;
}
// The memory fallback speaks the same four verbs through the same promise shape.
const memShim = m => ({ get: k => ({ r: m.get(k) }), getAll: () => ({ r: [...m.values()] }), put: v => { m.set(v.id ?? v.k, v); return { r: v }; }, delete: k => { m.delete(k); return { r: 1 }; }, clear: () => { m.clear(); return { r: 1 }; } });
const done = r => ('r' in r ? Promise.resolve(r.r) : wrap(r));

export const available = () => typeof indexedDB !== 'undefined';

/* ---------- recents ---------- */
/** The ids to drop so that at most `max` of the newest records remain. Pure. */
export function beyond(metas, max = RECENTS_MAX) {
  return [...metas].sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(max).map(m => m.id);
}
export async function putRecent(meta, full) {
  await run('recents', 'readwrite', s => done(s.put(meta)));
  await run('docs', 'readwrite', s => done(s.put(full)));
  const all = await listRecents(); const drop = beyond(all);
  for (const id of drop) await deleteRecent(id);
}
export async function listRecents() {
  const all = await run('recents', 'readonly', s => done(s.getAll()));
  return (all || []).sort((a, b) => (b.updated || 0) - (a.updated || 0));
}
export const getRecentDoc = id => run('docs', 'readonly', s => done(s.get(id)));
export async function deleteRecent(id) { await run('recents', 'readwrite', s => done(s.delete(id))); await run('docs', 'readwrite', s => done(s.delete(id))); }
export async function clearRecents() { await run('recents', 'readwrite', s => done(s.clear())); await run('docs', 'readwrite', s => done(s.clear())); }

/* ---------- brands ---------- */
export const listBrands = async () => ((await run('brands', 'readonly', s => done(s.getAll()))) || []).sort((a, b) => (a.created || 0) - (b.created || 0));
export const putBrand = b => run('brands', 'readwrite', s => done(s.put(b)));
export const deleteBrand = id => run('brands', 'readwrite', s => done(s.delete(id)));

/* ---------- settings ---------- */
export const getKV = async k => { const r = await run('kv', 'readonly', s => done(s.get(k))); return r ? r.v : undefined; };
export const setKV = (k, v) => run('kv', 'readwrite', s => done(s.put({ k, v })));
