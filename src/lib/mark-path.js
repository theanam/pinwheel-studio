// The brand mark (spec §10): a pinwheel of four sails in mint and ink.
//
// One sail is drawn in the top-right quadrant of a 100-unit box — two straight outer
// edges and a curved inner edge that bows toward the pin — then rotated 90° three
// times. The rotation (rather than mirroring) is what gives it chirality, so it
// reads as spinning. This file is the only place the geometry lives: the React
// component, the icons script and the spec page all derive from it.

export const ACCENT = '#1F7D62';
export const INK = '#24211D';
export const CREAM = '#F4F2EE';

/** Sail geometry, in 100-unit box coordinates. */
export const SAIL = {
  gap: 4.5,   // half the channel between a sail's straight edge and the centre axis
  edge: 7,    // inset of the outer edges from the box
  bulge: 40,  // radius of the inner arc — smaller is a deeper curve
};

const V = [50 + SAIL.gap, 50 - SAIL.gap]; // vertex nearest the pin
const T = [50 + SAIL.gap, SAIL.edge];      // top of the straight inner edge
const K = [100 - SAIL.edge, SAIL.edge];    // sharp outer corner

/** SVG path for the base (top-right) sail. */
export const SAIL_PATH = `M${V[0]} ${V[1]} L${T[0]} ${T[1]} L${K[0]} ${K[1]} A${SAIL.bulge} ${SAIL.bulge} 0 0 1 ${V[0]} ${V[1]} Z`;

export const SAIL_COLORS = [ACCENT, INK, ACCENT, INK];
export const PIN = { r: 7, hole: 2.9 };

/** Inner SVG markup (no <svg> wrapper) for the mark in a 0 0 100 100 viewBox. */
export function markInner({ pin = INK, hole = CREAM } = {}) {
  const sails = SAIL_COLORS.map((c, i) =>
    `<path d="${SAIL_PATH}" fill="${c}"${i ? ` transform="rotate(${i * 90} 50 50)"` : ''}/>`).join('');
  return `${sails}<circle cx="50" cy="50" r="${PIN.r}" fill="${pin}"/><circle cx="50" cy="50" r="${PIN.hole}" fill="${hole}"/>`;
}

/** A complete inline <svg> string, sized in CSS px. */
export function markSVG(size = 24, opts) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" style="display:block;flex:none">${markInner(opts)}</svg>`;
}
