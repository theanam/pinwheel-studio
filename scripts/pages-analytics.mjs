// Deploy-time only: stamps a Google Analytics tag into the *built* index.html.
//
// The source tree ships no analytics. The Pages workflow runs this against dist/
// after `npm run build`, so pinwheelstudio.org reports visits while a clone, a
// self-hosted copy or a local build stay silent. Because index.html carries a strict
// Content-Security-Policy, the step also widens that policy just enough for the tag:
// the loader host in script-src, a hash for the inline bootstrap, and the
// collection endpoints in connect-src and img-src.
//
//   node scripts/pages-analytics.mjs dist/index.html G-XXXXXXXXXX
import crypto from 'node:crypto';
import fs from 'node:fs';

const [file, id] = process.argv.slice(2);
if (!file || !/^G-[A-Z0-9]+$/.test(id || '')) {
  console.error('usage: node scripts/pages-analytics.mjs <dist/index.html> <G-MEASUREMENT-ID>');
  process.exit(1);
}

const inline = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${id}');
`;
const hash = 'sha256-' + crypto.createHash('sha256').update(inline).digest('base64');
const tag = `<!-- Google tag (gtag.js) — added by the Pages deploy, not part of the source. -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>${inline}</script>
`;

let html = fs.readFileSync(file, 'utf8');
if (html.includes('googletagmanager.com/gtag/js')) { console.log('analytics: already present, nothing to do'); process.exit(0); }

const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([\s\S]*?)">/);
if (!csp) { console.error('analytics: no Content-Security-Policy meta found'); process.exit(1); }
const widen = (policy, directive, extra) => {
  const re = new RegExp(`(^|;)(\\s*)${directive}([^;]*)`);
  if (!re.test(policy)) throw new Error(`CSP has no ${directive} directive`);
  return policy.replace(re, (m, a, b, rest) => `${a}${b}${directive}${rest.replace(/\s+$/, '')} ${extra}${/\s$/.test(rest) ? ' ' : ''}`);
};
let policy = csp[1];
policy = widen(policy, 'script-src', `https://www.googletagmanager.com '${hash}'`);
policy = widen(policy, 'connect-src', 'https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com');
policy = widen(policy, 'img-src', 'https://*.google-analytics.com https://www.googletagmanager.com');
html = html.replace(csp[0], `<meta http-equiv="Content-Security-Policy" content="${policy}">`);
html = html.replace('</head>', tag + '</head>');
fs.writeFileSync(file, html);
console.log(`analytics: tagged ${file} with ${id}`);
