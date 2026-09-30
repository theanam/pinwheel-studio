// Pinwheel Studio — occasion motifs. CC0, like the rest of the presets.
//
// Each motif is a small drawing in a 100×100 box made of parts. A part is either a
// `path` (SVG path data in box units, fill only) or one of the renderer's primitive
// shapes. Parts carry a colour role — accent, accent2, ink, bg, or a literal — so a
// motif recolours with the palette like everything else. Templates place motifs as
// grouped, editable shape elements; nothing here is an image.

/* ---------- programmatic shapes ---------- */
const P = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const rot = (x, y, deg) => { const a = deg * Math.PI / 180, dx = x - 50, dy = y - 50; return [50 + dx * Math.cos(a) - dy * Math.sin(a), 50 + dx * Math.sin(a) + dy * Math.cos(a)]; };
const polyRot = (pts, deg) => 'M' + pts.map(([x, y]) => P(...rot(x, y, deg))).join(' L') + ' Z';

/** Six-armed snowflake: each arm is a bar with two chevron branches. */
function snowflake() {
  const arm = [[47, 50], [47, 6], [53, 6], [53, 50]];
  const branch = [[47, 26], [36, 15], [39, 12], [53, 26], [64, 12], [67, 15], [53, 26], [53, 30], [47, 30]];
  const branch2 = [[47, 40], [39, 32], [42, 29], [53, 40], [61, 29], [64, 32], [53, 40], [53, 44], [47, 44]];
  let d = '';
  for (let i = 0; i < 6; i++) d += polyRot(arm, i * 60) + polyRot(branch, i * 60) + polyRot(branch2, i * 60);
  d += 'M50 42 L58 50 L50 58 L42 50 Z';
  return d;
}
/** Marigold: two rings of petals around a centre. */
function marigold() {
  let d = '';
  const petal = (r0, r1, w) => [[50 - w, 50 - r0], [50 - w * .6, 50 - r1], [50, 50 - r1 - 2], [50 + w * .6, 50 - r1], [50 + w, 50 - r0]];
  for (let i = 0; i < 12; i++) d += polyRot(petal(22, 46, 9), i * 30);
  for (let i = 0; i < 12; i++) d += polyRot(petal(10, 30, 7), i * 30 + 15);
  return d;
}
/** Firework burst: rays with a dot at each tip. */
function fireworks() {
  let d = '';
  for (let i = 0; i < 12; i++) {
    d += polyRot([[49, 50], [49, 14], [51, 14], [51, 50]], i * 30);
    const [cx, cy] = rot(50, 8, i * 30);
    d += `M${P(cx - 4, cy)} a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z`;
  }
  return d;
}
/** Eight-point star, the tile of Islamic geometric pattern. */
function star8() {
  const out = [];
  for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * Math.PI / 8, r = i % 2 ? 34 : 48; out.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]); }
  return 'M' + out.map(p => P(...p)).join(' L') + ' Z';
}
/** Rangoli: a ring of petals around a dotted centre. */
function rangoli() {
  let d = '';
  const petal = [[50, 50], [40, 30], [50, 6], [60, 30]];
  for (let i = 0; i < 8; i++) d += polyRot(petal, i * 45);
  d += 'M50 34 a16 16 0 1 0 0.1 0 Z';
  return d;
}

/* ---------- paths (100×100 box, y down) ---------- */
const D = {
  heart: 'M50 88 C20 66 6 50 6 32 C6 18 16 8 30 8 C40 8 47 14 50 22 C53 14 60 8 70 8 C84 8 94 18 94 32 C94 50 80 66 50 88 Z',
  sparkle: 'M50 0 C54 30 70 46 100 50 C70 54 54 70 50 100 C46 70 30 54 0 50 C30 46 46 30 50 0 Z',
  crescent: 'M62 6 C34 10 16 32 16 52 C16 76 36 94 62 94 C70 94 76 92 82 90 C60 86 44 70 44 50 C44 30 60 14 82 10 C76 8 70 6 62 6 Z',
  tree: 'M50 4 L72 34 L62 34 L82 60 L68 60 L92 86 L56 86 L56 96 L44 96 L44 86 L8 86 L32 60 L18 60 L38 34 L28 34 Z',
  hollyLeaf: 'M50 50 C44 46 40 40 40 34 C36 38 30 38 26 34 C30 30 30 24 26 20 C32 22 38 20 40 14 C42 20 48 22 54 20 C50 24 50 30 54 34 C50 38 44 38 40 34 C40 40 44 46 50 50 Z',
  bat: 'M50 34 C46 26 42 24 38 26 L36 22 L32 30 C24 26 14 30 6 40 C14 40 20 46 22 54 C30 50 38 52 44 60 L50 70 L56 60 C62 52 70 50 78 54 C80 46 86 40 94 40 C86 30 76 26 68 30 L64 22 L62 26 C58 24 54 26 50 34 Z',
  ghost: 'M50 6 C28 6 16 22 16 44 L16 92 L26 84 L36 92 L46 84 L56 92 L66 84 L76 92 L84 84 L84 44 C84 22 72 6 50 6 Z',
  pumpkin: 'M50 24 C40 16 26 20 18 32 C8 46 10 66 20 80 C28 92 40 94 50 88 C60 94 72 92 80 80 C90 66 92 46 82 32 C74 20 60 16 50 24 Z',
  stem: 'M46 22 L46 8 C46 4 54 4 54 8 L54 22 Z',
  egg: 'M50 4 C30 4 16 34 16 58 C16 80 32 96 50 96 C68 96 84 80 84 58 C84 34 70 4 50 4 Z',
  bunny: 'M36 44 C30 22 24 8 30 4 C38 2 44 24 46 42 Z M64 44 C70 22 76 8 70 4 C62 2 56 24 54 42 Z M50 96 C28 96 16 80 16 64 C16 48 30 38 50 38 C70 38 84 48 84 64 C84 80 72 96 50 96 Z',
  leaf: 'M50 4 L58 24 L74 12 L70 34 L94 32 L78 50 L96 62 L72 66 L82 90 L60 74 L50 96 L40 74 L18 90 L28 66 L4 62 L22 50 L6 32 L30 34 L26 12 L42 24 Z',
  diyaBowl: 'M8 60 C8 80 26 92 50 92 C74 92 92 80 92 60 Z M18 56 L82 56 L82 62 L18 62 Z',
  flame: 'M50 12 C42 26 38 36 38 44 C38 52 44 58 50 58 C56 58 62 52 62 44 C62 36 58 26 50 12 Z',
  lantern: 'M40 4 L60 4 L60 12 L40 12 Z M30 16 L70 16 L76 28 L24 28 Z M28 30 L72 30 L66 76 L34 76 Z M30 78 L70 78 L64 90 L36 90 Z M46 92 L54 92 L54 98 L46 98 Z',
  lotus: 'M50 20 C42 32 38 44 38 56 C38 68 44 76 50 82 C56 76 62 68 62 56 C62 44 58 32 50 20 Z M28 34 C22 46 22 60 30 74 C36 80 44 84 50 84 C40 76 34 62 34 48 C34 42 32 38 28 34 Z M72 34 C78 46 78 60 70 74 C64 80 56 84 50 84 C60 76 66 62 66 48 C66 42 68 38 72 34 Z M8 56 C10 72 24 86 50 88 C36 82 28 72 24 62 C18 58 12 56 8 56 Z M92 56 C90 72 76 86 50 88 C64 82 72 72 76 62 C82 58 88 56 92 56 Z',
  balloon: 'M50 4 C30 4 18 20 18 40 C18 60 36 74 46 80 L44 86 L56 86 L54 80 C64 74 82 60 82 40 C82 20 70 4 50 4 Z',
  string: 'M50 86 C46 90 54 94 50 98 L51 98 C55 94 47 90 51 86 Z',
  cakeBase: 'M12 56 L88 56 L88 92 L12 92 Z',
  cakeTop: 'M22 32 L78 32 L78 56 L22 56 Z',
  candle: 'M46 12 L54 12 L54 32 L46 32 Z',
  gift: 'M10 40 L90 40 L90 92 L10 92 Z M6 24 L94 24 L94 40 L6 40 Z',
  ribbon: 'M46 24 L54 24 L54 92 L46 92 Z M30 10 C36 6 46 10 50 22 C54 10 64 6 70 10 C72 16 64 22 50 24 C36 22 28 16 30 10 Z',
  bell: 'M50 6 C46 6 44 10 44 14 C30 20 24 36 24 56 L24 70 L14 82 L86 82 L76 70 L76 56 C76 36 70 20 56 14 C56 10 54 6 50 6 Z M40 84 C40 92 60 92 60 84 Z',
  pillar: 'M40 30 L60 30 L60 96 L40 96 Z',
  dove: 'M12 52 C22 50 30 44 34 36 C30 30 26 26 24 20 C32 22 40 28 44 34 C54 30 68 32 78 40 L94 36 L84 48 C80 62 68 72 52 74 L40 96 L42 72 C30 70 18 62 12 52 Z',
  ring: 'M50 8 C26 8 8 26 8 50 C8 74 26 92 50 92 C74 92 92 74 92 50 C92 26 74 8 50 8 Z M50 22 C66 22 78 34 78 50 C78 66 66 78 50 78 C34 78 22 66 22 50 C22 34 34 22 50 22 Z',
  gem: 'M50 2 L62 10 L50 22 L38 10 Z',
  capTop: 'M50 8 L96 32 L50 56 L4 32 Z',
  capBase: 'M24 44 L24 66 C24 76 36 82 50 82 C64 82 76 76 76 66 L76 44 L50 58 Z',
  tassel: 'M94 32 L96 32 L96 60 C96 66 92 68 90 68 L90 64 C92 64 94 62 94 60 Z',
  rattle: 'M50 4 C34 4 22 16 22 32 C22 46 32 56 44 60 L44 96 L56 96 L56 60 C68 56 78 46 78 32 C78 16 66 4 50 4 Z',
  onesie: 'M30 8 L44 8 C46 14 54 14 56 8 L70 8 L92 26 L82 40 L74 34 L74 92 L58 92 L58 76 L42 76 L42 92 L26 92 L26 34 L18 40 L8 26 Z',
  flower: 'M50 42 C36 42 26 32 26 14 C34 22 42 24 50 18 C58 24 66 22 74 14 C74 32 64 42 50 42 Z',
  stalk: 'M48 40 L52 40 L52 96 L48 96 Z',
  glass: 'M30 4 L70 4 L66 36 C64 50 58 56 54 58 L54 82 L68 90 L32 90 L46 82 L46 58 C42 56 36 50 34 36 Z',
  hands: 'M48 50 L48 22 L52 22 L52 50 Z M48 48 L70 60 L68 64 L46 52 Z',
  snowflake: snowflake(),
  marigold: marigold(),
  fireworks: fireworks(),
  star8: star8(),
  rangoli: rangoli(),
};

/* ---------- motifs: parts in a 100×100 box ---------- */
// part: { d | shape, x, y, w, h, fill }  (x/y/w/h default to the full box)
const part = (d, fill, box) => ({ d, fill, ...(box ? { x: box[0], y: box[1], w: box[2], h: box[3] } : {}) });
const prim = (shape, fill, box, extra = {}) => ({ shape, fill, x: box[0], y: box[1], w: box[2], h: box[3], ...extra });

export const MOTIFS = {
  heart: { parts: [part(D.heart, 'accent')] },
  sparkle: { parts: [part(D.sparkle, 'accent2')] },
  crescent: { parts: [part(D.crescent, 'accent')] },
  star8: { parts: [part(D.star8, 'accent'), part(D.star8, 'bg', [30, 30, 40, 40])] },
  lantern: { parts: [part(D.lantern, 'accent'), prim('ellipse', 'accent2', [40, 42, 20, 26])] },
  tree: { parts: [part(D.tree, 'accent2'), part(D.sparkle, 'accent', [40, 0, 20, 20])] },
  snowflake: { parts: [part(D.snowflake, 'accent')] },
  holly: { parts: [part(D.hollyLeaf, 'accent2', [0, 10, 70, 70]), part(D.hollyLeaf, 'accent2', [30, 10, 70, 70]), prim('ellipse', 'accent', [38, 54, 14, 14]), prim('ellipse', 'accent', [50, 60, 14, 14]), prim('ellipse', 'accent', [44, 68, 14, 14])] },
  bell: { parts: [part(D.bell, 'accent2'), prim('ellipse', 'accent', [44, 82, 12, 12])] },
  gift: { parts: [part(D.gift, 'accent'), part(D.ribbon, 'accent2')] },
  reindeer: { parts: [
    prim('rounded', 'accent2', [22, 44, 50, 30]),            // body
    prim('rect', 'accent2', [26, 70, 8, 26]), prim('rect', 'accent2', [38, 70, 8, 26]), prim('rect', 'accent2', [56, 70, 8, 26]), prim('rect', 'accent2', [66, 70, 8, 26]),
    prim('rect', 'accent2', [64, 30, 12, 20], { rot: 20 }), // neck
    prim('rounded', 'accent2', [66, 18, 24, 18]),           // head
    prim('rect', 'accent2', [72, 4, 3, 16], { rot: -25 }), prim('rect', 'accent2', [80, 4, 3, 16], { rot: 25 }), prim('rect', 'accent2', [68, 8, 3, 8], { rot: -70 }), prim('rect', 'accent2', [84, 8, 3, 8], { rot: 70 }),
    prim('ellipse', 'accent', [86, 24, 8, 8]),               // nose
    prim('ellipse', 'ink', [76, 22, 3, 3]),                  // eye
    prim('ellipse', 'accent2', [18, 40, 10, 10]),            // tail
  ] },
  bat: { parts: [part(D.bat, 'ink')] },
  ghost: { parts: [part(D.ghost, 'bg'), prim('ellipse', 'ink', [38, 34, 8, 12]), prim('ellipse', 'ink', [54, 34, 8, 12])] },
  pumpkin: { parts: [part(D.pumpkin, 'accent'), part(D.stem, 'accent2'), part(D.pumpkin, 'ink', [40, 22, 20, 74], { op: .12 })] },
  egg: { parts: [part(D.egg, 'accent'), prim('rounded', 'accent2', [22, 40, 56, 8]), prim('rounded', 'bg', [20, 56, 60, 6])] },
  bunny: { parts: [part(D.bunny, 'accent2'), prim('ellipse', 'ink', [40, 60, 5, 6]), prim('ellipse', 'ink', [55, 60, 5, 6]), prim('ellipse', 'accent', [46, 70, 8, 5])] },
  leaf: { parts: [part(D.leaf, 'accent')] },
  diya: { parts: [part(D.diyaBowl, 'accent'), part(D.flame, 'accent2')] },
  lotus: { parts: [part(D.lotus, 'accent')] },
  marigold: { parts: [part(D.marigold, 'accent2'), prim('ellipse', 'accent', [40, 40, 20, 20])] },
  rangoli: { parts: [part(D.rangoli, 'accent2'), prim('ellipse', 'accent', [42, 42, 16, 16])] },
  fireworks: { parts: [part(D.fireworks, 'accent2')] },
  balloon: { parts: [part(D.balloon, 'accent'), part(D.string, 'ink'), prim('ellipse', 'bg', [30, 16, 10, 16], { op: .35, rot: 20 })] },
  cake: { parts: [part(D.cakeBase, 'accent'), part(D.cakeTop, 'accent2'), part(D.candle, 'bg'), part(D.flame, 'accent', [42, -8, 16, 26]), prim('rounded', 'bg', [12, 56, 76, 6])] },
  candle: { parts: [part(D.pillar, 'accent2'), part(D.flame, 'accent', [36, 4, 28, 30])] },
  dove: { parts: [part(D.dove, 'accent2'), prim('ellipse', 'ink', [30, 26, 3, 3])] },
  ring: { parts: [part(D.ring, 'accent2', [0, 12, 100, 88]), part(D.gem, 'accent', [30, 0, 40, 32])] },
  cap: { parts: [part(D.capTop, 'ink'), part(D.capBase, 'ink'), part(D.tassel, 'accent')] },
  rattle: { parts: [part(D.rattle, 'accent'), prim('ellipse', 'bg', [40, 20, 20, 20], { op: .4 })] },
  onesie: { parts: [part(D.onesie, 'accent'), prim('ellipse', 'accent2', [40, 40, 20, 20])] },
  flower: { parts: [part(D.stalk, 'accent2'), part(D.flower, 'accent')] },
  glass: { parts: [part(D.glass, 'accent2'), prim('ellipse', 'accent', [40, 10, 6, 6]), prim('ellipse', 'accent', [52, 18, 5, 5]), prim('ellipse', 'accent', [46, 26, 4, 4])] },
  clock: { parts: [part(D.ring, 'accent2'), part(D.hands, 'accent2')] },
};

/**
 * Background scatter for an occasion: what to sprinkle in the free bands of a page.
 * `motif` may be a motif id or a primitive shape; sizes are in layout units.
 */
export const SCATTER = {
  snow: { motif: 'ellipse', fill: 'bg', size: [1, 2.4], n: 18, op: .9 },
  stars: { motif: 'sparkle', fill: 'accent2', size: [1.5, 3.5], n: 12 },
  sparkle: { motif: 'sparkle', fill: 'accent', size: [1.5, 3.5], n: 12 },
  confetti: { motif: 'confetti', size: [1.2, 2.6], n: 20 },
  hearts: { motif: 'heart', fill: 'accent', size: [2, 4], n: 10 },
  leaves: { motif: 'leaf', fill: 'accent', size: [3, 5], n: 8 },
  bats: { motif: 'bat', fill: 'ink', size: [3, 6], n: 7 },
  dots: { motif: 'ellipse', fill: 'accent2', size: [1.5, 3], n: 14 },
  flakes: { motif: 'snowflake', fill: 'bg', size: [3, 6], n: 8, op: .8 },
  garland: { motif: 'marigold', fill: 'accent2', size: [3, 5], n: 10 },
};
