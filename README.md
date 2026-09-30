# Pinwheel Studio (WIP)

**https://pinwheelstudio.org**

An open-source desktop-publishing studio that runs entirely in the browser. Social
posts, thumbnails, print and slides — no account, no server, no uploads. Your files
stay on your machine.

- **Local-first.** A static site. Every feature, including the background-removal
  model, runs on the device.
- **Portable files.** A `.pinwheel` file is a zip: a JSON document plus the original
  assets. Easy to share, diff and archive.
- **Real templates.** 8,412 of them across 72 formats, generated from 76 hand-built
  layouts and 35 copy packs, so every template opens as ordinary text, shapes and
  frames. 19 occasions — kids' and grown-up birthdays, engagement, wedding,
  anniversary, Valentine's, Mother's Day, baby shower, graduation, Christmas, Eid,
  Puja, Diwali, Easter, Thanksgiving, Halloween, New Year and memorials — each with a
  signature palette, a motif set (snowflakes, reindeer, crescents, lanterns, diyas,
  eggs, pumpkins, balloons, rings, doves…) and a background scatter. Every frame
  carries sample art in the template's own palette until a photo replaces it. Decks,
  carousels, booklets, reports and menus open with a story arc across their pages.

The full product and technical spec is at [`public/spec.html`](public/spec.html), and
is served from the running app at `/spec.html`.

## Getting started

```sh
npm install
npm run dev        # http://localhost:5185
```

```sh
npm run build      # → dist/, ready for any static host
npm run preview    # serve the build locally
```

`base` is `./` in `vite.config.js`, so a single build works under
`user.github.io/pinwheel/`, a custom domain or a plain file server, with no rewriting.

## Layout

```
src/
  presets.js     Formats, palettes, type pairings, copy packs, layout functions,
                 catalogue generation. Pure, deterministic, no DOM.
  render.js      (element model) → React tree. Used by the canvas, the gallery
                 thumbnails and every export, so what you see is what you export.
  io.js          Export pipeline, .pinwheel pack/unpack, image import, on-device
                 inference. Third-party libraries load lazily on first use.
  Studio.jsx     The editor: state, history, selection, pointer gestures, snapping
                 and panels. The only stateful module.
  StudioView.jsx Presentation only — generated from the design prototype, driven
                 entirely by Studio#renderVals().
  model.d.ts     The document model and .pinwheel manifest as types.
```

Dependencies run one way: `presets → render → io → editor`. `presets.js` and
`render.js` never touch the DOM, which is what lets the template baselines run in
Node without a browser.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/`, including the generated service worker |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:visual` | Template baselines — one design per format × layout, diffed against `tests/baselines/layouts.json` |
| `npm run dev` then open `/tests/contact-sheet.html` | Visual QA sheet: live thumbnails of the catalogue, filterable by `?fmt=`, `layout=`, `per=`, `pages=` |
| `npm run icons` | Regenerate the brand mark (`public/icon*.png`, `public/icon.svg`) |
| `npm run vendor` | Download the pinned third-party libraries into `public/vendor` |
| `npm run build:offline` | Vendor everything, including the model, and build with no third-party hosts |

### Template baselines

`presets.js` generates every template from five ingredient sets, so a single layout
edit can change hundreds of designs at once. `npm run test:visual` builds one design
per format × layout pair, normalises away random ids and float noise,
and compares a hash against the committed baselines. When a change is intentional:

```sh
npm run test:visual -- --update    # then commit tests/baselines/layouts.json
```

### Self-hosting and air-gapped installs

By default the app fetches five pinned libraries from jsDelivr on first use and the
4.6 MB U²-Netp model from Hugging Face the first time you remove a background —
everything else is served from your own origin, and both are cached afterwards.

```sh
npm run build:offline
```

downloads all of them into `public/vendor`, points the app at those copies, and drops
the CDN and model hosts from the `Content-Security-Policy` in `index.html`. Google
Fonts stays remote in both modes: `.pinwheel` files reference font families by name
rather than embedding them, so the studio needs the live faces. Export inlines the
`woff2` files it needs as data URIs, so an exported PDF, PNG or SVG is self-contained.

## Deploying

`.github/workflows/pages.yml` type-checks, runs the template baselines, builds and
publishes to GitHub Pages on every push to `main`, served at
[pinwheelstudio.org](https://pinwheelstudio.org). The custom domain is set in the
repository's Pages settings and mirrored in `public/CNAME`; DNS points the apex at
GitHub's Pages IPs.

The build emits a PWA manifest and a service worker that precaches the app shell, so
the studio installs to the dock and opens offline. The manifest registers a file
handler for `application/vnd.pinwheel+zip`, which means double-clicking a `.pinwheel`
file opens it in the studio.

## Theming and dark mode

Every UI colour is a token. `scripts/ui-tokens.js` is the single source — light and
dark values per token, plus the map from the design prototype's literal hex values
to tokens — and `scripts/build-tokens.mjs` emits `src/lib/tokens.css` from it (the
view generator runs it). Dark follows `prefers-color-scheme` until the user picks a
side with the ☾ / ☀ button in the header, which sets `data-theme` on `<html>` and is
remembered in `localStorage`. Canvas pages keep their own colours; only the chrome
changes. Document colours in the editor (brand-kit defaults, new-element defaults,
swatches) stay literal on purpose.

## TypeScript

The document model and the `.pinwheel` manifest are declared in `src/model.d.ts`, and
`npm run typecheck` runs in CI. The four modules are still JavaScript; they move to
TypeScript against those declarations one at a time (`io.ts` first, then `presets.ts`
— it is pure and has no framework surface). `allowJs` is on and `checkJs` is off
until a module is converted.

## Where the design came from

`src/StudioView.jsx` and `public/spec.html` are generated from the design prototype
in `_source/`. See [`docs/PORTING.md`](docs/PORTING.md).

## Licence

Application code is [MIT](LICENSE). The presets — layouts, palettes, copy packs and
type pairings — are [CC0](LICENSE-PRESETS), so designs you make from them are yours,
with no attribution required. Third-party components are listed in
[THIRD-PARTY.md](THIRD-PARTY.md).
