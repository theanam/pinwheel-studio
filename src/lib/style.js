// Small helpers the generated view needs.

const cache = new Map();

/**
 * Accept either a React style object or a CSS declaration string.
 * `renderVals()` returns both shapes, so normalize here rather than at every call site.
 * @param {string | Record<string, string | number> | null | undefined} s
 * @returns {Record<string, string | number> | undefined}
 */
export function sty(s) {
  if (s == null) return undefined;
  if (typeof s !== 'string') return s;
  let o = cache.get(s);
  if (o) return o;
  o = {};
  for (const decl of s.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    o[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decl.slice(i + 1).trim();
  }
  cache.set(s, o);
  return o;
}

/** Guard list bindings so a not-yet-built value renders nothing instead of throwing. */
export const toArray = x => (Array.isArray(x) ? x : []);
