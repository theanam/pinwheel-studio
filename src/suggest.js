// Pinwheel Studio — homepage suggestions.
//
// Decides which templates a visitor sees before they ask for anything, and in what
// order. The rules:
//
//   • A new visitor sees religion- and region-neutral designs. Religious festivals,
//     regional holidays, seasonal events out of season and solemn occasions stay out
//     of the default feed.
//   • A sensitive occasion surfaces when it is close — within 10 days of the event —
//     or when this visitor has shown interest: searched for it, picked its occasion
//     filter, or opened one of its templates.
//   • Everything is ranked by interest and timing; a search or a filter always shows
//     the full match, interest only reorders it.
//
// The profile lives in localStorage and nowhere else, like everything in Pinwheel.

/* ---------- sensitivity ---------- */
// Which occasion copy packs are hidden from a fresh homepage, and why.
export const SENSITIVE = {
  christmas: 'religious', eid: 'religious', puja: 'religious', diwali: 'religious', easter: 'religious',
  thanksgiving: 'regional', halloween: 'regional', 'mothers-day': 'regional',
  valentine: 'seasonal', newyear: 'seasonal',
  memorial: 'solemn',
};
export const SURFACE_WINDOW_DAYS = 10;

/* ---------- event dates ---------- */
const d = (y, m, day) => new Date(Date.UTC(y, m - 1, day));
const addDays = (date, n) => new Date(date.getTime() + n * 864e5);
const nthWeekday = (y, m, weekday, n) => { const first = d(y, m, 1); const off = (weekday - first.getUTCDay() + 7) % 7; return addDays(first, off + 7 * (n - 1)); };

/** Western Easter Sunday (Anonymous Gregorian algorithm). */
export function easterSunday(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, dd = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - dd - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return d(y, month, day);
}

// Lunar and lunisolar festivals follow sightings and regional almanacs, so these are
// published estimates (±1 day). Extend the tables as years are announced.
const EID = { 2026: [[3, 20], [5, 27]], 2027: [[3, 9], [5, 16]], 2028: [[2, 26], [5, 5]], 2029: [[2, 14], [4, 24]], 2030: [[2, 4], [4, 13], [12, 26]] };
const DIWALI = { 2026: [11, 8], 2027: [10, 29], 2028: [10, 17], 2029: [11, 5], 2030: [10, 26] };
const DUSSEHRA = { 2026: [10, 20], 2027: [10, 9], 2028: [9, 27], 2029: [10, 16], 2030: [10, 6] }; // Durga Puja runs the four days before

/** Every dated occurrence of an occasion in a year: [{ start, end }] (inclusive, UTC). */
export function occurrences(topic, y) {
  const one = (start, len = 1) => [{ start, end: addDays(start, len - 1) }];
  switch (topic) {
    case 'christmas': return one(d(y, 12, 24), 3);
    case 'newyear': return one(d(y, 12, 31), 2);
    case 'valentine': return one(d(y, 2, 14));
    case 'halloween': return one(d(y, 10, 31));
    case 'easter': { const s = easterSunday(y); return [{ start: addDays(s, -2), end: addDays(s, 1) }]; }
    case 'mothers-day': return one(nthWeekday(y, 5, 0, 2));            // second Sunday of May
    case 'thanksgiving': return one(nthWeekday(y, 11, 4, 4), 2);        // fourth Thursday of November
    case 'eid': return (EID[y] || []).map(([m, day]) => ({ start: d(y, m, day), end: addDays(d(y, m, day), 2) }));
    case 'diwali': { const [m, day] = DIWALI[y] || []; return m ? [{ start: addDays(d(y, m, day), -2), end: addDays(d(y, m, day), 2) }] : []; }
    case 'puja': { const [m, day] = DUSSEHRA[y] || []; return m ? [{ start: addDays(d(y, m, day), -4), end: d(y, m, day) }] : []; }
    case 'graduation': return [{ start: d(y, 5, 15), end: d(y, 6, 30) }];
    default: return [];
  }
}

/**
 * Days until the next occurrence starts: 0 while it is on, negative never, null if
 * the occasion has no date. Looks a year ahead so December sees January.
 */
export function daysUntil(topic, today = new Date()) {
  const t0 = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  let best = null;
  for (const y of [today.getUTCFullYear(), today.getUTCFullYear() + 1]) {
    for (const { start, end } of occurrences(topic, y)) {
      if (end.getTime() < t0) continue;
      const n = start.getTime() <= t0 ? 0 : Math.round((start.getTime() - t0) / 864e5);
      if (best === null || n < best) best = n;
    }
  }
  return best;
}
export const isUpcoming = (topic, today, window = SURFACE_WINDOW_DAYS) => { const n = daysUntil(topic, today); return n !== null && n <= window; };

/* ---------- interest profile ---------- */
const KEY = 'pinwheel.profile';
const HALF_LIFE_DAYS = 30;

export function loadProfile() {
  try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if (p && p.v === 1) return p; } catch (e) { }
  return { v: 1, topics: {}, formats: {}, searches: [] };
}
export function saveProfile(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { } }

/** Record a signal; `kind` is 'topic' or 'format'. Returns the (mutated) profile. */
export function record(profile, kind, id, weight = 1, now = Date.now()) {
  const bucket = kind === 'topic' ? profile.topics : profile.formats;
  const cur = bucket[id] || { w: 0, t: now };
  bucket[id] = { w: decayed(cur, now) + weight, t: now };
  return profile;
}
const decayed = (entry, now) => entry.w * Math.pow(.5, Math.max(0, now - entry.t) / 864e5 / HALF_LIFE_DAYS);
export const interest = (profile, kind, id, now = Date.now()) => { const e = (kind === 'topic' ? profile.topics : profile.formats)[id]; return e ? decayed(e, now) : 0; };

/** Topic ids a free-text query is about, by name and keywords (whole words, 3+ letters). */
export function topicsFor(query, topics) {
  const words = String(query).toLowerCase().split(/[^a-z0-9’']+/).filter(w => w.length >= 3);
  if (!words.length) return [];
  return topics.filter(t => { const hay = ` ${t.name} ${t.kw || ''} `.toLowerCase(); return words.some(w => hay.includes(` ${w}`) || hay.includes(w + ' ')); }).map(t => t.id);
}

/* ---------- ranking ---------- */
const noise = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };

/**
 * Order templates for display. With `hide` on (the default feed), sensitive
 * occasions drop out unless they are upcoming or this visitor cares about them.
 *
 * Upcoming occasions lead the feed, interleaved by proximity so a festival four
 * days out does not bury one ten days out; everything else follows by interest.
 */
export function rank(templates, { profile, today = new Date(), hide = true, now = Date.now() } = {}) {
  const cacheT = new Map(), cacheF = new Map();
  const tScore = id => { if (!cacheT.has(id)) { const up = daysUntil(id, today); cacheT.set(id, { interest: interest(profile, 'topic', id, now), up, soon: up !== null && up <= SURFACE_WINDOW_DAYS }); } return cacheT.get(id); };
  const fScore = id => { if (!cacheF.has(id)) cacheF.set(id, interest(profile, 'format', id, now)); return cacheF.get(id); };
  const rest = [], soon = new Map();
  for (const t of templates) {
    const ts = tScore(t.topic);
    if (hide && SENSITIVE[t.topic] && !ts.soon && ts.interest < .5) continue;
    const score = noise(t.id) + 1.4 * Math.min(ts.interest, 2.5) + .7 * Math.min(fScore(t.fmt), 2);
    if (ts.soon && SENSITIVE[t.topic]) { if (!soon.has(t.topic)) soon.set(t.topic, []); soon.get(t.topic).push([score, t]); }
    else rest.push([score, t]);
  }
  const byScore = (a, b) => b[0] - a[0];
  const lanes = [...soon.entries()].sort((a, b) => tScore(a[0]).up - tScore(b[0]).up).map(([, arr]) => arr.sort(byScore));
  // Templates for upcoming occasions alternate by nearest event, one lane each.
  const coming = [];
  for (let i = 0; lanes.some(l => i < l.length); i++) for (const l of lanes) if (i < l.length) coming.push(l[i][1]);
  const feed = rest.sort(byScore).map(x => x[1]);
  // The main feed keeps its ordinary mix: upcoming occasions get their own section
  // on the home page (`coming`) and, in the feed, sit among everything else by score
  // rather than crowding the top, so the catalogue never looks like one holiday.
  const all = [...rest, ...lanes.flat()].sort(byScore).map(x => x[1]);
  return Object.assign(hide ? all : feed.concat(coming.filter(t => !feed.includes(t))), { coming, feed });
}

/** Occasions worth a nudge today: visible sensitive ones that are coming up. */
export function upcoming(topicIds, today = new Date()) {
  return topicIds.map(id => ({ id, days: daysUntil(id, today) })).filter(x => x.days !== null && x.days <= SURFACE_WINDOW_DAYS).sort((a, b) => a.days - b.days);
}
