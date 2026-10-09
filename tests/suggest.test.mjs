// node tests/suggest.test.mjs — the homepage suggestion rules, pinned to fixed dates.
import assert from 'node:assert/strict';
import { rank, daysUntil, easterSunday, topicsFor, record, interest, upcoming, SENSITIVE } from '../src/suggest.js';
import { catalog, TOPICS } from '../src/presets.js';

const at = iso => new Date(iso + 'T12:00:00Z');
const cat = catalog();
const topicsOf = list => new Set(list.map(t => t.topic));
const fresh = () => ({ v: 1, topics: {}, formats: {}, searches: [] });

// Easter: known dates.
assert.equal(easterSunday(2026).toISOString().slice(0, 10), '2026-04-05');
assert.equal(easterSunday(2027).toISOString().slice(0, 10), '2027-03-28');

// A new visitor in mid-June sees no religious, regional, seasonal or solemn occasions.
let seen = topicsOf(rank(cat, { profile: fresh(), today: at('2026-06-15') }));
for (const id of Object.keys(SENSITIVE)) assert.ok(!seen.has(id), `${id} leaked into the fresh feed`);
assert.ok(seen.has('birthday') && seen.has('wedding') && seen.has('sale'), 'neutral occasions and commercial packs stay');

// Ten days before Diwali 2026 (Nov 8, window from Nov 6 − 10) it surfaces — and sits on top.
assert.equal(daysUntil('diwali', at('2026-10-27')), 10);
const ranked = rank(cat, { profile: fresh(), today: at('2026-10-27') });
assert.ok(topicsOf(ranked).has('diwali'), 'Diwali within 10 days is shown');
// Upcoming occasions get their own row (nearest first, alternating), and the main
// feed keeps its ordinary mix rather than leading with them.
assert.deepEqual(ranked.coming.slice(0, 4).map(t => t.topic), ['halloween', 'diwali', 'halloween', 'diwali']);
assert.ok(ranked.coming.every(t => ['halloween', 'diwali'].includes(t.topic)), 'the row holds only the upcoming occasions');
const top = ranked.slice(0, 48).map(t => t.topic);
assert.ok(top.filter(t => t === 'halloween' || t === 'diwali').length < 24, 'the feed is not mostly festival templates: ' + top.filter(t => t === 'halloween' || t === 'diwali').length + ' of 48');
assert.ok(new Set(top).size >= 8, 'the first page of the feed spans many topics');
assert.ok(!topicsOf(ranked).has('christmas'), 'Christmas is still 48 days out');

// Christmas: hidden on Dec 1, shown on Dec 15, shown on the day, gone on Dec 27.
assert.ok(!topicsOf(rank(cat, { profile: fresh(), today: at('2026-12-01') })).has('christmas'));
assert.ok(topicsOf(rank(cat, { profile: fresh(), today: at('2026-12-15') })).has('christmas'));
assert.equal(daysUntil('christmas', at('2026-12-25')), 0);
assert.ok(!topicsOf(rank(cat, { profile: fresh(), today: at('2026-12-27') })).has('christmas'));
// …but New Year is on by then (Dec 31 is 4 days out), and January sees it from December.
assert.ok(topicsOf(rank(cat, { profile: fresh(), today: at('2026-12-27') })).has('newyear'));

// Eid al-Fitr 2026 (Mar 20) and Eid al-Adha (May 27) both count; Puja is the four days before Dussehra.
assert.equal(daysUntil('eid', at('2026-03-15')), 5);
assert.equal(daysUntil('eid', at('2026-05-20')), 7);
assert.equal(daysUntil('puja', at('2026-10-16')), 0);

// Interest: a search for "eid mubarak" maps to the pack; recording it surfaces Eid in June.
assert.deepEqual(topicsFor('eid mubarak cards', TOPICS), ['eid']);
assert.deepEqual(topicsFor('funeral', TOPICS), ['memorial']);
assert.deepEqual(topicsFor('xmas', TOPICS), ['christmas']);
const p = record(fresh(), 'topic', 'eid');
assert.ok(topicsOf(rank(cat, { profile: p, today: at('2026-06-15') })).has('eid'), 'searched-for occasion is shown');
assert.ok(!topicsOf(rank(cat, { profile: p, today: at('2026-06-15') })).has('diwali'), 'but only that one');

// Interest decays: after 90 days a single signal is below the threshold.
const old = record(fresh(), 'topic', 'eid', 1, Date.UTC(2026, 0, 1));
assert.ok(interest(old, 'topic', 'eid', Date.UTC(2026, 3, 1)) < .5);
assert.ok(!topicsOf(rank(cat, { profile: old, today: at('2026-06-15'), now: Date.UTC(2026, 5, 15) })).has('eid'));

// A search never hides: with hide off every matching template is returned.
assert.equal(rank(cat.filter(t => t.topic === 'memorial'), { profile: fresh(), today: at('2026-06-15'), hide: false }).length, cat.filter(t => t.topic === 'memorial').length);

// Upcoming summary for the hint line.
assert.deepEqual(upcoming(Object.keys(SENSITIVE), at('2026-10-27')).map(x => x.id), ['halloween', 'diwali']);

console.log('suggest: all checks passed');
