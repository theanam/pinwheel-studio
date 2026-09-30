// Pinwheel Studio — preset system.
// Catalog = formats × layouts × topics, each themed with a palette + type pairing.
let _n = 0;
export const nid = () => 'e' + (++_n).toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- color ---------- */
const hx = h => { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0); };
const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const lum = h => { const [r, g, b] = hx(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const onColor = (bg, prefs) => prefs.find(c => contrast(bg, c) >= 4.5) || [...prefs, '#FFFFFF', '#111111'].reduce((b, c) => contrast(bg, c) > contrast(bg, b) ? c : b);

/* ---------- fonts ---------- */
export const FONTS = [
  ['Anton', 'Anton'], ['Bebas Neue', 'Bebas+Neue'], ['Archivo Black', 'Archivo+Black'], ['Abril Fatface', 'Abril+Fatface'],
  ['DM Serif Display', 'DM+Serif+Display:ital@0;1'], ['Pacifico', 'Pacifico'], ['Instrument Serif', 'Instrument+Serif:ital@0;1'],
  ['Permanent Marker', 'Permanent+Marker'], ['Work Sans', 'Work+Sans:ital,wght@0,400;0,600;0,800;1,400'],
  ['Karla', 'Karla:ital,wght@0,400;0,700;1,400'], ['Playfair Display', 'Playfair+Display:ital,wght@0,400;0,700;0,900;1,400'],
  ['Source Sans 3', 'Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400'], ['DM Sans', 'DM+Sans:ital,wght@0,400;0,700;1,400'],
  ['Archivo', 'Archivo:ital,wght@0,400;0,700;0,900;1,400'], ['Space Grotesk', 'Space+Grotesk:wght@400;700'],
  ['Syne', 'Syne:wght@400;700;800'], ['Manrope', 'Manrope:wght@400;700;800'],
  ['Cormorant Garamond', 'Cormorant+Garamond:ital,wght@0,400;0,700;1,400'], ['Montserrat', 'Montserrat:ital,wght@0,400;0,700;0,900;1,400'],
  ['Lato', 'Lato:ital,wght@0,400;0,700;0,900;1,400'], ['Oswald', 'Oswald:wght@400;700'], ['Nunito Sans', 'Nunito+Sans:ital,wght@0,400;0,700;1,400'],
  ['Unbounded', 'Unbounded:wght@400;700;900'], ['Outfit', 'Outfit:wght@400;700'],
  ['Libre Caslon Text', 'Libre+Caslon+Text:ital,wght@0,400;0,700;1,400'], ['Libre Franklin', 'Libre+Franklin:ital,wght@0,400;0,700;1,400'],
  ['Quicksand', 'Quicksand:wght@400;700'], ['Instrument Sans', 'Instrument+Sans:ital,wght@0,400;0,700;1,400'],
  ['Caveat', 'Caveat:wght@400;700'], ['Space Mono', 'Space+Mono:ital,wght@0,400;0,700;1,400'],
  ['Poppins', 'Poppins:ital,wght@0,400;0,700;0,900;1,400'], ['Lora', 'Lora:ital,wght@0,400;0,700;1,400'],
  ['Big Shoulders Display', 'Big+Shoulders+Display:wght@400;700;900'], ['Rubik', 'Rubik:ital,wght@0,400;0,700;0,900;1,400']
].map(([name, q]) => ({ name, q }));
export const fontURL = f => `https://fonts.googleapis.com/css2?family=${f.q}&display=swap`;

/* ---------- palettes ---------- */
export const PALETTES = [
  ['paper', 'Paper & Ink', '#F4EFE6', '#1B1A17', '#E4572E', '#2E86AB', '#FFFFFF'],
  ['midnight', 'Midnight', '#0F1226', '#F3F1EA', '#FFB84D', '#7A83FF', '#1C2140'],
  ['mint', 'Mint Club', '#D6F0E3', '#0E3B2E', '#FF6F59', '#0E3B2E', '#F2FBF6'],
  ['tomato', 'Tomato', '#E8412C', '#FFF4E6', '#1D1D1B', '#FFD166', '#F25A45'],
  ['lavender', 'Lavender', '#E9E3F7', '#2A1E4A', '#7B5CFA', '#F28CB1', '#F7F4FD'],
  ['forest', 'Forest', '#1F3A2E', '#F1E9D2', '#D9A441', '#8FB996', '#2A4A3B'],
  ['citrus', 'Citrus', '#FFE45E', '#1A1A1A', '#FF4F79', '#3A86FF', '#FFF3A8'],
  ['mono', 'Mono', '#FFFFFF', '#111111', '#111111', '#8C8C8C', '#F2F2F2'],
  ['terracotta', 'Terracotta', '#F2E3D5', '#3B2418', '#C8553D', '#588B8B', '#FBF3EA'],
  ['ocean', 'Ocean', '#0B3C5D', '#F5F9FA', '#3FD1C9', '#F2B134', '#124A70'],
  ['blush', 'Blush', '#F8D8D3', '#4A1C24', '#B8336A', '#FFFFFF', '#FDEDEA'],
  ['electric', 'Electric', '#111111', '#FFFFFF', '#C6FF3D', '#FF3DA5', '#1E1E1E'],
  ['sand', 'Sand & Sea', '#EFE6D8', '#1E3D59', '#F5A65B', '#1E3D59', '#F8F3EA'],
  ['plum', 'Plum', '#3D1F3A', '#FCE9DB', '#F58F7C', '#F2C14E', '#4E2A4A'],
  ['sky', 'Sky', '#CFE8FF', '#0A2342', '#FF7B54', '#2CA58D', '#EAF4FF'],
  ['gold', 'Charcoal & Gold', '#1E1E1E', '#F2EDE4', '#C9A227', '#6B6B6B', '#2A2A2A'],
  ['cobalt', 'Cobalt', '#1F3FD1', '#FFFFFF', '#FFD23F', '#FF8FA3', '#3452DB'],
  ['sage', 'Sage', '#E4E8DC', '#2F3A2B', '#8A9A5B', '#D98E5F', '#F1F4EC']
].map(([id, name, bg, ink, accent, accent2, surface]) => ({ id, name, bg, ink, accent, accent2, surface }));
export const THEME_KEYS = ['bg', 'ink', 'accent', 'accent2', 'surface', 'muted', 'onAccent', 'onAccent2', 'hi', 'line', 'tint', 'onSurface'];
export function makeTheme(p) {
  const t = { id: p.id, name: p.name, bg: p.bg, ink: p.ink, accent: p.accent, accent2: p.accent2, surface: p.surface || mix(p.bg, '#FFFFFF', .5) };
  t.muted = mix(p.ink, p.bg, .3); if (contrast(t.muted, p.bg) < 4.5) t.muted = mix(p.ink, p.bg, .16);
  t.onAccent = onColor(p.accent, [p.bg, p.ink]);
  t.onAccent2 = onColor(p.accent2, [p.bg, p.ink]);
  t.hi = contrast(p.accent, p.bg) >= 3 ? p.accent : contrast(p.accent2, p.bg) >= 3 ? p.accent2 : p.ink;
  t.line = mix(p.ink, p.bg, .78); t.tint = mix(p.accent2, p.bg, .55); t.onSurface = onColor(t.surface, [p.ink, p.bg]);
  return t;
}

/* ---------- type pairings ---------- */
// wf = average glyph width (em) of display face; lh = display line-height
export const PAIRINGS = [
  { id: 'impact', name: 'Impact', display: 'Anton', body: 'Work Sans', dw: 400, wf: .46, bwf: .52, upper: true, track: .01, lh: 1.02 },
  { id: 'poster', name: 'Poster', display: 'Bebas Neue', body: 'Karla', dw: 400, wf: .40, bwf: .5, upper: true, track: .02, lh: .95 },
  { id: 'editorial', name: 'Editorial', display: 'Playfair Display', body: 'Source Sans 3', dw: 700, wf: .53, bwf: .48, upper: false, track: -.01, lh: 1.08 },
  { id: 'modern-serif', name: 'Modern Serif', display: 'DM Serif Display', body: 'DM Sans', dw: 400, wf: .5, bwf: .52, upper: false, track: -.01, lh: 1.05 },
  { id: 'heavy', name: 'Heavy', display: 'Archivo Black', body: 'Archivo', dw: 400, wf: .64, bwf: .52, upper: true, track: -.02, lh: 1.0 },
  { id: 'grotesk', name: 'Grotesk', display: 'Space Grotesk', body: 'Space Grotesk', dw: 700, wf: .56, bwf: .54, upper: false, track: -.03, lh: 1.02 },
  { id: 'art', name: 'Art School', display: 'Syne', body: 'Manrope', dw: 800, wf: .62, bwf: .52, upper: false, track: -.02, lh: 1.02 },
  { id: 'luxe', name: 'Luxe', display: 'Cormorant Garamond', body: 'Montserrat', dw: 700, wf: .44, bwf: .56, upper: false, track: 0, lh: 1.0 },
  { id: 'fatface', name: 'Fat Face', display: 'Abril Fatface', body: 'Lato', dw: 400, wf: .55, bwf: .5, upper: false, track: 0, lh: 1.05 },
  { id: 'condensed', name: 'Condensed', display: 'Oswald', body: 'Nunito Sans', dw: 700, wf: .45, bwf: .52, upper: true, track: .01, lh: 1.02 },
  { id: 'round', name: 'Wide Round', display: 'Unbounded', body: 'Outfit', dw: 700, wf: .7, bwf: .5, upper: false, track: -.02, lh: 1.05 },
  { id: 'classic', name: 'Classic', display: 'Libre Caslon Text', body: 'Libre Franklin', dw: 400, wf: .53, bwf: .52, upper: false, track: -.01, lh: 1.1 },
  { id: 'script', name: 'Script', display: 'Pacifico', body: 'Quicksand', dw: 400, wf: .58, bwf: .52, upper: false, track: 0, lh: 1.25 },
  { id: 'instrument', name: 'Instrument', display: 'Instrument Serif', body: 'Instrument Sans', dw: 400, wf: .42, bwf: .5, upper: false, track: -.02, lh: 1.0 },
  { id: 'sports', name: 'Sports', display: 'Big Shoulders Display', body: 'Poppins', dw: 900, wf: .42, bwf: .56, upper: true, track: .01, lh: .92 },
  { id: 'marker', name: 'Marker', display: 'Permanent Marker', body: 'Poppins', dw: 400, wf: .6, bwf: .56, upper: false, track: 0, lh: 1.1 },
  { id: 'geo', name: 'Geometric', display: 'Poppins', body: 'Poppins', dw: 900, wf: .62, bwf: .56, upper: false, track: -.03, lh: 1.02 },
  { id: 'rubik', name: 'Chunky', display: 'Rubik', body: 'Rubik', dw: 900, wf: .6, bwf: .54, upper: false, track: -.02, lh: 1.0 },
  { id: 'bookish', name: 'Bookish', display: 'Lora', body: 'Lato', dw: 700, wf: .52, bwf: .5, upper: false, track: -.01, lh: 1.1 }
];

/* ---------- formats ---------- */
// kind: t thumbnail · s social · d deck · p print · b banner · c card
export const FORMATS = [
  { id: 'yt-thumb', name: 'YouTube Thumbnail', cat: 'YouTube', w: 1280, h: 720, kind: 't' },
  { id: 'ig-post', name: 'Instagram Post', cat: 'Instagram', w: 1080, h: 1080, kind: 's' },
  { id: 'ig-portrait', name: 'Instagram Portrait', cat: 'Instagram', w: 1080, h: 1350, kind: 's' },
  { id: 'ig-story', name: 'Instagram Story', cat: 'Instagram', w: 1080, h: 1920, kind: 's' },
  { id: 'ig-carousel', name: 'Instagram Carousel', cat: 'Instagram', w: 1080, h: 1350, kind: 's', pages: 3 },
  { id: 'tiktok', name: 'TikTok / Reels Cover', cat: 'TikTok', w: 1080, h: 1920, kind: 's' },
  { id: 'fb-post', name: 'Facebook Post', cat: 'Facebook', w: 1200, h: 630, kind: 's' },
  { id: 'fb-event', name: 'Facebook Event Cover', cat: 'Facebook', w: 1920, h: 1005, kind: 's' },
  { id: 'fb-cover', name: 'Facebook Cover', cat: 'Facebook', w: 1640, h: 624, kind: 'b' },
  { id: 'x-post', name: 'X Post', cat: 'X', w: 1600, h: 900, kind: 's' },
  { id: 'x-header', name: 'X Header', cat: 'X', w: 1500, h: 500, kind: 'b' },
  { id: 'li-post', name: 'LinkedIn Post', cat: 'LinkedIn', w: 1200, h: 1200, kind: 's' },
  { id: 'li-banner', name: 'LinkedIn Banner', cat: 'LinkedIn', w: 1584, h: 396, kind: 'b' },
  { id: 'pin', name: 'Pinterest Pin', cat: 'Pinterest', w: 1000, h: 1500, kind: 's' },
  { id: 'podcast', name: 'Podcast Cover', cat: 'Podcast', w: 1400, h: 1400, kind: 's' },
  { id: 'email-header', name: 'Email Header', cat: 'Web', w: 1200, h: 400, kind: 'b' },
  { id: 'pres', name: 'Presentation 16:9', cat: 'Presentation', w: 1920, h: 1080, kind: 'd', pages: 3 },
  { id: 'poster', name: 'Poster 18×24 in', cat: 'Poster', w: 1728, h: 2304, kind: 'p' },
  { id: 'a4', name: 'A4 Flyer', cat: 'Flyer', w: 794, h: 1123, kind: 'p' },
  { id: 'letter', name: 'US Letter Flyer', cat: 'Flyer', w: 816, h: 1056, kind: 'p' },
  { id: 'postcard', name: 'Postcard 6×4 in', cat: 'Print', w: 1800, h: 1200, kind: 'p' },
  { id: 'certificate', name: 'Certificate A4 Landscape', cat: 'Print', w: 1123, h: 794, kind: 'p' },
  { id: 'invite', name: 'Invitation 5×7 in', cat: 'Invitation', w: 1050, h: 1470, kind: 'p' },
  { id: 'bizcard', name: 'Business Card', cat: 'Business Card', w: 1050, h: 600, kind: 'c', pages: 2 }
];
export const FORMAT = Object.fromEntries(FORMATS.map(f => [f.id, f]));

/* ---------- topics (copy packs) ---------- */
const TOPICS = [
  { id: 'sale', name: 'Retail sale', brand: 'Northfield', kicker: 'This weekend only', title: 'The Big Summer Sale', short: 'Up to 50% off', word: 'Sale', sub: 'Everything in store and online. No code, no catch — just good things for less.', cta: 'Shop the sale', handle: '@northfieldgoods', url: 'northfield.shop', stat: ['50%', 'off everything'], items: ['Free shipping over $50', '30-day easy returns', 'Members shop first', 'New drops daily'], date: ['21', 'Jun', 'June 21 – 23', '10am – 8pm'], place: 'All stores & online', price: '$29', badge: 'Hot deal', quote: 'Best sale of the year, hands down. I stocked up on everything I’d been eyeing.', author: 'Priya Nair', role: 'Customer since 2019', tags: ['Apparel', 'Home', 'Outdoor', 'Gifts'], chart: [['Mon', 18], ['Tue', 26], ['Wed', 35], ['Thu', 50]], vs: ['Full price', 'Sale price'], count: ['3', 'days left'], ep: 'Drop 07', menu: [['Linen shirt', '$29'], ['Canvas tote', '$14'], ['Stoneware mug', '$9'], ['Wool throw', '$48']], person: 'Jordan Blake', job: 'Store Manager', pairs: ['heavy', 'impact', 'round', 'condensed', 'geo', 'rubik'], pals: ['tomato', 'citrus', 'electric', 'mono', 'sky', 'cobalt'] },
  { id: 'podcast', name: 'Podcast', brand: 'Late Signals', kicker: 'New episode', title: 'How Great Ideas Actually Happen', short: 'Ideas are cheap?', word: 'Listen', sub: 'Designer Mara Ellis on patience, taste, and the unglamorous art of shipping.', cta: 'Listen now', handle: '@latesignals', url: 'latesignals.fm', stat: ['42', 'episodes and counting'], items: ['Why taste is a skill', 'The 100-draft rule', 'Shipping before you’re ready', 'Staying curious'], date: ['12', 'Mar', 'Every Tuesday', '6am PT'], place: 'Wherever you listen', price: 'Free', badge: 'Ep. 42', quote: 'Good ideas don’t arrive. They get dragged out of a hundred bad ones.', author: 'Mara Ellis', role: 'Product designer', tags: ['Design', 'Craft', 'Careers'], chart: [['S1', 12], ['S2', 20], ['S3', 31], ['S4', 44]], vs: ['Instinct', 'Process'], count: ['42', 'episode'], ep: 'EP. 42', menu: [['Intro', '0:00'], ['Taste', '6:40'], ['Drafts', '21:15'], ['Shipping', '38:02']], person: 'Sam Okafor', job: 'Host & Producer', pairs: ['grotesk', 'art', 'impact', 'instrument', 'round'], pals: ['midnight', 'electric', 'plum', 'citrus', 'lavender'] },
  { id: 'travel', name: 'Travel', brand: 'Wanderfolk', kicker: 'Field notes', title: '48 Hours in Lisbon', short: 'Lisbon in 48 hours', word: 'Lisbon', sub: 'Tiled alleys, custard tarts at 8am and the best sunset in Europe — our slow guide.', cta: 'Read the guide', handle: '@wanderfolk', url: 'wanderfolk.co', stat: ['7', 'hills, one city'], items: ['Sunrise at Miradouro da Graça', 'Pastéis still warm at 8am', 'Tram 28 at golden hour', 'Fado in Alfama'], date: ['14', 'Jun', 'June 14 – 16', 'Departs 7:40am'], place: 'Lisbon, Portugal', price: '$1,290', badge: 'New guide', quote: 'Lisbon doesn’t ask you to hurry. It hands you a coffee and points at the river.', author: 'Inês Duarte', role: 'Local guide', tags: ['City break', 'Food', 'Sunsets'], chart: [['Jun', 24], ['Jul', 28], ['Aug', 29], ['Sep', 26]], vs: ['Tourist route', 'Local route'], count: ['12', 'days to go'], ep: 'Guide 03', menu: [['Pastel de nata', '€1.40'], ['Bifana', '€3.50'], ['Vinho verde', '€4'], ['Grilled sardines', '€9']], person: 'Lena Moreau', job: 'Travel Editor', pairs: ['editorial', 'instrument', 'script', 'modern-serif', 'poster', 'luxe'], pals: ['sand', 'ocean', 'terracotta', 'sky', 'paper'] },
  { id: 'food', name: 'Food & dining', brand: 'Sunday Table', kicker: 'Supper club', title: 'Sunday Pasta Night', short: 'Fresh pasta Sunday', word: 'Pasta', sub: 'Hand-rolled pasta, natural wine and one long table. Bring a friend, leave with ten.', cta: 'Reserve a seat', handle: '@sundaytable', url: 'sundaytable.kitchen', stat: ['12', 'seats a night'], items: ['Burrata & charred peaches', 'Cacio e pepe, made tableside', 'Brown butter gnocchi', 'Olive oil cake'], date: ['09', 'Nov', 'Sunday, Nov 9', '7:00 pm'], place: '118 Mercer St', price: '$65', badge: 'Chef’s pick', quote: 'The kind of dinner where you forget to check your phone for three hours.', author: 'Dana Whitfield', role: 'Regular guest', tags: ['Vegetarian', 'Wine', 'Communal'], chart: [['Jan', 30], ['Feb', 42], ['Mar', 55], ['Apr', 71]], vs: ['Dried', 'Fresh'], count: ['4', 'seats left'], ep: 'Menu 11', menu: [['Burrata', '$16'], ['Cacio e pepe', '$22'], ['Gnocchi', '$24'], ['Olive oil cake', '$11']], person: 'Marco Bellini', job: 'Head Chef', pairs: ['fatface', 'modern-serif', 'script', 'classic', 'bookish', 'instrument'], pals: ['terracotta', 'tomato', 'paper', 'sage', 'forest'] },
  { id: 'fitness', name: 'Fitness', brand: 'Ironline', kicker: '30-day program', title: 'The Strength Reset', short: '30 days stronger', word: 'Lift', sub: 'Three sessions a week, 40 minutes each. Progressive, simple, built to stick.', cta: 'Start free', handle: '@ironline.fit', url: 'ironline.fit', stat: ['+38%', 'average strength gain'], items: ['Squat, hinge, push, pull', 'Train 3× a week', 'Log every set', 'Sleep like it’s your job'], date: ['01', 'Sep', 'Starts Sept 1', '6:30 am'], place: 'Ironline Studio, Floor 2', price: '$49/mo', badge: 'Beginner friendly', quote: 'I finally stopped program-hopping. Thirty days in, my deadlift is up 40 pounds.', author: 'Chris Tan', role: 'Member', tags: ['Strength', 'Mobility', 'Coaching'], chart: [['Wk1', 60], ['Wk2', 68], ['Wk3', 77], ['Wk4', 83]], vs: ['Day 1', 'Day 30'], count: ['7', 'days to go'], ep: 'Week 01', menu: [['Drop-in', '$22'], ['10-pack', '$180'], ['Monthly', '$49'], ['Coaching', '$99']], person: 'Alex Rivera', job: 'Head Coach', pairs: ['sports', 'impact', 'heavy', 'condensed', 'rubik'], pals: ['electric', 'citrus', 'mono', 'cobalt', 'tomato'] },
  { id: 'tech', name: 'Product launch', brand: 'Orbit', kicker: 'Introducing', title: 'Meet Orbit 2.0', short: 'Orbit 2.0 is here', word: 'Orbit', sub: 'Your team’s calendar, tasks and docs finally talking to each other. Faster than ever.', cta: 'Try it free', handle: '@orbitapp', url: 'orbit.app', stat: ['3×', 'faster planning'], items: ['Shared timelines', 'Offline-first sync', 'Keyboard everything', 'Private by default'], date: ['30', 'Oct', 'Launch day · Oct 30', '9:00 am PT'], place: 'Live stream', price: '$8/seat', badge: 'New', quote: 'We replaced four tools with Orbit in a week. Planning meetings got 20 minutes shorter.', author: 'Nadia Hassan', role: 'Head of Ops, Fieldwork', tags: ['Productivity', 'Teams', 'AI'], chart: [['Q1', 22], ['Q2', 35], ['Q3', 51], ['Q4', 78]], vs: ['Before', 'After'], count: ['5', 'days to launch'], ep: 'v2.0', menu: [['Free', '$0'], ['Team', '$8'], ['Business', '$16'], ['Enterprise', 'Talk to us']], person: 'Riya Shah', job: 'Product Lead', pairs: ['grotesk', 'round', 'art', 'geo', 'instrument'], pals: ['midnight', 'cobalt', 'lavender', 'mono', 'electric', 'sky'] },
  { id: 'wedding', name: 'Wedding', brand: 'Ana & Theo', kicker: 'Together with their families', title: 'Ana & Theo', short: 'Save the date', word: 'Forever', sub: 'request the pleasure of your company as they celebrate their marriage.', cta: 'RSVP by August 1', handle: '#AnaAndTheo', url: 'anaandtheo.love', stat: ['10', 'years in the making'], items: ['Ceremony at 4pm', 'Dinner & dancing to follow', 'Garden attire', 'Shuttle from the inn'], date: ['20', 'Sep', 'Saturday, September 20', 'Four o’clock'], place: 'Rosewood Estate, Sonoma', price: '', badge: 'Save the date', quote: 'Whatever our souls are made of, his and mine are the same.', author: 'Emily Brontë', role: '', tags: ['Ceremony', 'Dinner', 'Dancing'], chart: [['2015', 1], ['2018', 3], ['2022', 6], ['2025', 10]], vs: ['Ana', 'Theo'], count: ['60', 'days to go'], ep: 'No. 01', menu: [['Oysters', 'first'], ['Heirloom salad', 'second'], ['Short rib', 'main'], ['Olive oil cake', 'sweet']], person: 'Ana Costa', job: 'Bride-to-be', pairs: ['luxe', 'script', 'classic', 'instrument', 'editorial'], pals: ['blush', 'sage', 'paper', 'gold', 'sand'] },
  { id: 'realestate', name: 'Real estate', brand: 'Keystone Homes', kicker: 'Open house', title: 'Light-Filled Corner Home', short: 'Just listed', word: 'Home', sub: '3 bed · 2 bath · 1,840 sq ft with a south-facing garden and original oak floors.', cta: 'Book a viewing', handle: '@keystonehomes', url: 'keystone.homes', stat: ['$840K', 'asking price'], items: ['South-facing garden', 'Chef’s kitchen', 'Walk to the park', 'EV-ready garage'], date: ['18', 'Oct', 'Saturday, Oct 18', '11am – 2pm'], place: '42 Alder Lane', price: '$840K', badge: 'Just listed', quote: 'They found us a home we didn’t know we could afford — in a week.', author: 'The Parkers', role: 'Happy homeowners', tags: ['3 bed', '2 bath', 'Garden'], chart: [['2022', 690], ['2023', 735], ['2024', 790], ['2025', 840]], vs: ['Before reno', 'After reno'], count: ['2', 'days only'], ep: 'Listing 118', menu: [['Studio', '$2,100'], ['1 bed', '$2,800'], ['2 bed', '$3,600'], ['Penthouse', '$6,900']], person: 'Grace Liu', job: 'Listing Agent', pairs: ['classic', 'modern-serif', 'grotesk', 'luxe', 'bookish'], pals: ['sand', 'gold', 'sage', 'mono', 'paper'] },
  { id: 'music', name: 'Live music', brand: 'Neon Tides', kicker: 'Live · one night only', title: 'Neon Tides', short: 'Neon Tides live', word: 'Live', sub: 'With special guests Paper Moons. Doors at 8. Dance until the lights come on.', cta: 'Get tickets', handle: '@neontides', url: 'neontides.band', stat: ['1', 'night only'], items: ['Doors 8pm', 'Paper Moons 8:45', 'Neon Tides 10pm', 'Afterparty in the loft'], date: ['27', 'Nov', 'Thursday, Nov 27', 'Doors 8pm'], place: 'The Foundry, Brooklyn', price: '$25', badge: 'Sold out soon', quote: 'The loudest, sweatiest, happiest two hours I’ve had all year.', author: 'Kai Monroe', role: 'Local Sound', tags: ['Synth pop', 'All ages', 'Late show'], chart: [['NYC', 90], ['CHI', 72], ['LA', 85], ['ATX', 64]], vs: ['Studio', 'Live'], count: ['9', 'days to go'], ep: 'Tour ’25', menu: [['GA', '$25'], ['Balcony', '$40'], ['VIP', '$90'], ['Merch bundle', '$55']], person: 'Remy Vance', job: 'Booking Agent', pairs: ['poster', 'art', 'round', 'marker', 'sports'], pals: ['electric', 'plum', 'midnight', 'cobalt', 'citrus'] },
  { id: 'education', name: 'Workshop', brand: 'Studio Class', kicker: 'Weekend workshop', title: 'Intro to Watercolor', short: 'Learn watercolor', word: 'Paint', sub: 'Two relaxed afternoons. All materials included. No experience needed — just curiosity.', cta: 'Save your spot', handle: '@studioclass', url: 'studioclass.org', stat: ['8', 'students per class'], items: ['Wet-on-wet washes', 'Mixing a limited palette', 'Painting light', 'Take-home sketchbook'], date: ['04', 'Oct', 'Oct 4 & 5', '1 – 4pm'], place: 'The Annex, 3rd floor', price: '$120', badge: 'All levels', quote: 'I came in unable to draw a circle and left with a painting on my fridge.', author: 'Tom Becker', role: 'Past student', tags: ['Beginner', 'Materials included', 'Small group'], chart: [['Wk1', 20], ['Wk2', 45], ['Wk3', 70], ['Wk4', 92]], vs: ['First try', 'Day two'], count: ['6', 'spots left'], ep: 'Lesson 01', menu: [['Single class', '$65'], ['Weekend', '$120'], ['Monthly', '$220'], ['Private', '$90/h']], person: 'Hana Sato', job: 'Instructor', pairs: ['script', 'modern-serif', 'bookish', 'round', 'instrument'], pals: ['sky', 'lavender', 'mint', 'paper', 'blush'] },
  { id: 'beauty', name: 'Beauty', brand: 'Soft Glow', kicker: 'The routine', title: 'Glow in Four Steps', short: 'My 4-step glow', word: 'Glow', sub: 'A simple morning ritual for skin that looks rested — even when you’re not.', cta: 'Shop the set', handle: '@softglow', url: 'softglow.co', stat: ['4', 'steps, 5 minutes'], items: ['Gentle cleanse', 'Vitamin C serum', 'Barrier cream', 'SPF, always'], date: ['15', 'May', 'Launching May 15', ''], place: 'Online & in select stores', price: '$58', badge: 'Bestseller', quote: 'My skin has never looked this calm. I actually look forward to mornings now.', author: 'Aisha Bello', role: 'Verified buyer', tags: ['Vegan', 'Fragrance-free', 'Refillable'], chart: [['Wk1', 30], ['Wk2', 52], ['Wk3', 71], ['Wk4', 88]], vs: ['Before', 'After'], count: ['24', 'hours only'], ep: 'Step 01', menu: [['Cleanser', '$18'], ['Serum', '$32'], ['Cream', '$26'], ['SPF 50', '$22']], person: 'Chloe Martin', job: 'Founder', pairs: ['luxe', 'modern-serif', 'instrument', 'editorial', 'script'], pals: ['blush', 'lavender', 'sand', 'mono', 'terracotta'] },
  { id: 'gaming', name: 'Gaming', brand: 'PixelRush', kicker: 'Season 9', title: 'Ranked Grind: Day 1 to Diamond', short: 'Bronze to Diamond', word: 'GG', sub: 'Every mistake, every clutch, every rage-quit. Twelve hours, one goal.', cta: 'Watch now', handle: '@pixelrush', url: 'pixelrush.gg', stat: ['12h', 'stream'], items: ['Warm-up aim drills', 'Duo queue with Vex', 'The 1v4 clutch', 'Diamond or bust'], date: ['08', 'Aug', 'Friday, Aug 8', '7pm ET'], place: 'Live on stream', price: 'Free', badge: 'Live', quote: 'Absolutely unhinged stream. That final round had chat going nuclear.', author: 'Vex', role: 'Duo partner', tags: ['FPS', 'Ranked', 'Tips'], chart: [['Bronze', 10], ['Silver', 35], ['Gold', 60], ['Diamond', 95]], vs: ['Noob', 'Pro'], count: ['1', 'hour to go'], ep: 'S9 · E14', menu: [['Sub', '$4.99'], ['VIP', '$9.99'], ['Merch', '$29'], ['Coaching', '$40']], person: 'Leo Park', job: 'Streamer', pairs: ['marker', 'sports', 'impact', 'heavy', 'rubik', 'round'], pals: ['electric', 'cobalt', 'citrus', 'midnight', 'plum'] },
  { id: 'coffee', name: 'Café', brand: 'Slow Morning', kicker: 'Now roasting', title: 'Slow Morning Roasters', short: 'New roast drop', word: 'Brew', sub: 'Single-origin Ethiopian beans with notes of apricot, jasmine and honey.', cta: 'Order beans', handle: '@slowmorning', url: 'slowmorning.coffee', stat: ['86', 'cupping score'], items: ['Apricot & jasmine', 'Light roast', 'Washed process', 'Roasted Mondays'], date: ['02', 'Feb', 'Every Saturday', '8am – noon'], place: 'Pier 9 Market', price: '$18', badge: 'Small batch', quote: 'The only coffee that makes me slow down and actually taste the morning.', author: 'Ben Carter', role: 'Subscriber', tags: ['Single origin', 'Direct trade', 'Fresh'], chart: [['Mon', 120], ['Tue', 140], ['Wed', 132], ['Thu', 176]], vs: ['Supermarket', 'Fresh roast'], count: ['2', 'bags left'], ep: 'Lot 21', menu: [['Espresso', '$3.50'], ['Flat white', '$4.75'], ['Pour over', '$5.50'], ['Cardamom bun', '$4']], person: 'Mei Lin', job: 'Head Roaster', pairs: ['bookish', 'classic', 'fatface', 'instrument', 'poster'], pals: ['terracotta', 'forest', 'paper', 'sand', 'gold'] },
  { id: 'nonprofit', name: 'Nonprofit', brand: 'Greenroots', kicker: 'Community drive', title: 'Plant 10,000 Trees', short: '10,000 trees', word: 'Plant', sub: 'Join neighbors across the city for a morning of planting, coffee and fresh air.', cta: 'Volunteer', handle: '@greenroots', url: 'greenroots.org', stat: ['10K', 'trees this year'], items: ['Gloves & tools provided', 'Family friendly', 'Free breakfast', 'Every tree is mapped'], date: ['22', 'Apr', 'Earth Day · April 22', '9am – 1pm'], place: 'Riverside Park, North Lawn', price: 'Free', badge: 'Join us', quote: 'My kids check on “their” tree every weekend. That’s the whole point.', author: 'Rosa Jiménez', role: 'Volunteer', tags: ['Climate', 'Community', 'Family'], chart: [['2022', 1800], ['2023', 4200], ['2024', 7300], ['2025', 10000]], vs: ['2020', 'Today'], count: ['10', 'days to go'], ep: 'Drive 05', menu: [['Plant a tree', '$10'], ['Grove of 10', '$90'], ['Street trees', '$250'], ['Sponsor', '$1,000']], person: 'Omar Haddad', job: 'Program Director', pairs: ['round', 'geo', 'bookish', 'condensed', 'grotesk'], pals: ['forest', 'mint', 'sage', 'sky', 'citrus'] },
  { id: 'finance', name: 'Finance tips', brand: 'Clearbook', kicker: 'Money, simply', title: '5 Money Habits That Actually Work', short: '5 money habits', word: 'Save', sub: 'Small, boring, automatic. The habits that quietly add up to real wealth.', cta: 'Get the guide', handle: '@clearbook', url: 'clearbook.money', stat: ['$4,200', 'saved in year one'], items: ['Pay yourself first', 'Automate everything', 'One fun budget', 'Review every Sunday'], date: ['01', 'Jan', 'Start January 1', ''], place: 'Free online course', price: 'Free', badge: 'Save this', quote: 'Automating my savings did more in six months than a decade of good intentions.', author: 'Daniel Kim', role: 'Reader', tags: ['Budgeting', 'Investing', 'Habits'], chart: [['Y1', 4200], ['Y2', 9100], ['Y3', 14800], ['Y4', 21000]], vs: ['Spending', 'Saving'], count: ['5', 'minutes a week'], ep: 'Tip 05', menu: [['Emergency fund', '3 mo'], ['Retirement', '15%'], ['Fun money', '10%'], ['Investing', 'monthly']], person: 'Elena Petrova', job: 'Financial Planner', pairs: ['grotesk', 'geo', 'condensed', 'editorial', 'rubik'], pals: ['mint', 'cobalt', 'mono', 'midnight', 'sage'] },
  { id: 'fashion', name: 'Fashion', brand: 'Maison Vale', kicker: 'The autumn edit', title: 'Quiet Layers', short: 'Autumn edit', word: 'Edit', sub: 'Wool, suede and soft tailoring in the colors of late October.', cta: 'Shop the edit', handle: '@maisonvale', url: 'maisonvale.com', stat: ['24', 'new pieces'], items: ['Double-faced wool coat', 'Suede ankle boots', 'Merino rollneck', 'Wide-leg trousers'], date: ['10', 'Oct', 'Available Oct 10', ''], place: 'Flagship & online', price: '$340', badge: 'New season', quote: 'Clothes that feel like a deep breath. I wear the coat every single day.', author: 'Sofia Laurent', role: 'Stylist', tags: ['Outerwear', 'Knitwear', 'Tailoring'], chart: [['Aug', 14], ['Sep', 22], ['Oct', 37], ['Nov', 41]], vs: ['Day', 'Night'], count: ['48', 'hours early access'], ep: 'Look 07', menu: [['Coat', '$340'], ['Boots', '$220'], ['Rollneck', '$140'], ['Trousers', '$180']], person: 'Julien Vale', job: 'Creative Director', pairs: ['luxe', 'instrument', 'editorial', 'poster', 'classic'], pals: ['gold', 'terracotta', 'mono', 'sand', 'plum'] },
  { id: 'hiring', name: 'Hiring', brand: 'Fieldwork', kicker: 'We’re hiring', title: 'Build the Future of Field Science', short: 'We’re hiring!', word: 'Join', sub: 'Remote-friendly, four-day weeks, and teammates who care about the craft.', cta: 'See open roles', handle: '@fieldwork', url: 'fieldwork.io/jobs', stat: ['14', 'open roles'], items: ['Senior Product Designer', 'Staff Backend Engineer', 'Data Scientist', 'Customer Success Lead'], date: ['31', 'Jul', 'Apply by July 31', ''], place: 'Remote · Berlin · Toronto', price: '', badge: 'Remote OK', quote: 'The first job where I’m trusted to do my best work — and given the time to do it.', author: 'Tariq Malik', role: 'Senior Engineer', tags: ['Design', 'Engineering', 'Data', 'Support'], chart: [['2022', 12], ['2023', 28], ['2024', 47], ['2025', 70]], vs: ['Old way', 'Our way'], count: ['14', 'open roles'], ep: 'Role 03', menu: [['Design', '3 roles'], ['Engineering', '6 roles'], ['Data', '2 roles'], ['Support', '3 roles']], person: 'Maya Chen', job: 'Head of Talent', pairs: ['grotesk', 'geo', 'art', 'round', 'rubik'], pals: ['cobalt', 'citrus', 'lavender', 'mint', 'paper'] }
].map(t => ({ ...t, email: 'hello@' + t.url.split('/')[0], phone: '+1 (415) 555-0' + (100 + t.id.length * 37).toString().slice(0, 3) }));
export const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
export { TOPICS };

/* ---------- text metrics ---------- */
function estLines(text, size, w, wf) {
  const cw = size * wf; let n = 0;
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean); n++;
    let cur = -1;
    for (const wd of words) { const L = wd.length * cw; if (cur < 0) cur = L; else if (cur + cw * .9 + L <= w) cur += cw * .9 + L; else { n++; cur = L; } }
  }
  return Math.max(1, n);
}
function fitSize(text, w, max, maxLines, maxH, wf, lh) {
  let s = max; const longest = Math.max(1, ...String(text).split(/\s+/).map(x => x.length));
  for (let i = 0; i < 90; i++) { const n = estLines(text, s, w, wf); if (n <= maxLines && n * s * lh <= maxH && longest * s * wf <= w) break; s *= .95; }
  return s;
}
function splitLines(text, n) {
  const words = String(text).split(/\s+/); if (words.length <= n) return words;
  const total = text.length, target = total / n, out = []; let cur = '';
  for (const w of words) { if (cur && (cur + ' ' + w).length > target * 1.15 && out.length < n - 1) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }
  out.push(cur); return out;
}
function seeded(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const r1 = v => Math.round(v * 10) / 10;
export const NOFILTER = { b: 1, c: 1, s: 1, bl: 0, g: 0, se: 0, hu: 0 };

/* ---------- layout context ---------- */
function makeCtx(W, H, P, F, C, rng, kind) {
  const u = Math.min(W, H) / 100, ar = W / H;
  const cls = ar >= 2.2 ? 'banner' : ar > 1.25 ? 'wide' : ar >= .8 ? 'square' : 'tall';
  const c = { W, H, u, ar, cls, P, F, C, rng, kind, m: u * 7, els: [], bgc: P.bg };
  const push = e => (c.els.push(e), e);
  const base = (type, x, y, w, h, o, name) => ({ id: nid(), type, name: o.name || name, x: r1(x), y: r1(y), w: r1(w), h: r1(h), rot: o.rot || 0, opacity: o.op ?? 1 });
  c.bg = col => { c.bgc = col; };
  c.t = (text, x, y, w, size, o = {}) => {
    const d = o.f === 'd'; const font = o.font || (d ? F.display : F.body);
    const upper = o.upper ?? (d ? F.upper : false); const ls = o.ls ?? (d ? F.track : 0); const lh = o.lh ?? (d ? F.lh : 1.35);
    const wf = (font === F.display ? F.wf : F.bwf) * (upper ? 1.2 : 1) * 1.05 + ls;
    const e = push({ ...base('text', x, y, w, 0, o, d ? 'Heading' : 'Text'), text: String(text), font, size: r1(size), weight: o.weight ?? (d ? F.dw : 400), italic: !!o.italic, color: o.color || P.ink, align: o.align || 'left', lh, ls, upper, bg: o.bg || null, outline: o.outline || null });
    e.h = r1(estLines(e.text, size, w, wf) * size * lh + (o.bg ? size * .3 : 0));
    return e;
  };
  c.hd = (text, x, y, w, max, lines, maxH, o = {}) => {
    const upper = o.upper ?? F.upper, ls = o.ls ?? F.track, lh = o.lh ?? F.lh;
    const wf = (o.font && o.font !== F.display ? F.bwf : F.wf) * (upper ? 1.2 : 1) * 1.05 + ls;
    return c.t(text, x, y, w, fitSize(text, w, max, lines, maxH ?? 1e9, wf, lh), { f: 'd', ...o });
  };
  c.s = (shape, x, y, w, h, o = {}) => push({ ...base('shape', x, y, w, h, o, shape[0].toUpperCase() + shape.slice(1)), shape, fill: o.fill === undefined ? P.accent : o.fill, stroke: o.stroke || null, sw: o.sw || 0, radius: o.radius || 0, points: o.points || 5, inner: o.inner || .5, sides: o.sides || 6, pts: o.pts || null, dash: !!o.dash, shadow: !!o.shadow });
  c.r = (x, y, w, h, o) => c.s('rect', x, y, w, h, o);
  c.o = (x, y, w, h, o) => c.s('ellipse', x, y, w, h, o);
  c.l = (x, y, w, o = {}) => { const sw = o.sw || u * .3, hh = Math.max(sw * 3, 8); return push({ ...base('line', x, y - hh / 2, w, hh, o, 'Line'), stroke: o.stroke || P.ink, sw, dash: !!o.dash, arrow: !!o.arrow }); };
  c.i = (x, y, w, h, o = {}) => push({ ...base('image', x, y, w, h, o, 'Image'), asset: null, label: o.label || 'Photo', tint: o.tint || P.tint, mask: o.mask || 'none', radius: o.radius || 0, cx: 50, cy: 50, zoom: 1, flip: false, filters: { ...NOFILTER }, border: o.border || null, borderW: o.borderW || 0, shadow: !!o.shadow });
  c.q = (x, y, s, value, o = {}) => push({ ...base('qr', x, y, s, s, o, 'QR code'), value, fg: o.fg || P.ink, qbg: o.bg || P.bg });
  c.ch = (x, y, w, h, o = {}) => push({ ...base('chart', x, y, w, h, o, 'Chart'), chart: o.chart || 'bar', data: (o.data || C.chart).map(([l, v]) => ({ l, v })), colors: o.colors || [P.accent, P.accent2, P.ink, P.muted], ink: o.ink || P.ink, font: F.body, labels: true });
  c.btn = (text, x, y, size, o = {}) => {
    const g = nid(), padX = size * 1.3, padY = size * .72, upper = !!o.upper;
    const tw = text.length * size * (F.bwf * (upper ? 1.2 : 1) * 1.08 + .02);
    const w = tw + padX * 2, h = size * 1.3 + padY * 2;
    const bx = o.anchor === 'center' ? x - w / 2 : o.anchor === 'right' ? x - w : x;
    const rect = c.r(bx, y, w, h, { fill: o.fill || P.accent, radius: o.square ? size * .3 : h / 2, stroke: o.stroke, sw: o.sw, name: 'Button' });
    const t = c.t(text, bx, y + padY, w, size, { weight: o.weight || 700, color: o.color || P.onAccent, align: 'center', upper, ls: .02, lh: 1.3, name: 'Button label' });
    rect.groupId = g; t.groupId = g; t.h = r1(size * 1.3);
    return { w, h, x: bx, els: [rect, t], get y() { return rect.y; }, set y(v) { rect.y = r1(v); t.y = r1(v + padY); } };
  };
  c.sticker = (text, cx, cy, d, o = {}) => {
    const g = nid();
    const sh = c.s(o.shape || 'ellipse', cx - d / 2, cy - d / 2, d, d, { fill: o.fill || P.accent, points: o.points || 14, inner: o.inner || .84, rot: o.rot || 0, name: 'Sticker' });
    const t = c.hd(text, cx - d * .35, 0, d * .7, d * .19, 3, d * .52, { color: o.color || P.onAccent, align: 'center', rot: o.rot || 0, lh: 1.02, ...(o.t || {}) });
    t.y = r1(cy - t.h / 2); sh.groupId = g; t.groupId = g; return sh;
  };
  c.vstack = (items, gaps, top, bottom, al = 'center') => {
    const tot = items.reduce((a, it) => a + it.h, 0) + gaps.reduce((a, g) => a + g, 0);
    let y = al === 'top' ? top : al === 'bottom' ? bottom - tot : top + (bottom - top - tot) / 2;
    items.forEach((it, i) => { it.y = r1(y); y += it.h + (gaps[i] || 0); });
    return tot;
  };
  c.kick = (x, y, w, o = {}) => c.t(o.text || C.kicker, x, y, w, o.size || u * 2.9, { weight: 700, upper: true, ls: .16, color: o.color || P.hi, align: o.align, name: 'Kicker' });
  c.pills = (tags, x, y, maxW, size, o = {}) => {
    let cx = x, cy = y, rowH = 0; const out = [];
    tags.forEach(t => { const b = c.btn(t, 0, 0, size, { fill: o.fill ?? 'transparent', color: o.color || P.ink, stroke: o.stroke || P.ink, sw: u * .25, weight: 600 }); if (cx + b.w > x + maxW && cx > x) { cx = x; cy += rowH + size * .7; rowH = 0; } b.els[0].x = r1(cx); b.els[1].x = r1(cx); b.y = cy; cx += b.w + size * .6; rowH = Math.max(rowH, b.h); out.push(b); });
    return cy + rowH - y;
  };
  c.rotC = (cx, cy, dx, dy, deg) => { const a = deg * Math.PI / 180; return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]; };
  return c;
}

/* ---------- layouts ---------- */
export const LAYOUTS = [];
const A3 = ['wide', 'square', 'tall'];
const def = (id, name, kinds, cls, fn) => LAYOUTS.push({ id, name, kinds, cls, fn });

def('big-type', 'Big Type', 'tsdp', A3, c => {
  const { W, H, u, m, P, C } = c; const fy = H - m - u * 3.4;
  c.kick(m, m, W - 2 * m);
  c.t(C.handle, m, fy, W / 2 - m, u * 3, { weight: 700 });
  c.t(C.url, W / 2, fy, W / 2 - m, u * 3, { align: 'right', color: P.muted });
  const sub = c.t(C.sub, m, 0, Math.min(W - 2 * m, u * 80), u * 3.6, { color: P.muted });
  const bar = c.r(m, 0, u * 14, u * 1.2, { fill: P.accent });
  const top = m + u * 9, bot = fy - u * 5;
  const hd = c.hd(C.title, m, 0, W - 2 * m, u * (c.cls === 'tall' ? 19 : 17), 4, bot - top - sub.h - u * 9);
  c.vstack([hd, bar, sub], [u * 4, u * 4], top, bot);
});

def('split-photo', 'Photo Split', 'tsdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const iw = W * .48; c.i(W - iw, 0, iw, H, { label: 'Photo' });
    const x = m, w = W - iw - 2 * m;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, w, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, x, 0, u * 3.2);
    const hd = c.hd(C.title, x, 0, w, u * 15, 4, H - 2 * m - k.h - s.h - b.h - u * 14);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const ih = H * (cls === 'tall' ? .55 : .5); c.i(0, 0, W, ih, { label: 'Photo' });
    c.sticker(C.badge, W - m - u * 9, ih, u * 19, { fill: P.accent, rot: 10 });
    const x = m, w = W - 2 * m - u * 12;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, W - 2 * m, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, x, 0, u * 3.2);
    const top = ih + u * 7, bot = H - m;
    const hd = c.hd(C.title, x, 0, W - 2 * m, u * 12, 3, bot - top - k.h - s.h - b.h - u * 12);
    c.vstack([k, hd, s, b], [u * 2.5, u * 3, u * 4.5], top, bot);
  }
});

def('photo-band', 'Photo Band', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.i(0, 0, W, H, { label: 'Full-bleed photo' });
  const bandH = cls === 'wide' ? H * .4 : H * .34;
  c.r(0, H - bandH, W, bandH, { fill: P.accent, name: 'Band' });
  c.btn(C.badge, m, m, u * 2.8, { fill: P.bg, color: P.ink, upper: true });
  const k = c.kick(m, 0, W - 2 * m, { color: P.onAccent });
  const hd = c.hd(C.title, m, 0, W - 2 * m, u * 14, 2, bandH - u * 12 - k.h, { color: P.onAccent });
  c.vstack([k, hd], [u * 2], H - bandH + u * 3, H - u * 3);
});

def('circle-portrait', 'Circle Portrait', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const wide = cls === 'wide';
  const d = wide ? H * .72 : Math.min(W * .6, H * .44);
  const cx = wide ? W - m - d / 2 - u * 3 : W / 2, cy = wide ? H / 2 : m + d / 2 + u * 5;
  c.o(cx - d / 2 + u * 3.5, cy - d / 2 + u * 3.5, d, d, { fill: P.accent, name: 'Offset disc' });
  c.o(cx - d / 2 - u * 3, cy - d / 2 - u * 3, d + u * 6, d + u * 6, { fill: null, stroke: P.ink, sw: u * .4, name: 'Ring' });
  c.i(cx - d / 2, cy - d / 2, d, d, { mask: 'circle', label: 'Portrait' });
  c.o(cx - d * .52, cy + d * .26, u * 9, u * 9, { fill: P.accent2, name: 'Dot' });
  if (wide) {
    const x = m, w = cx - d / 2 - u * 8 - m;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, w, u * 3.4, { color: P.muted });
    const hd = c.hd(C.title, x, 0, w, u * 15, 4, H - 2 * m - k.h - s.h - u * 8);
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    const top = cy + d / 2 + u * 8, w = W - 2 * m;
    const k = c.kick(m, 0, w, { align: 'center' }); const s = c.t(C.sub, m + u * 6, 0, w - u * 12, u * 3.4, { color: P.muted, align: 'center' });
    const hd = c.hd(C.title, m, 0, w, u * 11, 3, H - m - top - k.h - s.h - u * 6, { align: 'center' });
    c.vstack([k, hd, s], [u * 2.5, u * 3], top, H - m);
  }
});

def('centered-badge', 'Ring & Badge', 'sdp', A3, c => {
  const { W, H, u, P, C } = c;
  const d = Math.min(W, H) * .86;
  c.o(W / 2 - d / 2, H / 2 - d / 2, d, d, { fill: null, stroke: P.accent, sw: u * .6, name: 'Ring' });
  c.o(W / 2 - d / 2 + u * 3, H / 2 - d / 2 + u * 3, d - u * 6, d - u * 6, { fill: null, stroke: P.accent, sw: u * .25, dash: true, name: 'Dashed ring' });
  const w = d * .7, x = W / 2 - w / 2;
  const k = c.kick(x, 0, w, { align: 'center' });
  const s = c.t(C.sub, x + w * .08, 0, w * .84, u * 3.2, { color: P.muted, align: 'center' });
  const hd = c.hd(C.title, x, 0, w, u * 12, 3, d * .42, { align: 'center' });
  c.vstack([k, hd, s], [u * 3, u * 3.5], H / 2 - d * .38, H / 2 + d * .38);
  c.sticker(C.badge, W / 2 + d * .36, H / 2 - d * .36, u * 20, { shape: 'star', fill: P.accent2, color: P.onAccent2, rot: 12, points: 12 });
});

def('stripes', 'Stripes', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const cols = [P.accent, P.accent2, P.ink, P.accent, P.accent2]; const n = 5;
  if (cls === 'wide') {
    const x0 = W * .64, sw = (W - x0) / n;
    cols.forEach((col, i) => c.r(x0 + i * sw, 0, sw + .5, H, { fill: col, name: 'Stripe' }));
    c.sticker(C.badge, x0, H - m - u * 10, u * 20, { fill: P.bg, color: P.ink, rot: -8 });
    const w = x0 - 2 * m - u * 4;
    const k = c.kick(m, 0, w); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.muted }); const b = c.btn(C.cta, m, 0, u * 3.2);
    const hd = c.hd(C.title, m, 0, w, u * 15, 4, H - 2 * m - k.h - s.h - b.h - u * 14);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const hh = H * (cls === 'tall' ? .3 : .28), sh = hh / n;
    cols.forEach((col, i) => c.r(0, i * sh, W, sh + .5, { fill: col, name: 'Stripe' }));
    c.sticker(C.badge, W - m - u * 10, hh, u * 20, { fill: P.bg, color: P.ink, rot: -8 });
    const w = W - 2 * m;
    const k = c.kick(m, 0, w); const s = c.t(C.sub, m, 0, w, u * 3.6, { color: P.muted }); const b = c.btn(C.cta, m, 0, u * 3.2);
    const top = hh + u * 12;
    const hd = c.hd(C.title, m, 0, w, u * 14, 4, H - m - top - k.h - s.h - b.h - u * 12);
    c.vstack([k, hd, s, b], [u * 3, u * 4, u * 5], top, H - m);
  }
});

def('sale-burst', 'Burst', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  c.bg(P.accent);
  const d = wide ? H * .8 : Math.min(W * .62, H * .42);
  const cx = wide ? W - m - d / 2 : W / 2, cy = wide ? H / 2 : m + d / 2 + u * 2;
  const g = nid();
  c.s('star', cx - d / 2, cy - d / 2, d, d, { points: 18, inner: .84, fill: P.bg, rot: -8, name: 'Burst' }).groupId = g;
  const st = c.hd(C.stat[0], cx - d * .34, 0, d * .68, d * .3, 1, d * .3, { color: P.ink, align: 'center', rot: -8 });
  const sl = c.t(C.stat[1], cx - d * .3, 0, d * .6, d * .055, { color: P.ink, align: 'center', weight: 700, upper: true, ls: .08, rot: -8 });
  st.groupId = g; sl.groupId = g;
  c.vstack([st, sl], [d * .02], cy - d * .3, cy + d * .3);
  const x = m, w = wide ? cx - d / 2 - m - u * 4 : W - 2 * m;
  const top = wide ? m : cy + d / 2 + u * 5;
  const k = c.kick(x, 0, w, { color: P.onAccent });
  const b = c.btn(C.cta, x, 0, u * 3.2, { fill: P.onAccent, color: P.accent });
  const hd = c.hd(C.title, x, 0, w, u * 14, 3, H - m - top - k.h - b.h - u * 10, { color: P.onAccent });
  c.vstack([k, hd, b], [u * 3, u * 5], top, H - m);
});

def('quote', 'Quote', 'sdp', A3, c => {
  const { W, H, u, m, P, C, F } = c;
  c.bg(P.surface);
  c.t('“', m - u, m - u * 5, u * 30, u * 34, { f: 'd', font: F.display === 'Anton' || F.upper ? 'Playfair Display' : F.display, color: P.hi, lh: 1, upper: false, name: 'Quote mark' });
  const w = W - 2 * m;
  const a = c.t(C.author, m, 0, w, u * 3.4, { weight: 700, color: P.onSurface });
  const r = c.t(C.role || C.brand, m, 0, w, u * 3, { color: mix(P.onSurface, P.surface, .3) });
  const ln = c.r(m, 0, u * 10, u * .8, { fill: P.accent });
  const q = c.hd(C.quote, m, 0, w, u * (c.cls === 'wide' ? 8 : 8.5), 6, H - m * 2 - u * 26 - a.h - r.h, { upper: false, color: P.onSurface, lh: 1.15 });
  c.vstack([q, ln, a, r], [u * 5, u * 3, u * .6], m + u * 20, H - m);
});

def('grid-four', 'Photo Grid', 'sp', A3, c => {
  const { W, H, u, P, C } = c; const g = u * 1.2;
  const cw = (W - g * 3) / 2, chh = (H - g * 3) / 2;
  [0, 1, 2, 3].forEach(i => c.i(g + (i % 2) * (cw + g), g + Math.floor(i / 2) * (chh + g), cw, chh, { label: 'Photo ' + (i + 1) }));
  const cwid = Math.min(W, H) * .6, x = W / 2 - cwid / 2;
  const card = c.r(x, 0, cwid, 10, { fill: P.bg, radius: u * 2, name: 'Card' });
  const k = c.kick(x + u * 4, 0, cwid - u * 8, { align: 'center' });
  const hd = c.hd(C.title, x + u * 4, 0, cwid - u * 8, u * 8, 3, u * 26, { align: 'center' });
  const hn = c.t(C.handle, x + u * 4, 0, cwid - u * 8, u * 2.8, { align: 'center', color: P.muted, weight: 600 });
  const tot = k.h + hd.h + hn.h + u * 5 + u * 10;
  card.h = r1(tot); card.y = r1(H / 2 - tot / 2);
  c.vstack([k, hd, hn], [u * 2.5, u * 2.5], card.y + u * 5, card.y + tot - u * 5);
});

def('framed-poster', 'Framed', 'sdp', A3, c => {
  const { W, H, u, P, C } = c; const ins = u * 4;
  c.r(ins, ins, W - 2 * ins, H - 2 * ins, { fill: null, stroke: P.ink, sw: u * .35, name: 'Frame' });
  c.r(ins + u * 1.5, ins + u * 1.5, W - 2 * ins - u * 3, H - 2 * ins - u * 3, { fill: null, stroke: P.ink, sw: u * .12, name: 'Inner frame' });
  const w = W - 2 * (ins + u * 9), x = W / 2 - w / 2;
  c.t(C.kicker, x, ins + u * 8, w, u * 2.6, { align: 'center', upper: true, ls: .3, weight: 600, color: P.ink });
  const dm = c.s('diamond', W / 2 - u * 1.6, 0, u * 3.2, u * 3.2, { fill: P.accent });
  const dt = c.t(C.date[2], x, 0, w, u * 3.2, { align: 'center', upper: true, ls: .18, weight: 700, color: P.ink });
  const pl = c.t(C.place, x, 0, w, u * 3, { align: 'center', color: P.muted });
  const hd = c.hd(C.title, x, 0, w, u * 15, 3, H - 2 * ins - u * 40 - dt.h - pl.h, { align: 'center' });
  c.vstack([dm, hd, dt, pl], [u * 5, u * 5, u * 1.5], ins + u * 16, H - ins - u * 14);
  c.t(C.url, x, H - ins - u * 9, w, u * 2.4, { align: 'center', upper: true, ls: .2, color: P.muted });
});

def('diagonal', 'Diagonal', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.i(0, 0, W, H, { label: 'Photo' });
  if (cls === 'wide') {
    c.s('poly', 0, 0, W, H, { pts: [[0, 0], [.6, 0], [.44, 1], [0, 1]], fill: P.accent, name: 'Diagonal' });
    const w = W * .4 - m;
    const k = c.kick(m, 0, w, { color: P.onAccent }); const s = c.t(C.sub, m, 0, w * .92, u * 3.3, { color: P.onAccent });
    const hd = c.hd(C.title, m, 0, w, u * 14, 4, H - 2 * m - k.h - s.h - u * 8, { color: P.onAccent });
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    c.s('poly', 0, 0, W, H, { pts: [[0, .52], [1, .4], [1, 1], [0, 1]], fill: P.accent, name: 'Diagonal' });
    const w = W - 2 * m, top = H * .52 + u * 4;
    const k = c.kick(m, 0, w, { color: P.onAccent }); const s = c.t(C.sub, m, 0, w, u * 3.4, { color: P.onAccent });
    const hd = c.hd(C.title, m, 0, w, u * 13, 3, H - m - top - k.h - s.h - u * 7, { color: P.onAccent });
    c.vstack([k, hd, s], [u * 2.5, u * 3.5], top, H - m);
  }
});

function numberedRows(c, items, x, w, top, bot, o = {}) {
  const { u, P } = c; const d = u * (o.d || 8.5), size = u * (o.size || 3.8); const rows = [];
  items.forEach((it, i) => {
    const g = nid();
    const dot = o.check ? c.o(x, 0, d, d, { fill: null, stroke: P.accent, sw: u * .5, name: 'Check' }) : c.o(x, 0, d, d, { fill: P.accent, name: 'Number' });
    const num = c.t(o.check ? '✓' : String(i + 1), x, 0, d, d * .48, { f: 'd', upper: false, align: 'center', color: o.check ? P.hi : P.onAccent, lh: 1, font: o.check ? c.F.body : undefined, weight: 700 });
    const t = c.t(it, x + d + u * 3.5, 0, w - d - u * 3.5, size, { weight: 600, lh: 1.25 });
    dot.groupId = num.groupId = t.groupId = g;
    rows.push({ h: Math.max(d, t.h), set y(v) { dot.y = r1(v + (Math.max(d, t.h) - d) / 2); num.y = r1(dot.y + d / 2 - d * .26); t.y = r1(v + (Math.max(d, t.h) - t.h) / 2); } });
  });
  const gap = Math.max(u * 3, Math.min(u * 7, (bot - top - rows.reduce((a, r) => a + r.h, 0)) / Math.max(1, rows.length)));
  c.vstack(rows, rows.map(() => gap), top, bot);
}
def('numbered-list', 'Numbered List', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const lw = W * .42 - m;
    const k = c.kick(m, 0, lw); const hd = c.hd(C.title, m, 0, lw, u * 12, 4, H - 2 * m - u * 16);
    const h = c.t(C.handle, m, 0, lw, u * 3, { weight: 700, color: P.muted });
    c.vstack([k, hd, h], [u * 3, u * 5], m, H - m);
    c.r(W * .46, m, u * .3, H - 2 * m, { fill: P.line, name: 'Divider' });
    numberedRows(c, C.items.slice(0, 4), W * .5, W * .5 - m, m, H - m);
  } else {
    const k = c.kick(m, m, W - 2 * m);
    const hd = c.hd(C.title, m, m + k.h + u * 2.5, W - 2 * m, u * 11, 3, H * .3);
    const top = hd.y + hd.h + u * 9;
    c.r(m, top - u * 4.5, W - 2 * m, u * .3, { fill: P.line, name: 'Divider' });
    numberedRows(c, C.items.slice(0, cls === 'tall' ? 4 : 3), m, W - 2 * m, top, H - m - u * 8);
    c.t(C.handle, m, H - m - u * 3, W - 2 * m, u * 3, { weight: 700, color: P.muted });
  }
});

def('event-date', 'Event Date', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const cw = W * .34; c.r(0, 0, cw, H, { fill: P.accent, name: 'Date column' });
    const dn = c.hd(C.date[0], m, 0, cw - 2 * m, H * .5, 1, H * .45, { color: P.onAccent, align: 'center', upper: false });
    const mo = c.t(C.date[1], m, 0, cw - 2 * m, u * 7, { f: 'd', color: P.onAccent, align: 'center', upper: true });
    c.vstack([dn, mo], [u * 1], m, H - m);
    const x = cw + m, w = W - cw - 2 * m;
    const k = c.kick(x, 0, w); const t2 = c.t(C.date[3] + '  ·  ' + C.place, x, 0, w, u * 3.4, { weight: 600 }); const b = c.btn(C.cta, x, 0, u * 3);
    const hd = c.hd(C.title, x, 0, w, u * 14, 3, H - 2 * m - k.h - t2.h - b.h - u * 14);
    c.vstack([k, hd, t2, b], [u * 3, u * 4, u * 5], m, H - m);
  } else {
    const dn = c.hd(C.date[0], m - u, m, W * .55, u * 42, 1, H * .3, { color: P.hi, upper: false, lh: .9 });
    c.t(C.date[1], m + W * .5, m + dn.h * .2, W * .45 - m * 2, u * 9, { f: 'd', upper: true });
    c.t(C.date[3], m + W * .5, m + dn.h * .2 + u * 11, W * .45 - m * 2, u * 3.4, { weight: 600, color: P.muted });
    c.l(m, dn.y + dn.h + u * 4, W - 2 * m, { sw: u * .35, stroke: P.ink });
    const top = dn.y + dn.h + u * 9;
    const k = c.kick(m, 0, W - 2 * m); const pl = c.t(C.place, m, 0, W - 2 * m, u * 3.6, { weight: 600 }); const b = c.btn(C.cta, m, 0, u * 3.2);
    const hd = c.hd(C.title, m, 0, W - 2 * m, u * 13, 3, H - m - top - k.h - pl.h - b.h - u * 13);
    c.vstack([k, hd, pl, b], [u * 3, u * 4, u * 5], top, H - m, 'top');
  }
});

def('arch-window', 'Arch Window', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  if (cls === 'wide') {
    const ah = H - 2 * m, aw = ah * .66;
    c.o(m + aw * .72, m - u * 2, u * 14, u * 14, { fill: P.accent2, name: 'Sun' });
    c.i(m, m, aw, ah, { mask: 'arch', label: 'Photo' });
    const x = m * 2 + aw + u * 3, w = W - x - m;
    const k = c.kick(x, 0, w); const s = c.t(C.sub, x, 0, w, u * 3.4, { color: P.muted });
    const hd = c.hd(C.title, x, 0, w, u * 14, 3, H - 2 * m - k.h - s.h - u * 8);
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    const aw = W * .62, ah = H * (cls === 'tall' ? .5 : .5);
    c.o(W / 2 + aw * .3, m - u, u * 16, u * 16, { fill: P.accent2, name: 'Sun' });
    c.i(W / 2 - aw / 2, m + u * 3, aw, ah, { mask: 'arch', label: 'Photo' });
    const top = m + u * 3 + ah + u * 6, w = W - 2 * m;
    const k = c.kick(m, 0, w, { align: 'center' }); const s = c.t(C.sub, m + u * 5, 0, w - u * 10, u * 3.2, { color: P.muted, align: 'center' });
    const hd = c.hd(C.title, m, 0, w, u * 11, 2, H - m - top - k.h - s.h - u * 6, { align: 'center' });
    c.vstack([k, hd, s], [u * 2.5, u * 3], top, H - m);
  }
});

def('outline-type', 'Outline Type', 'tsp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const word = C.word.toUpperCase(); const w = W - 2 * m;
  const s = c.t(C.sub, m, 0, Math.min(w, u * 70), u * 3.4, { color: P.muted });
  const b = c.btn(C.cta, m, 0, u * 3);
  const avail = H - 2 * m - s.h - b.h - u * 12;
  const probe = c.hd(word, m, 0, w, u * 34, 1, avail / 3 / .92, { lh: .92, upper: true, outline: P.ink, name: 'Outline 1' });
  const l2 = c.t(word, m, 0, w, probe.size, { f: 'd', lh: .92, upper: true, color: P.hi, name: 'Solid' });
  const l3 = c.t(word, m, 0, w, probe.size, { f: 'd', lh: .92, upper: true, outline: P.ink, name: 'Outline 2' });
  c.vstack([probe, l2, l3, s, b], [0, 0, u * 5, u * 4], m, H - m);
});

def('product-spot', 'Spotlight', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const d = wide ? H * .86 : Math.min(W, H) * .72;
  const cx = wide ? W - m - d / 2 : W / 2, cy = wide ? H / 2 : H * .52;
  c.o(cx - d / 2, cy - d / 2, d, d, { fill: P.accent2, name: 'Spot' });
  const iw = d * .6, ih = d * .74;
  c.i(cx - iw / 2, cy - ih / 2, iw, ih, { radius: u * 2, label: 'Product', shadow: true });
  c.sticker(C.price || C.badge, cx + iw / 2, cy - ih / 2 + u * 4, u * 18, { fill: P.accent, rot: 10 });
  if (wide) {
    const w = cx - d / 2 - 2 * m;
    const k = c.kick(m, 0, w); const b = c.btn(C.cta, m, 0, u * 3.2);
    const hd = c.hd(C.title, m, 0, w, u * 14, 3, H - 2 * m - k.h - b.h - u * 10);
    c.vstack([k, hd, b], [u * 3, u * 5], m, H - m);
  } else {
    const k = c.kick(m, m, W - 2 * m, { align: 'center' });
    c.hd(C.title, m, m + k.h + u * 2, W - 2 * m, u * 9, 2, cy - d / 2 - m - k.h - u * 4, { align: 'center' });
    c.btn(C.cta, W / 2, H - m - u * 7.5, u * 3, { anchor: 'center' });
  }
});

def('magazine', 'Magazine Cover', 'sp', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  c.i(0, 0, W, H, { label: 'Cover photo' });
  const mast = c.hd(C.brand.toUpperCase(), m, m * .6, W - 2 * m, u * 26, 1, u * 20, { align: 'center', color: P.accent, upper: true, name: 'Masthead' });
  c.t('Issue 12  ·  ' + C.date[2], m, mast.y + mast.h + u * .5, W - 2 * m, u * 2.4, { align: 'center', upper: true, ls: .2, weight: 700, color: '#FFFFFF' });
  c.r(0, H * .58, W, H * .42, { fill: '#000000', op: .42, name: 'Scrim' });
  const w = W * .7;
  const hd = c.hd(C.title, m, 0, w, u * 11, 3, H * .2, { color: '#FFFFFF' });
  const lines = C.items.slice(0, 3).map(t => c.t('— ' + t, m, 0, w, u * 3.2, { color: '#FFFFFF', weight: 600 }));
  c.vstack([hd, ...lines], [u * 3, u * 1, u * 1], H * .6, H - m);
  c.sticker(C.badge, W - m - u * 10, H * .6, u * 20, { fill: P.accent, rot: 12 });
});

def('minimal-corner', 'Minimal', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const d = Math.min(W, H) * .9;
  c.o(W - d * .6, -d * .4, d, d, { fill: P.accent, name: 'Sun' });
  c.kick(m, m, W * .45, { color: P.ink });
  c.t(C.date[2], m, H - m - u * 3, W / 2, u * 2.8, { weight: 700, upper: true, ls: .1 });
  c.t(C.url, W / 2, H - m - u * 3, W / 2 - m, u * 2.8, { align: 'right', color: P.muted });
  const s = c.t(C.sub, m, 0, Math.min(W * .6, u * 70), u * 3.2, { color: P.muted });
  const hd = c.hd(C.title, m, 0, W * .74, u * 12, 3, H * .36, {});
  c.vstack([hd, s], [u * 3], 0, H - m - u * 9, 'bottom');
});

def('stat-chart', 'Stat & Chart', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const k = c.kick(m, m, W - 2 * m);
  const hd = c.hd(C.title, m, m + k.h + u * 2, cls === 'wide' ? W * .6 : W - 2 * m, u * 7.5, 2, u * 18);
  const top = hd.y + hd.h + u * 7;
  if (cls === 'wide') {
    const sw = W * .36;
    const st = c.hd(C.stat[0], m, 0, sw, u * 30, 1, u * 30, { color: P.hi, upper: false });
    const sl = c.t(C.stat[1], m, 0, sw, u * 3.6, { weight: 600, color: P.muted });
    c.vstack([st, sl], [u * 2], top, H - m);
    c.ch(m + sw + u * 6, top, W - sw - 2 * m - u * 6, H - top - m, {});
  } else {
    const st = c.hd(C.stat[0], m, top, W - 2 * m, u * 26, 1, u * 24, { color: P.hi, upper: false });
    const sl = c.t(C.stat[1], m, st.y + st.h + u, W - 2 * m, u * 3.6, { weight: 600, color: P.muted });
    const ct = sl.y + sl.h + u * 6;
    c.ch(m, ct, W - 2 * m, H - m - ct, {});
  }
});

def('ribbon', 'Ribbons', 'tsp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const k = c.kick(m, m, W - 2 * m);
  c.hd(C.title, m, m + k.h + u * 2, W - 2 * m, u * 10, 2, H * .2);
  const rh = u * 15;
  [[H * .47, -7, P.accent, P.onAccent, C.short], [H * .47 + rh * 1.15, 5, P.accent2, P.onAccent2, C.word]].forEach(([cy, rot, fill, col, txt]) => {
    const g = nid();
    const r = c.r(-W * .15, cy - rh / 2, W * 1.3, rh, { fill, rot, name: 'Ribbon' });
    const t = c.hd(`${txt}  ·  ${txt}  ·  ${txt}`, -W * .1, 0, W * 1.2, rh * .55, 1, rh * .7, { color: col, align: 'center', rot, upper: true });
    t.y = r1(cy - t.h / 2); r.groupId = t.groupId = g;
  });
  const s = c.t(C.sub, m, 0, W * .6, u * 3.2, { color: P.muted });
  const b = c.btn(C.cta, W - m, 0, u * 3, { anchor: 'right' });
  s.y = r1(H - m - s.h); b.y = H - m - b.h;
});

def('polaroid', 'Polaroid', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const fw = wide ? H * .66 : Math.min(W * .62, H * .42), fh = fw * 1.2, th = -5;
  const cx = wide ? W - m - fw / 2 - u * 4 : W / 2, cy = wide ? H / 2 : m + fh / 2 + u * 3;
  const g = nid();
  c.r(cx - fw / 2, cy - fh / 2, fw, fh, { fill: '#FFFFFF', rot: th, shadow: true, name: 'Polaroid' }).groupId = g;
  const iw = fw * .88; const [ix, iy] = c.rotC(cx, cy, 0, -fh / 2 + fw * .06 + iw / 2, th);
  c.i(ix - iw / 2, iy - iw / 2, iw, iw, { rot: th, label: 'Photo' }).groupId = g;
  const capH = fh - fw * .06 - iw; const [tx, ty] = c.rotC(cx, cy, 0, fh / 2 - capH / 2, th);
  const cap = c.t(C.place, tx - iw / 2, 0, iw, fw * .075, { font: 'Caveat', align: 'center', color: '#222222', rot: th, lh: 1, weight: 700 });
  cap.y = r1(ty - cap.h / 2); cap.groupId = g;
  if (wide) {
    const w = cx - fw / 2 - 2 * m - u * 3;
    const k = c.kick(m, 0, w); const s = c.t(C.sub, m, 0, w, u * 3.3, { color: P.muted });
    const hd = c.hd(C.title, m, 0, w, u * 13, 3, H - 2 * m - k.h - s.h - u * 8);
    c.vstack([k, hd, s], [u * 3, u * 4], m, H - m);
  } else {
    const top = cy + fh / 2 + u * 8, w = W - 2 * m;
    const k = c.kick(m, 0, w, { align: 'center' }); const s = c.t(C.sub, m + u * 5, 0, w - u * 10, u * 3.2, { color: P.muted, align: 'center' });
    const hd = c.hd(C.title, m, 0, w, u * 10, 2, H - m - top - k.h - s.h - u * 6, { align: 'center' });
    c.vstack([k, hd, s], [u * 2.5, u * 3], top, H - m);
  }
});

def('checklist', 'Checklist Card', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.accent);
  const wide = cls === 'wide';
  const hw = wide ? W * .4 - m : W - 2 * m;
  const k = c.kick(m, m, hw, { color: P.onAccent });
  const hd = c.hd(C.title, m, m + k.h + u * 2.5, hw, u * 11, 3, wide ? H * .6 : H * .26, { color: P.onAccent });
  const cx = wide ? W * .44 : m, cy = wide ? m : hd.y + hd.h + u * 6;
  const cw = wide ? W - cx - m : W - 2 * m, chh = H - cy - m;
  c.r(cx, cy, cw, chh, { fill: P.bg, radius: u * 3, name: 'Card' });
  numberedRows(c, C.items.slice(0, 4), cx + u * 6, cw - u * 12, cy + u * 6, cy + chh - u * 6, { check: true, d: 7.5, size: 3.6 });
});

def('versus', 'Versus', 'ts', ['wide', 'square'], c => {
  const { W, H, u, m, P, C } = c; const g = u * 1;
  c.bg(P.ink);
  c.i(0, 0, W / 2 - g / 2, H, { label: C.vs[0], tint: mix(P.accent, P.bg, .4) });
  c.i(W / 2 + g / 2, 0, W / 2 - g / 2, H, { label: C.vs[1], tint: mix(P.accent2, P.bg, .4) });
  const hd = c.hd(C.short, m, m, W - 2 * m, u * 11, 1, u * 13, { align: 'center', bg: P.bg, color: P.ink });
  c.sticker('VS', W / 2, H * .55, u * 24, { fill: P.accent, color: P.onAccent, rot: -6, t: { upper: true } });
  c.btn(C.vs[0], W / 4, H - m - u * 9, u * 3.4, { anchor: 'center', fill: P.bg, color: P.ink, upper: true });
  c.btn(C.vs[1], W * .75, H - m - u * 9, u * 3.4, { anchor: 'center', fill: P.accent2, color: P.onAccent2, upper: true });
});

def('reaction', 'Reaction', 'ts', ['wide', 'square'], c => {
  const { W, H, u, m, P, C } = c;
  c.bg(P.accent2);
  const d = H * .9; c.o(W - d * .85, H - d * .9, d, d, { fill: P.accent, name: 'Halo' });
  c.i(W - H * .78, H * .1, H * .72, H * .9, { label: 'Cutout — try Remove BG', tint: mix(P.accent, P.bg, .3) });
  const lines = splitLines(C.short.toUpperCase(), 2);
  const w = W * .56;
  const size = Math.min(...lines.map(l => fitSize(l, w, u * 20, 1, u * 22, c.F.wf * 1.26 + c.F.track, c.F.lh)));
  const els = lines.map((l, i) => c.t(l, m, 0, w, size, { f: 'd', upper: true, bg: i % 2 ? P.accent : P.bg, color: i % 2 ? P.onAccent : P.ink, rot: -3, lh: 1.1 }));
  c.vstack(els, els.map(() => u * 1), m, H - m - u * 12);
  c.s('arrow', W * .48, H * .68, u * 16, u * 10, { fill: P.bg, rot: -18, name: 'Arrow' });
  c.btn(C.badge, m, H - m - u * 9, u * 3, { fill: P.ink, color: P.bg, upper: true });
});

def('timeline', 'Timeline', 'sdp', A3, c => {
  const { W, H, u, m, P, C, cls } = c;
  const k = c.kick(m, m, W - 2 * m);
  const hd = c.hd(C.title, m, m + k.h + u * 2, W - 2 * m, u * 10, 2, H * .26);
  const items = C.items.slice(0, cls === 'wide' ? 4 : 4);
  if (cls === 'wide') {
    const ly = hd.y + hd.h + (H - hd.y - hd.h - m) * .4;
    c.l(m, ly, W - 2 * m, { sw: u * .4, stroke: P.ink });
    const step = (W - 2 * m) / items.length;
    items.forEach((it, i) => { const x = m + i * step; c.o(x, ly - u * 2.5, u * 5, u * 5, { fill: i === items.length - 1 ? P.accent : P.bg, stroke: P.ink, sw: u * .4 }); c.t(String(i + 1).padStart(2, '0'), x, ly - u * 11, step - u * 3, u * 4.5, { f: 'd', upper: false, color: P.hi }); c.t(it, x, ly + u * 5, step - u * 4, u * 3.2, { weight: 600 }); });
  } else {
    const top = hd.y + hd.h + u * 8, bot = H - m; const lx = m + u * 2.5;
    c.r(lx - u * .2, top, u * .4, bot - top - u * 4, { fill: P.ink, name: 'Rail' });
    const step = (bot - top) / items.length;
    items.forEach((it, i) => { const y = top + i * step; c.o(lx - u * 2.5, y, u * 5, u * 5, { fill: i === items.length - 1 ? P.accent : P.bg, stroke: P.ink, sw: u * .4 }); c.t(String(i + 1).padStart(2, '0'), m + u * 9, y - u * .5, u * 12, u * 4, { f: 'd', upper: false, color: P.hi }); c.t(it, m + u * 22, y, W - 2 * m - u * 22, u * 3.6, { weight: 600 }); });
  }
});

def('testimonial', 'Testimonial', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  c.r(W - u * 30, 0, u * 30, u * 30, { fill: P.accent2, name: 'Corner' });
  const stars = []; for (let i = 0; i < 5; i++) stars.push(c.s('star', m + i * u * 6.5, m, u * 5.5, u * 5.5, { fill: P.accent, inner: .45, name: 'Star' }));
  const d = u * 13;
  const av = c.i(m, 0, d, d, { mask: 'circle', label: 'Avatar' });
  const a = c.t(C.author, m + d + u * 4, 0, W - 2 * m - d - u * 4, u * 3.6, { weight: 700 });
  const r = c.t(C.role || C.brand, m + d + u * 4, 0, W - 2 * m - d - u * 4, u * 3, { color: P.muted });
  const q = c.hd('“' + C.quote + '”', m, 0, W - 2 * m, u * 8, 6, H - 2 * m - u * 34, { upper: false, lh: 1.15 });
  q.y = r1(m + u * 13); av.y = r1(H - m - d); a.y = r1(av.y + d / 2 - a.h + u * .3); r.y = r1(av.y + d / 2 + u * .8);
});

def('menu-board', 'Menu', 'sp', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  const w = W - 2 * m;
  const k = c.kick(m, m + u * 2, w, { align: 'center' });
  const hd = c.hd(C.title, m, k.y + k.h + u * 2, w, u * 11, 2, H * .2, { align: 'center' });
  c.s('diamond', W / 2 - u * 1.5, hd.y + hd.h + u * 4, u * 3, u * 3, { fill: P.accent });
  const top = hd.y + hd.h + u * 12, bot = H - m - u * 10; const n = C.menu.length; const step = (bot - top) / n;
  C.menu.forEach(([name, price], i) => {
    const y = top + i * step + step / 2 - u * 2.4;
    const nm = c.t(name, m, y, w * .6, u * 4, { f: 'd', upper: false, weight: c.F.dw });
    const pr = c.t(price, W - m - w * .3, y, w * .3, u * 4, { f: 'd', align: 'right', upper: false, color: P.hi });
    c.l(m + Math.min(w * .6, name.length * u * 4 * c.F.wf * 1.05) + u * 2, y + u * 3.6, w * .25, { dash: true, sw: u * .25, stroke: P.line });
  });
  c.t(C.place + '  ·  ' + C.date[3], m, H - m - u * 3.5, w, u * 2.8, { align: 'center', color: P.muted, upper: true, ls: .12, weight: 600 });
});

def('countdown', 'Countdown', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const d = wide ? H * .78 : Math.min(W * .7, H * .5);
  const cx = wide ? W - m - d / 2 : W / 2, cy = wide ? H / 2 : m + d / 2 + u * 3;
  const g = nid();
  c.o(cx - d / 2, cy - d / 2, d, d, { fill: P.accent, name: 'Dial' }).groupId = g;
  c.o(cx - d / 2 - u * 2.5, cy - d / 2 - u * 2.5, d + u * 5, d + u * 5, { fill: null, stroke: P.accent, sw: u * .4, dash: true, name: 'Dial ring' }).groupId = g;
  const n = c.hd(C.count[0], cx - d * .4, 0, d * .8, d * .5, 1, d * .5, { color: P.onAccent, align: 'center', upper: false, lh: .95 });
  const l = c.t(C.count[1], cx - d * .35, 0, d * .7, d * .065, { color: P.onAccent, align: 'center', upper: true, ls: .14, weight: 700 });
  n.groupId = l.groupId = g; c.vstack([n, l], [d * .02], cy - d * .4, cy + d * .4);
  const x = m, w = wide ? cx - d / 2 - 2 * m - u * 3 : W - 2 * m, top = wide ? m : cy + d / 2 + u * 8;
  const k = c.kick(x, 0, w, { align: wide ? 'left' : 'center' });
  const dt = c.t(C.date[2], x, 0, w, u * 3.4, { weight: 600, color: P.muted, align: wide ? 'left' : 'center' });
  const hd = c.hd(C.title, x, 0, w, u * 13, 3, H - m - top - k.h - dt.h - u * 7, { align: wide ? 'left' : 'center' });
  c.vstack([k, hd, dt], [u * 2.5, u * 3.5], top, H - m);
});

def('concentric', 'Concentric', 'sp', A3, c => {
  const { W, H, u, P, C } = c;
  const R = Math.max(W, H) * 1.1, inner = Math.min(W, H) * .62;
  const cols = [P.accent2, P.bg, P.accent2, P.bg, P.accent];
  cols.forEach((col, i) => { const d = R - (R - inner) * (i / (cols.length - 1)); c.o(W / 2 - d / 2, H / 2 - d / 2, d, d, { fill: col, name: 'Ring ' + (i + 1) }); });
  const w = inner * .7, x = W / 2 - w / 2;
  const k = c.kick(x, 0, w, { align: 'center', color: P.onAccent });
  const hd = c.hd(C.title, x, 0, w, u * 10, 3, inner * .42, { align: 'center', color: P.onAccent });
  const dt = c.t(C.date[2], x, 0, w, u * 3, { align: 'center', color: P.onAccent, weight: 700 });
  c.vstack([k, hd, dt], [u * 2.5, u * 3], H / 2 - inner * .38, H / 2 + inner * .38);
});

def('ticket', 'Ticket', 'sp', ['wide', 'square'], c => {
  const { W, H, u, m, P, C, cls } = c;
  c.bg(P.accent);
  const cw = W - 2 * m, ch = cls === 'wide' ? H - 2 * m * 1.3 : H * .52; const cx = m, cy = (H - ch) / 2;
  c.r(cx, cy, cw, ch, { fill: P.bg, radius: u * 2.5, shadow: true, name: 'Ticket' });
  const stubW = cw * .3, px = cx + cw - stubW;
  c.l(px, cy + ch / 2, ch - u * 8, { dash: true, sw: u * .3, stroke: P.line, rot: 90 }).x = r1(px - (ch - u * 8) / 2);
  c.o(px - u * 3, cy - u * 3, u * 6, u * 6, { fill: P.accent, name: 'Notch' }); c.o(px - u * 3, cy + ch - u * 3, u * 6, u * 6, { fill: P.accent, name: 'Notch' });
  const x = cx + u * 6, w = cw - stubW - u * 12;
  const k = c.kick(x, 0, w); const dt = c.t(C.date[2] + '  ·  ' + C.date[3], x, 0, w, u * 3, { weight: 700 }); const pl = c.t(C.place, x, 0, w, u * 3, { color: P.muted });
  const hd = c.hd(C.title, x, 0, w, u * 11, 2, ch - u * 16 - k.h - dt.h - pl.h);
  c.vstack([k, hd, dt, pl], [u * 2, u * 3, u * 1], cy + u * 5, cy + ch - u * 5);
  const qs = Math.min(stubW * .56, ch * .5);
  c.q(px + stubW / 2 - qs / 2, cy + ch / 2 - qs / 2 - u * 3, qs, 'https://' + C.url);
  c.t('Admit one', px, cy + ch / 2 + qs / 2 - u * 1, stubW, u * 2.6, { align: 'center', upper: true, ls: .2, weight: 700 });
});

def('collage', 'Tilted Collage', 'sp', A3, c => {
  const { W, H, u, m, P, C, cls } = c; const wide = cls === 'wide';
  const s = wide ? H * .5 : Math.min(W * .42, H * .3);
  const ox = wide ? W * .52 : W / 2 - s * .95, oy = wide ? H * .14 : m + u * 2;
  [[0, 0, -7], [s * .7, s * .28, 5], [s * .22, s * .72, -2]].forEach(([dx, dy, rot], i) => c.i(ox + dx, oy + dy, s, s, { rot, border: P.surface, borderW: u * 1.2, shadow: true, label: 'Photo ' + (i + 1) }));
  if (wide) {
    const w = W * .44 - m;
    const k = c.kick(m, 0, w); const sb = c.t(C.sub, m, 0, w, u * 3.3, { color: P.muted });
    const hd = c.hd(C.title, m, 0, w, u * 13, 3, H - 2 * m - k.h - sb.h - u * 8);
    c.vstack([k, hd, sb], [u * 3, u * 4], m, H - m);
  } else {
    const top = oy + s * 1.72 + u * 6, w = W - 2 * m;
    const k = c.kick(m, 0, w); const sb = c.t(C.sub, m, 0, w, u * 3.3, { color: P.muted });
    const hd = c.hd(C.title, m, 0, w, u * 11, 3, H - m - top - k.h - sb.h - u * 6);
    c.vstack([k, hd, sb], [u * 2.5, u * 3], top, H - m);
  }
});

def('highlight', 'Highlighter', 'tsp', A3, c => {
  const { W, H, u, m, P, C, F } = c;
  const w = W - 2 * m;
  const lines = splitLines(C.title, c.cls === 'wide' ? 3 : 3);
  const wf = F.wf * (F.upper ? 1.26 : 1.05) + F.track;
  const size = Math.min(...lines.map(l => fitSize(l, w * .92, u * 14, 1, u * 16, wf, F.lh)));
  const k = c.kick(m, 0, w);
  const els = lines.map(l => c.t(l, m, 0, w, size, { f: 'd', bg: P.accent, color: P.onAccent, lh: 1.12 }));
  const s = c.t(C.sub, m, 0, Math.min(w, u * 75), u * 3.4, { color: P.muted });
  c.vstack([k, ...els, s], [u * 4, ...els.map((_, i) => i === els.length - 1 ? u * 5 : u * .6)], m, H - m - u * 6);
  c.t(C.handle, m, H - m - u * 3, w, u * 2.8, { weight: 700 });
});

def('swiss', 'Swiss Grid', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const cols = 4, cw = (W - 2 * m) / cols;
  for (let i = 1; i < cols; i++) c.r(m + i * cw, m, Math.max(1, u * .12), H - 2 * m, { fill: P.line, name: 'Grid line' });
  c.r(m, m, W - 2 * m, Math.max(1, u * .12), { fill: P.ink, name: 'Rule' });
  const st = c.hd(C.stat[0], m, m + u * 3, cw * 2.6, u * 34, 1, H * .32, { color: P.hi, upper: false, lh: .9 });
  c.t(C.stat[1], m + cw * 3, m + u * 3, cw - u * 2, u * 2.8, { weight: 700 });
  const my = st.y + st.h + u * 6;
  C.items.slice(0, 3).forEach((it, i) => { c.t(String(i + 1).padStart(2, '0'), m + (i + 1) * cw + u * 1.5, my, cw - u * 3, u * 2.6, { weight: 700, color: P.hi }); c.t(it, m + (i + 1) * cw + u * 1.5, my + u * 4, cw - u * 3, u * 2.8, {}); });
  const hd = c.hd(C.title, m, 0, W - 2 * m, u * 12, 3, H * .3, {});
  hd.y = r1(H - m - hd.h);
});

def('bauhaus', 'Bauhaus', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls, rng } = c;
  const wide = cls === 'wide';
  const rw = wide ? W * .5 : W, rh = wide ? H : H * (cls === 'tall' ? .48 : .55); const rx = wide ? W - rw : 0;
  const ncol = wide ? 3 : 4, s = rw / ncol, nrow = Math.max(1, Math.round(rh / s)), sy = rh / nrow;
  const pal = [P.accent, P.accent2, P.ink, P.surface];
  for (let r = 0; r < nrow; r++) for (let q = 0; q < ncol; q++) {
    const x = rx + q * s, y = r * sy; const a = Math.floor(rng() * 4); let b = Math.floor(rng() * 4); if (b === a) b = (a + 1) % 4;
    c.r(x, y, s + .5, sy + .5, { fill: pal[a], name: 'Tile' });
    const kind = Math.floor(rng() * 4);
    if (kind === 0) c.o(x + s * .1, y + sy * .1, s * .8, sy * .8, { fill: pal[b], name: 'Circle' });
    else if (kind === 1) c.s('quarter', x, y, s, sy, { fill: pal[b], rot: 90 * Math.floor(rng() * 4), name: 'Quarter' });
    else if (kind === 2) c.s('half', x, y + sy * .25, s, sy * .5, { fill: pal[b], rot: 180 * Math.floor(rng() * 2), name: 'Half' });
  }
  const x = m, w = wide ? W - rw - 2 * m : W - 2 * m, top = wide ? m : rh + u * 7;
  const k = c.kick(x, 0, w); const s2 = c.t(C.sub, x, 0, w, u * 3.3, { color: P.muted });
  const hd = c.hd(C.title, x, 0, w, u * 13, 3, H - m - top - k.h - s2.h - u * 7);
  c.vstack([k, hd, s2], [u * 2.5, u * 3.5], top, H - m);
});

def('episode', 'Episode', 'tsp', A3, c => {
  const { W, H, u, m, P, C, cls, rng } = c; const wide = cls === 'wide';
  const cs = wide ? H - 2 * m : Math.min(W * .56, H * .4);
  const cx = wide ? m : W / 2 - cs / 2;
  c.i(cx, m, cs, cs, { radius: u * 2, label: 'Cover art' });
  const x = wide ? cx + cs + u * 7 : m, w = wide ? W - x - m : W - 2 * m, top = wide ? m : m + cs + u * 6;
  const b = c.btn(C.ep, x, 0, u * 3, { fill: P.accent, upper: true, square: true });
  const gst = c.t('with ' + C.author, x, 0, w, u * 3.4, { weight: 600, color: P.muted });
  const n = 36, bw = w / n; const wv = { h: u * 10, set y(v) { this._y = v; } };
  const hd = c.hd(C.title, x, 0, w, u * 12, 3, H - m - top - b.h - gst.h - wv.h - u * 14);
  c.vstack([b, hd, gst, wv], [u * 3, u * 2, u * 5], top, H - m);
  for (let i = 0; i < n; i++) { const hh = u * (2 + 8 * Math.abs(Math.sin(i * .7 + rng() * 2)) * (0.5 + rng() * .5)); c.r(x + i * bw, wv._y + (u * 10 - hh) / 2, bw * .55, hh, { fill: i < n * .4 ? P.hi : P.line, radius: bw * .27, name: 'Wave' }); }
});

def('tags', 'Tags & CTA', 'sdp', A3, c => {
  const { W, H, u, m, P, C } = c;
  const d = Math.min(W, H) * .7; c.s('quarter', W - d, H - d, d, d, { fill: P.accent, rot: 180, name: 'Quarter' });
  c.o(W - d * .55, H - d * .55, d * .22, d * .22, { fill: P.accent2, name: 'Dot' });
  const w = W - 2 * m - d * .25;
  const k = c.kick(m, m, w);
  const hd = c.hd(C.title, m, m + k.h + u * 3, w, u * 13, 3, H * .36);
  const ph = c.pills(C.tags, m, hd.y + hd.h + u * 6, w, u * 2.8);
  const s = c.t(C.sub, m, hd.y + hd.h + u * 9 + ph, Math.min(w, u * 60), u * 3.2, { color: P.muted });
  c.btn(C.cta, m, s.y + s.h + u * 5, u * 3.2, { fill: P.ink, color: P.bg });
});

def('before-after', 'Before / After', 'ts', ['wide', 'square'], c => {
  const { W, H, u, m, P, C, cls } = c;
  const top = m, bot = H - m - u * 16; const gw = u * 10;
  const iw = (W - 2 * m - gw) / 2, ih = bot - top;
  c.i(m, top, iw, ih, { radius: u * 1.5, label: C.vs[0], tint: mix(P.ink, P.bg, .7) });
  c.i(m + iw + gw, top, iw, ih, { radius: u * 1.5, label: C.vs[1], tint: P.tint });
  c.s('arrow', W / 2 - gw * .38, top + ih / 2 - gw * .3, gw * .76, gw * .6, { fill: P.accent, name: 'Arrow' });
  c.btn(C.vs[0], m + u * 3, top + u * 3, u * 2.6, { fill: P.bg, color: P.ink, upper: true });
  c.btn(C.vs[1], m + iw + gw + u * 3, top + u * 3, u * 2.6, { fill: P.accent, upper: true });
  const hd = c.hd(C.short, m, 0, W - 2 * m, u * 10, 1, u * 11, { align: 'center' });
  hd.y = r1(H - m - hd.h);
});

def('recipe', 'Info Card', 'sp', ['square', 'tall'], c => {
  const { W, H, u, m, P, C } = c;
  const ih = H * .42; c.i(0, 0, W, ih, { label: 'Photo' });
  c.sticker(C.badge, W - m - u * 9, ih, u * 18, { fill: P.accent, rot: -10 });
  const k = c.kick(m, ih + u * 6, W - 2 * m - u * 20);
  const hd = c.hd(C.title, m, k.y + k.h + u * 2, W - 2 * m, u * 9, 2, H * .16);
  const top = hd.y + hd.h + u * 6; const cw = (W - 2 * m - u * 6) / 2;
  C.items.slice(0, 4).forEach((it, i) => { const y = top + i * u * 8.5; c.o(m, y + u * 1.2, u * 1.8, u * 1.8, { fill: P.accent, name: 'Bullet' }); c.t(it, m + u * 4, y, cw - u * 4, u * 3.1, {}); });
  const st = c.t(C.stat[0], m + cw + u * 6, top - u * 1, cw, u * 12, { f: 'd', upper: false, color: P.hi });
  c.t(C.stat[1], m + cw + u * 6, st.y + st.h + u, cw, u * 3, { weight: 600, color: P.muted });
  c.t(C.handle + '  ·  ' + C.url, m, H - m - u * 3, W - 2 * m, u * 2.8, { color: P.muted, weight: 600 });
});

/* banners */
def('banner-type', 'Banner Type', 'b', ['banner'], c => {
  const { W, H, u, m, P, C } = c; const mm = u * 12;
  const w = W * .58;
  const s = c.t(C.sub, mm, 0, w, u * 6, { color: P.muted });
  const hd = c.hd(C.title, mm, 0, w, u * 26, 2, H - 2 * mm - s.h - u * 6);
  c.vstack([hd, s], [u * 5], mm, H - mm);
  const d = H * .72, cx = W * .8;
  c.o(cx - d * .9, H / 2 - d / 2, d, d, { fill: P.accent, name: 'Circle' });
  c.o(cx - d * .35, H / 2 - d / 2, d, d, { fill: P.accent2, op: .9, name: 'Circle' });
  c.o(cx + d * .2, H / 2 - d / 2, d, d, { fill: null, stroke: P.ink, sw: u * 1, name: 'Ring' });
  c.t(C.handle, W - mm - W * .3, H - mm - u * 6, W * .3, u * 5.5, { align: 'right', weight: 700 });
});
def('banner-photo', 'Banner Photo', 'b', ['banner'], c => {
  const { W, H, u, P, C } = c; const mm = u * 12;
  c.i(W * .56, 0, W * .44, H, { label: 'Photo' });
  c.s('poly', W * .5, 0, W * .14, H, { pts: [[0, 0], [1, 0], [.45, 1], [0, 1]], fill: P.accent, name: 'Slant' });
  c.r(0, 0, W * .5 + 1, H, { fill: P.accent, name: 'Block' });
  const w = W * .48 - mm;
  const k = c.kick(mm, 0, w, { color: P.onAccent, size: u * 5.5 });
  const hd = c.hd(C.title, mm, 0, w, u * 24, 2, H - 2 * mm - k.h - u * 5, { color: P.onAccent });
  c.vstack([k, hd], [u * 4], mm, H - mm);
});
def('banner-center', 'Banner Center', 'b', ['banner'], c => {
  const { W, H, u, P, C } = c; const mm = u * 10;
  c.bg(P.accent);
  const cell = H / 4;
  for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { const s = cell * .42; [[mm * .5 + q * cell, 0], [W - mm * .5 - (q + 1) * cell, 1]].forEach(([x]) => c.s('diamond', x + (cell - s) / 2, r * cell + (cell - s) / 2, s, s, { fill: P.onAccent, op: .22, name: 'Pattern' })); }
  const w = W - 2 * (mm + cell * 3);
  const hd = c.hd(C.title, W / 2 - w / 2, 0, w, u * 22, 2, H * .5, { align: 'center', color: P.onAccent });
  const b = c.btn(C.cta, W / 2, 0, u * 5, { anchor: 'center', fill: P.onAccent, color: P.accent });
  c.vstack([hd, b], [u * 6], mm, H - mm);
});
def('banner-bauhaus', 'Banner Tiles', 'b', ['banner'], c => {
  const { W, H, u, P, C, rng } = c; const mm = u * 12;
  const s = H / 2, n = Math.floor((W * .45) / s); const x0 = W - n * s;
  const pal = [P.accent, P.accent2, P.ink, P.surface];
  for (let r = 0; r < 2; r++) for (let q = 0; q < n; q++) { const a = (r + q) % 4, b = (a + 2) % 4; const x = x0 + q * s, y = r * s; c.r(x, y, s + .5, s + .5, { fill: pal[a], name: 'Tile' }); if (rng() > .5) c.s('quarter', x, y, s, s, { fill: pal[b], rot: 90 * Math.floor(rng() * 4), name: 'Quarter' }); else c.o(x + s * .15, y + s * .15, s * .7, s * .7, { fill: pal[b], name: 'Circle' }); }
  const w = x0 - 2 * mm;
  const k = c.kick(mm, 0, w, { size: u * 5.5 });
  const hd = c.hd(C.title, mm, 0, w, u * 24, 2, H - 2 * mm - k.h - u * 5);
  c.vstack([k, hd], [u * 4], mm, H - mm);
});

/* business cards */
def('card-classic', 'Card Classic', 'c', ['wide'], c => {
  const { W, H, u, P, C } = c; const mm = u * 10;
  c.r(0, 0, u * 3, H, { fill: P.accent, name: 'Edge' });
  const g = nid();
  c.o(W - mm - u * 16, mm, u * 16, u * 16, { fill: P.accent, name: 'Mark' }).groupId = g;
  const ini = c.t(C.brand[0], W - mm - u * 16, mm + u * 3.2, u * 16, u * 9, { f: 'd', align: 'center', color: P.onAccent, upper: true, lh: 1 }); ini.groupId = g;
  const nm = c.hd(C.person, mm, mm, W * .6, u * 11, 1, u * 13);
  c.t(C.job, mm, nm.y + nm.h + u * 1.5, W * .6, u * 4.2, { color: P.hi, weight: 700, upper: true, ls: .12 });
  [C.phone, C.email, C.url].forEach((t, i) => c.t(t, mm, H - mm - (3 - i) * u * 7 + u * 2, W - 2 * mm, u * 4.4, { color: i ? P.muted : P.ink }));
});
def('card-split', 'Card Split', 'c', ['wide'], c => {
  const { W, H, u, P, C } = c; const mm = u * 9;
  c.r(0, 0, W * .4, H, { fill: P.accent, name: 'Block' });
  c.hd(C.brand, mm, H / 2 - u * 8, W * .4 - 2 * mm, u * 12, 2, u * 20, { color: P.onAccent, align: 'center' }).y = r1(H / 2 - u * 7);
  const x = W * .4 + mm, w = W * .6 - 2 * mm;
  const nm = c.hd(C.person, x, 0, w, u * 9, 1, u * 11);
  const jb = c.t(C.job, x, 0, w, u * 4, { color: P.muted });
  const ln = c.r(x, 0, u * 10, u * .6, { fill: P.accent });
  const ls = [C.phone, C.email, C.url].map(t => c.t(t, x, 0, w, u * 4, {}));
  c.vstack([nm, jb, ln, ...ls], [u * 1, u * 5, u * 5, u * 1.5, u * 1.5], mm, H - mm);
});
def('card-qr', 'Card QR', 'c', ['wide'], c => {
  const { W, H, u, P, C } = c; const mm = u * 10;
  c.bg(P.ink === '#111111' || P.bg !== '#FFFFFF' ? P.bg : P.bg);
  const qs = H - 2 * mm - u * 10;
  c.r(W - mm - qs - u * 4, mm, qs + u * 8, qs + u * 8 + u * 4, { fill: P.surface, radius: u * 2, name: 'QR panel' });
  c.q(W - mm - qs, mm + u * 4, qs, 'https://' + C.url, { fg: P.ink, bg: P.surface });
  const w = W - 3 * mm - qs - u * 8;
  const k = c.kick(mm, 0, w, { text: C.brand });
  const nm = c.hd(C.person, mm, 0, w, u * 10, 2, u * 22);
  const jb = c.t(C.job, mm, 0, w, u * 4, { color: P.muted });
  const em = c.t(C.email, mm, 0, w, u * 4, { weight: 600 });
  c.vstack([k, nm, jb, em], [u * 3, u * 1, u * 8], mm, H - mm);
});

export const LAYOUT = Object.fromEntries(LAYOUTS.map(l => [l.id, l]));
export const PAIRING = Object.fromEntries(PAIRINGS.map(p => [p.id, p]));
export const PALETTE = Object.fromEntries(PALETTES.map(p => [p.id, p]));

/* ---------- catalog ---------- */
const clsOf = ar => ar >= 2.2 ? 'banner' : ar > 1.25 ? 'wide' : ar >= .8 ? 'square' : 'tall';
let _cat = null;
export function catalog() {
  if (_cat) return _cat;
  const out = [];
  FORMATS.forEach((f, fi) => {
    const cls = clsOf(f.w / f.h);
    const Ls = LAYOUTS.filter(l => l.kinds.includes(f.kind) && l.cls.includes(f.kind === 'c' ? 'wide' : cls));
    const per = Math.max(2, Math.ceil(52 / Ls.length));
    Ls.forEach((l, li) => {
      for (let j = 0; j < per; j++) {
        const t = TOPICS[(li * 5 + fi * 3 + j * 7) % TOPICS.length];
        const pair = t.pairs[(li + j * 2 + fi) % t.pairs.length];
        const pal = t.pals[(li * 2 + j + fi) % t.pals.length];
        out.push({ id: `${f.id}~${l.id}~${t.id}~${j}`, fmt: f.id, layout: l.id, topic: t.id, pair, pal, name: t.title, layoutName: l.name, topicName: t.name, cat: f.cat, fmtName: f.name, w: f.w, h: f.h, pages: f.pages || 1, search: `${t.title} ${t.name} ${l.name} ${f.name} ${f.cat} ${PALETTE[pal].name} ${PAIRING[pair].name}`.toLowerCase() });
      }
    });
  });
  _cat = out; return out;
}

function runLayout(l, W, H, theme, pair, topic, seed, kind) {
  const c = makeCtx(W, H, theme, pair, topic, seeded(seed), kind);
  l.fn(c);
  return { id: nid(), bg: c.bgc, els: c.els };
}
function backOfCard(W, H, theme, pair, topic) {
  const c = makeCtx(W, H, theme, pair, topic, seeded(1), 'c'); const u = c.u;
  c.bg(theme.accent);
  const hd = c.hd(topic.brand, W * .15, 0, W * .7, u * 16, 1, u * 20, { align: 'center', color: theme.onAccent });
  const s = c.t(topic.url, W * .15, 0, W * .7, u * 4, { align: 'center', color: theme.onAccent, upper: true, ls: .2, weight: 700 });
  c.vstack([hd, s], [u * 4], 0, H);
  return { id: nid(), bg: c.bgc, els: c.els };
}
export function build(desc) {
  const f = FORMAT[desc.fmt], l = LAYOUT[desc.layout], t = TOPIC[desc.topic];
  const theme = makeTheme(PALETTE[desc.pal]), pair = PAIRING[desc.pair];
  const seed = hash(desc.id);
  const pages = [runLayout(l, f.w, f.h, theme, pair, t, seed, f.kind)];
  if (f.kind === 'c') pages.push(backOfCard(f.w, f.h, theme, pair, t));
  else if ((f.pages || 1) > 1) {
    const pool = ['numbered-list', 'stat-chart', 'quote', 'checklist', 'timeline', 'testimonial'].filter(x => x !== l.id);
    for (let i = 1; i < f.pages; i++) pages.push(runLayout(LAYOUT[pool[(seed + i * 2) % pool.length]], f.w, f.h, theme, pair, t, seed + i, f.kind));
  }
  return { name: t.title, w: f.w, h: f.h, fmt: f.id, tpl: desc.id, theme: { ...theme, display: pair.display, body: pair.body, pairId: pair.id }, pages };
}
