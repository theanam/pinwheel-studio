# Third-party licences

Pinwheel Studio ships no third-party code in its own bundles. The libraries below are
loaded from a pinned CDN the first time a feature needs them, and the fonts come from
Google Fonts. Nothing here is required to open, edit or save a design — only to
export one, or to remove a background.

| Component | Version | Licence | Used for |
|---|---|---|---|
| [html-to-image](https://github.com/bubkoo/html-to-image) | 1.11.11 | MIT | Rasterising a page through an SVG `foreignObject` |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | MIT | Assembling multi-page PDFs |
| [JSZip](https://github.com/Stuk/jszip) | 3.10.1 | MIT or GPLv3 — used under MIT | Packing `.pinwheel` files and zipping multi-page exports |
| [onnxruntime-web](https://github.com/microsoft/onnxruntime) | 1.18.0 | MIT | Running inference on WASM, with WebGPU when available |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 1.4.4 | MIT | Encoding QR codes, rendered as a single SVG path |
| [React](https://react.dev) | 18.3 | MIT | The editor UI |

## Model

**U²-Netp** — Qin et al., *U²-Net: Going Deeper with Nested U-Structure for Salient
Object Detection*. Apache-2.0. The ONNX export is the one distributed by
[rembg](https://github.com/danielgatis/rembg) (MIT). Downloaded once on first use and
cached in the browser's Cache Storage under `pinwheel-models`.

## Fonts

All 34 typefaces are Google Fonts under the
[SIL Open Font License 1.1](https://openfontlicense.org). They are referenced by
family name in a `.pinwheel` file rather than embedded, and inlined as data URIs only
into an export, so exported files render correctly anywhere.

## This project

- Application code: MIT — see [LICENSE](LICENSE).
- Presets (layouts, palettes, copy packs, type pairings): CC0 — see
  [LICENSE-PRESETS](LICENSE-PRESETS). Designs made from them belong to their authors,
  with no attribution required.
