// One-shot migration: the spec document from the design prototype is static HTML
// inside an <x-dc> wrapper, so it only needs the wrapper removed and the <helmet>
// contents hoisted into <head>. Output is served as a plain page at /spec.html.
import fs from 'fs';

const raw = fs.readFileSync('_source/Pinwheel Spec.dc.html', 'utf8');
const open = raw.match(/<x-dc(?:\s[^>]*)?>/);
const body = raw.slice(open.index + open[0].length, raw.lastIndexOf('</x-dc>'));

const helmet = body.match(/<helmet>([\s\S]*?)<\/helmet>/);
const head = helmet ? helmet[1].trim() : '';
const content = body.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim()
  // The studio is the app itself, not a sibling document.
  .replace(/href="Pinwheel Studio\.dc\.html"/g, 'href="./"');

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/spec.html', `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#F4F2EE">
<link rel="icon" href="./icon.svg" type="image/svg+xml">
${head}
</head>
<body>
${content}
</body>
</html>
`);
console.log('public/spec.html', fs.statSync('public/spec.html').size, 'bytes');
