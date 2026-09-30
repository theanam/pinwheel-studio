# Porting the design prototype

The design for Pinwheel Studio was built in Claude Design as two `.dc.html`
documents. They are kept verbatim in `_source/` as the design source of truth:

```
_source/
  Pinwheel Studio.dc.html    the studio — template + editor logic
  Pinwheel Spec.dc.html      the product and technical spec
  pw/presets.js              preset system   → src/presets.js
  pw/render.js               renderer        → src/render.js
  pw/io.js                   export and I/O  → src/io.js
```

A `.dc.html` document is an HTML template inside `<x-dc>` with `{{ … }}` bindings,
`<sc-if>` / `<sc-for>` control flow and a `<helmet>` head block, plus a class that
exposes a flat `renderVals()` object for the template to render against. That shape
ports to React almost directly, so the port is mechanical rather than a rewrite — no
value in the UI was retyped by hand.

## What was generated, and how to regenerate it

| Output | Script | Notes |
|---|---|---|
| `src/StudioView.jsx` | `node scripts/dc-to-jsx.mjs` | Template → JSX |
| `src/lib/hover.css` | same script | `style-hover` attributes → real `:hover` rules |
| `public/spec.html` | `node scripts/dc-spec-to-html.mjs` | The spec is static HTML; it only needed the wrapper removed |

`scripts/dc-to-jsx.mjs` maps the template one construct at a time:

- `{{ expr }}` → a JSX expression. The prototype runtime resolved a binding's root
  identifier against a flat object, with `sc-for` variables shadowing it; the script
  tracks the same scope and prefixes `v.` where the root is not a loop variable.
- `style="a:b; c:d"` → a style object literal, resolved at generation time.
  `style="{{ expr }}"` → `sty(expr)`, which accepts either shape, because
  `renderVals()` returns some styles as strings and some as objects.
- `<sc-if value="{{ e }}">` → `{e ? <>…</> : null}`.
- `<sc-for list="{{ e }}" as="f">` → `{toArray(e).map((f, $index) => …)}`.
- `style-hover="…"` was an authoring hint the prototype runtime ignored. Here each
  distinct declaration becomes a generated class in `src/lib/hover.css`, so hover
  states actually work.
- `<helmet>` is dropped; its contents live in `index.html`.
- `<pw-mark size="N">` → `<Mark size={N} />`. The brand mark is a component
  (`src/lib/Mark.jsx`, geometry in `src/lib/mark-path.js`) rather than a drawing in
  the template, so the icons script and the spec page share it.
- Literal hex colours in static styles and in `style-hover` rules are mapped to UI
  tokens (`scripts/ui-tokens.js`), which is what makes dark mode a palette swap.
  `build-tokens.mjs` emits `src/lib/tokens.css` in the same run.

## What was changed by hand

`src/Studio.jsx` is the prototype's editor class, now owned as ordinary source. Only
four things differ from `_source/Pinwheel Studio.dc.html`:

1. It extends `React.Component` instead of the design tool's logic base, and gained a
   `render()` that calls `StudioView(this.renderVals())`.
2. The three modules are imported (`import('./presets.js')`) rather than resolved as
   URLs against `document.baseURI`.
3. `openProjectFile()` was split out of the file-input handler so the PWA file
   handler can reuse it, and a `launchQueue` consumer was added — spec §5 requires
   double-clicking a `.pinwheel` file to open the studio.
4. `qrcode-generator` is fetched through `io.js` once the modules land, instead of a
   `<script>` tag in the head, which keeps `script-src` free of `'unsafe-inline'` and
   lets self-hosting mode vendor it with everything else.
5. Chrome colours are tokens (`var(--pw-…)`) and a theme toggle was added; document
   colours (brand-kit defaults, new-element defaults, page backgrounds, swatches)
   stay literal. The Elements panel resolves two tokens with `cssVar()` because SVG
   `fill` attributes cannot take `var()`.
6. The home screen shows twelve formats and an "All formats" toggle, and the gallery
   gained an Occasions row that filters by copy pack.

`src/presets.js` has grown well past the prototype — 72 formats with safe zones and
story arcs, 74 layouts including photo-first and occasion layouts, 31 copy packs, and
procedural sample art on every frame — and `src/render.js` draws that sample art.

`src/io.js` is the prototype file unchanged apart from the CDN-vs-vendor indirection
at the top.

## Things the spec calls for that are not built yet

- **Virtualised gallery.** Thumbnails are live renders paged 48 at a time, as in the
  prototype. Spec §11 also asks for virtualisation and an `IntersectionObserver`.
- **Pixel baselines.** Spec §6 describes rendering one template per format × layout
  to PNG and diffing against approved images. `npm run test:visual` diffs the built
  element model instead — deterministic, no browser, and it catches the same layout
  regressions without committing hundreds of PNGs. Pixel diffs would need a headless
  browser in CI.
- **IndexedDB autosave.** Autosave writes to `localStorage` and skips assets past
  ~4.5 MB, which is what the prototype does; spec §11 wants IndexedDB in production.
- **Accessible layer tree** for canvas elements, and everything marked v1.1+ in the
  spec (animation, vector PDF, high-detail matting).
