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
| `src/StudioView.jsx` | `node scripts/dc-to-jsx.mjs` | Template → JSX. **Now hand-maintained**; see below. Re-running the script would discard the responsive shell. |
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
7. The font picker (`fontPickerEl`) is built with `createElement` in `Studio.jsx`, like
   `selectEl` before it, because the Text properties and the Brand panel share it and
   the template only has a `selectNode` slot. It is a fixed-position popover that
   lists every family in its own face; the shared menu backdrop closes it.
8. The Layers panel reorders by drag and drop (`layerDragStart` and friends); the
   template rows carry the drag handlers and a grip, and the arrow buttons are gone.
9. Storage moved from `localStorage` to IndexedDB (`src/store.js`). The autosave
   became a recents list: every design touched is kept, up to the last hundred, with
   page 1 and low-res copies of its images so the home page can draw live
   thumbnails. The one brand kit became many (`src/brand.js`), each with its own
   image library, colour schemes and text styles, and a three-step brand builder
   (`startWizard`) that reads colour kits out of a logo (`src/palette.js`).
10. `.pinwheel` became type-aware: the manifest carries `kind: "design" | "brand"`,
    and `openProject` returns whichever it finds. Files leave the app through
    `io.js`'s `openSink` / `deliver`: a save dialog with a writable handle on desktop
    Chromium (so ⌘S saves in place), the share sheet on phones, else a download.
11. `StudioView.jsx` is no longer regenerated. It gained a responsive shell driven by
    `Studio#layout` (phone < 720 px, tablet < 1080 px): a compact top bar with one
    overflow menu, a bottom tab bar in place of the rail, and the flyout and
    properties panels as bottom sheets; on tablets the flyout floats over the canvas.
    Touch gestures live in `Studio.jsx`: one-finger pan on the page background, pinch
    to zoom (`onCanvasPointerDownCapture`), double-tap to edit, and `drag()` follows a
    single pointer id so a second finger cannot steer a move.

`src/presets.js` has grown well past the prototype — 72 formats with safe zones and
story arcs, 81 layouts including photo-first, occasion and podcast layouts, 40 copy packs, and
procedural sample art on every frame — and `src/render.js` draws that sample art and the `path` shape that occasion motifs
(`src/motifs.js`) use.

`src/io.js` is the prototype file unchanged apart from the CDN-vs-vendor indirection
at the top.

12. Native `confirm()` and `prompt()` are gone. `Studio#ask(opts)` resolves a promise
    from one modal that `StudioView` renders with `@radix-ui/react-dialog` (focus
    trap, Escape, overlay click), styled with the UI tokens. The editor also tracks a
    `dirty` flag, set by `pushHist` and cleared when a design is opened or
    re-templated: applying a template or re-laying out on resize asks before
    replacing edited pages, and does not ask again until the next edit. Every text a
    layout places remembers which copy field it came from (`key`: title, sub, cta,
    stat.0 …), so a template swap or re-layout carries the text the user changed
    into the slots that play the same role in the new layout (`editedText`,
    `carryText` in presets.js). The baseline check ignores `key`.

13. Text editing commits by two routes. The contentEditable reports every keystroke
    (`onTextInput`) and commits on blur; `componentDidUpdate` also commits the last
    reported text whenever `editingId` is cleared by anything else. A click on the
    canvas or another element re-renders the node before the browser's blur can fire,
    and a focused node that is removed never gets one (the focus fixup rule), so the
    blur-only version lost edits, most visibly on highlighted text, where React
    swaps the text node for a span. `readText` turns `text-transform` off while
    reading so an upper-cased element keeps the case that was typed.

14. The baseline check also enforces a quality rule from spec §6: no unrotated text
    a layout places may end past the page. Four layouts (hero-photo, photo-stat,
    recipe, motif-hero) and two more that hid text under another element
    (photo-quote, memorial) now budget their stacks from the space they have
    instead of fixed fractions, so a long title or a short format cannot push the
    button or the last line off the page or under a motif.

15. Podcast: five copy packs (interview, true crime, tech, comedy, wellness) and five
    layouts (Host & Guest, Press Play, Guest Quote, Episode Number, and channel art
    for the YouTube banner). The extra packs are `niche`: they appear only through
    layouts that name them, and those layouts ask for `every` pack they name, so
    adding them did not reshuffle any existing template. New layouts go at the end
    of the list for the same reason.

16. Uploaded fonts. A brand carries `fonts` (TTF, OTF, WOFF, WOFF2 as data URLs);
    `io.js` registers them with the FontFace API, offers them under an "Uploaded"
    chip in every font picker, writes `@font-face` rules for them into exports, and
    packs them into `fonts/` of design files (the ones used) and brand kits (all).
17. Brand preview. `brandOn` is session state, off on every visit: the home gallery
    always opens with templates in their own style. Picking a brand restyles every preview
    through `brandify` (theme map plus pairing) with a note above the gallery, and
    templates then open already branded, as do blank designs; "No brand" starts a
    blank design from the neutral paper palette instead.

18. Page backgrounds. A page may carry `bgAsset` (a photo covering it) and `pattern`
    (`{ id, fg, alpha, scale }`, one of the tiles in `src/patterns.js`, drawn as a
    repeating SVG data URL over the page colour). The pattern's colour is a theme
    role in templates, so `applyThemeTo` recolours it with everything else. Four
    layouts (Patterned Card, Pattern Band, Pattern Corner, Patterned Invitation)
    choose a pattern per template from soft, bold or party sets. The renderer paints
    the pattern and the photo as layers under the elements. Uploaded tiles join the
    brand (`brand.patterns`, image in `brand.assets`); `io.analyzePattern` decides
    on upload whether a tile is mono (one colour on transparency, or dark on light;
    its shape becomes an alpha mask the renderer floods with the pattern colour) or
    keeps its colours (drawn as is, colour control off). A page colour change moves
    the pattern colour to the theme colour with the most contrast on the new page.

19. Text metrics. Each type pairing carries widths measured in a browser from
    rendered text (`wf`/`wfu` lowercase and capital letters of the display face,
    `sp` its space; `bwf`/`bwfu`/`bwfb` and `bsp` for the body face). The estimator
    in presets.js (`charEm`, `wordEm`, `estLines`, `fitSize`) buckets letters by
    shape (an "m" is three times an "i", a "W" twice an "I"), sizes digits and
    symbols from the lowercase width, adds tracking per character, treats the box as
    95% of its width and gives the longest word 8% slack. It replaced a single
    average per face, which sized title-case headings a line too large and let
    everything stacked below them collide. Scenery and portrait sample art widen
    their view box for wide frames and objects fit whole, so a frame never shows
    half an illustration. Re-measure with `scripts`-style probes if a pairing
    changes face.

## Browser smoke test

`npm run test:browser` (`tests/browser/smoke.mjs`) drives a local headless Chrome
over the DevTools protocol with no dependencies beyond Node: it builds a brand from a
generated logo, checks the `.pinwheel` round trips for designs and kits, fills the
recents list past its cap, and exercises the phone layout with touch drags and a
pinch. It needs the dev server running and writes screenshots to
`tests/browser/shots/`. In development the editor instance is exposed as
`window.__studio` for it.

## Things the spec calls for that are not built yet

- **Virtualised gallery.** Thumbnails are live renders paged 48 at a time, as in the
  prototype. Spec §11 also asks for virtualisation and an `IntersectionObserver`.
- **Pixel baselines.** Spec §6 describes rendering one template per format × layout
  to PNG and diffing against approved images. `npm run test:visual` diffs the built
  element model instead — deterministic, no browser, and it catches the same layout
  regressions without committing hundreds of PNGs. Pixel diffs would need a headless
  browser in CI.
- **Accessible layer tree** for canvas elements, and everything marked v1.1+ in the
  spec (animation, vector PDF, high-detail matting).
