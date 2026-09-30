/**
 * In self-hosting mode the app never talks to a CDN, so the CSP in index.html drops
 * those hosts at build time rather than carrying a permission it does not use.
 * Google Fonts stays allowed either way — see scripts/vendor.mjs.
 */
export default function tightenCsp() {
  return {
    name: 'pinwheel-csp',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      if (!ctx.server && process.env.VITE_VENDOR) {
        return html
          .replace(/ https:\/\/cdn\.jsdelivr\.net/g, '')
          .replace(/ https:\/\/huggingface\.co https:\/\/cdn-lfs\.huggingface\.co https:\/\/cdn-lfs-us-1\.hf\.co/g, '');
      }
      return html;
    },
  };
}
