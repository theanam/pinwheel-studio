// One-shot migration: compile the dc-runtime template in the design-tool prototype
// (`_source/Pinwheel Studio.dc.html`) into plain JSX. Run once; the output is the
// checked-in source. Kept in the repo so the port can be re-derived if the design
// prototype changes.
import fs from 'fs';
import { parse } from 'node-html-parser';

import { tokenize } from './ui-tokens.js';

const SRC = '_source/Pinwheel Studio.dc.html';
const raw = fs.readFileSync(SRC, 'utf8');

const open = raw.match(/<x-dc(?:\s[^>]*)?>/);
const close = raw.lastIndexOf('</x-dc>');
const templateSrc = raw.slice(open.index + open[0].length, close);

const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const ATTR_MAP = { class: 'className', for: 'htmlFor', crossorigin: 'crossOrigin', srcset: 'srcSet',
  autocomplete: 'autoComplete', maxlength: 'maxLength', minlength: 'minLength', readonly: 'readOnly',
  tabindex: 'tabIndex', colspan: 'colSpan', rowspan: 'rowSpan', contenteditable: 'contentEditable',
  spellcheck: 'spellCheck', novalidate: 'noValidate', enctype: 'encType', accesskey: 'accessKey' };

const kebabToCamel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const cssToObj = css => {
  const o = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    o[prop.startsWith('--') ? prop : kebabToCamel(prop)] = decl.slice(i + 1).trim();
  }
  return o;
};
const objLiteral = o => '{ ' + Object.entries(o)
  .map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${JSON.stringify(v)}`)
  .join(', ') + ' }';

// Hover styles were authoring hints in the prototype runtime; here they become real CSS rules.
const hoverRules = new Map();
const hoverClass = css => {
  if (!hoverRules.has(css)) hoverRules.set(css, 'pw-h' + (hoverRules.size + 1));
  return hoverRules.get(css);
};

const WHOLE = /^\s*\{\{([\s\S]+?)\}\}\s*$/;
const HOLE = /\{\{([\s\S]+?)\}\}/;

// The prototype runtime resolved a binding's root identifier against a flat vals
// object, with sc-for variables shadowing it. Here vals is the `v` parameter, so a
// root that is not a loop variable or a literal gets a `v.` prefix.
const LITERALS = new Set(['true', 'false', 'null', 'undefined']);
const scope = [];
function expr(src) {
  const e = src.trim();
  if (LITERALS.has(e) || /^-?\d/.test(e) || /^['"]/.test(e)) return e;
  const bang = e.startsWith('!') ? '!' : '';
  const path = bang ? e.slice(1).trim() : e;
  const root = path.split('.')[0];
  if (!/^[A-Za-z_$][\w$]*$/.test(root)) throw new Error('unsupported binding: ' + src);
  if (scope.includes(root) || root === '$index') return bang + path;
  return bang + 'v.' + path;
}

/** An attribute value -> a JSX attribute value (already including braces/quotes). */
function attrValue(rawVal) {
  const whole = rawVal.match(WHOLE);
  if (whole) return { dynamic: true, code: expr(whole[1]) };
  if (HOLE.test(rawVal)) {
    const parts = rawVal.split(/\{\{([\s\S]+?)\}\}/g);
    const lit = parts.map((s, i) => (i & 1) ? '${' + expr(s) + ' ?? ""}' : s.replace(/[\\`$]/g, m => '\\' + m)).join('');
    return { dynamic: true, code: '`' + lit + '`' };
  }
  return { dynamic: false, code: rawVal };
}

function emitAttrs(node) {
  const out = [];
  let hoverCss = null;
  for (const [name, value] of Object.entries(node.attributes)) {
    if (name === 'sc-name' || name === 'data-dc-tpl') continue;
    if (name.startsWith('hint-')) continue;
    if (name === 'style-hover') { hoverCss = value; continue; }
    if (name.startsWith('style-')) continue; // other pseudo-state hints: none in this template

    const v = attrValue(value);
    let key = ATTR_MAP[name] || name;
    if (name.startsWith('on')) key = 'on' + name[2].toUpperCase() + name.slice(3);

    if (key === 'style') {
      out.push(v.dynamic ? `style={sty(${v.code})}` : `style={${objLiteral(cssToObj(tokenize(v.code)))}}`);
      continue;
    }
    if (!v.dynamic) {
      // The prototype lived next to the spec document; in the app the spec is a static page.
      const lit = key === 'href' && value === 'Pinwheel Spec.dc.html' ? 'spec.html' : value;
      out.push(`${key}=${JSON.stringify(lit)}`);
      continue;
    }
    // Controlled inputs: the runtime coerced undefined so React never flips to uncontrolled.
    if (key === 'value') out.push(`value={${v.code} ?? ''}`);
    else if (key === 'checked') out.push(`checked={${v.code} ?? false}`);
    else out.push(`${key}={${v.code}}`);
  }
  if (hoverCss) {
    const cls = hoverClass(hoverCss);
    const i = out.findIndex(a => a.startsWith('className='));
    if (i >= 0) throw new Error('className + style-hover on one node: ' + node.rawTagName);
    out.push(`className=${JSON.stringify(cls)}`);
  }
  return out;
}

const indent = n => '  '.repeat(n);

/** Emit children as a JSX child list. Returns an array of strings, one per line-ish chunk. */
function emitChildren(node, d) {
  const out = [];
  for (const child of node.childNodes) {
    const s = emitNode(child, d);
    if (s != null) out.push(s);
  }
  return out;
}

function emitText(node, d) {
  const txt = node.rawText;
  if (!txt.includes('{{')) {
    const t = txt.replace(/\s+/g, ' ');
    if (!t.trim()) return null;
    // Decode the few entities the prototype uses, then re-escape for JSX text.
    const decoded = t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/&times;/g, '×').replace(/&rarr;/g, '→').replace(/&hellip;/g, '…');
    return indent(d) + (/[{}<>]/.test(decoded) ? '{' + JSON.stringify(decoded) + '}' : decoded);
  }
  const parts = txt.split(/\{\{([\s\S]+?)\}\}/g);
  return parts.map((p, i) => {
    if (i & 1) return indent(d) + '{' + expr(p) + '}';
    const t = p.replace(/\s+/g, ' ');
    if (!t.trim()) return null;
    return indent(d) + (/[{}<>]/.test(t) ? '{' + JSON.stringify(t) + '}' : t);
  }).filter(Boolean).join('\n');
}

function emitNode(node, d) {
  if (node.nodeType === 3) return emitText(node, d);
  if (node.nodeType !== 1) return null;
  const tag = node.rawTagName.toLowerCase();

  if (tag === 'helmet' || tag === 'sc-helmet') return null; // hoisted into index.html
  // The brand mark is a component; the design source names it rather than drawing it.
  if (tag === 'pw-mark') return `${indent(d)}<Mark size={${parseInt(node.getAttribute('size') || '24', 10)}} />`;

  if (tag === 'sc-if') {
    const cond = attrValue(node.getAttribute('value') || '').code;
    const kids = emitChildren(node, d + 2);
    return `${indent(d)}{${cond} ? (\n${indent(d + 1)}<>\n${kids.join('\n')}\n${indent(d + 1)}</>\n${indent(d)}) : null}`;
  }
  if (tag === 'sc-for') {
    const list = attrValue(node.getAttribute('list') || '').code;
    const as = node.getAttribute('as') || 'item';
    scope.push(as);
    const kids = emitChildren(node, d + 2);
    scope.pop();
    return `${indent(d)}{toArray(${list}).map((${as}, $index) => (\n${indent(d + 1)}<Fragment key={$index}>\n${kids.join('\n')}\n${indent(d + 1)}</Fragment>\n${indent(d)}))}`;
  }

  const attrs = emitAttrs(node);
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
  if (VOID.has(tag)) return `${indent(d)}<${tag}${attrStr} />`;
  const kids = emitChildren(node, d + 1);
  if (!kids.length) return `${indent(d)}<${tag}${attrStr} />`;
  return `${indent(d)}<${tag}${attrStr}>\n${kids.join('\n')}\n${indent(d)}</${tag}>`;
}

const root = parse(templateSrc, { lowerCaseTagName: false, comment: false, blockTextElements: { script: true, style: true } });
const body = emitChildren(root, 2);

const jsx = `// GENERATED by scripts/dc-to-jsx.mjs from the design prototype — see docs/PORTING.md.
// Presentation only: every value comes from Studio#renderVals().
import { Fragment } from 'react';
import Mark from './lib/Mark.jsx';
import { sty, toArray } from './lib/style.js';

export default function StudioView(v) {
  return (
    <>
${body.join('\n')}
    </>
  );
}
`;

fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/StudioView.jsx', jsx);

const css = [...hoverRules.entries()]
  .map(([decls, cls]) => `.${cls}:hover { ${tokenize(decls).replace(/;?$/, ';')} }`)
  .join('\n');
fs.writeFileSync('src/lib/hover.css', `/* GENERATED by scripts/dc-to-jsx.mjs from style-hover attributes. */\n${css}\n`);

await import('./build-tokens.mjs');
console.log('src/StudioView.jsx', fs.statSync('src/StudioView.jsx').size, 'bytes');
console.log('hover rules:', hoverRules.size);
