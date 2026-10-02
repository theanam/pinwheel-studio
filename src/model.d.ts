/**
 * The Pinwheel document model (spec §4) and the .pinwheel manifest (spec §5).
 *
 * Coordinates are CSS pixels in page space. Elements live in a flat list per page and
 * array order is z-order. Groups are a shared `groupId` rather than nesting, which
 * keeps hit-testing, snapping and the layer list simple.
 *
 * These declarations are the contract the JS modules already honour; modules migrate
 * to TypeScript against them one at a time (see README, "TypeScript").
 */

/** `#RRGGBB`, or any CSS colour the renderer passes straight through. */
export type Color = string;
export type AssetId = string;
export type ElementId = string;
export type FormatId = string;
export type TemplateId = string;
export type ISODate = string;

/** Theme role names. Every colour in a template is a role, which is what makes
 *  one-click recolouring possible: swapping a palette maps role → role. */
export type ThemeRole =
  | 'bg' | 'ink' | 'accent' | 'accent2' | 'surface' | 'muted'
  | 'onAccent' | 'onAccent2' | 'hi' | 'line' | 'tint' | 'onSurface';

export type Theme = Record<ThemeRole, Color> & {
  id?: string;
  name?: string;
  /** Display (heading) and body font families, by Google Fonts family name. */
  display: string;
  body: string;
  pairId?: string;
};

/** The four colour roles and two fonts a design is themed from. */
export interface BrandColors {
  bg: Color;
  ink: Color;
  accent: Color;
  accent2: Color;
}

/** A saved colour scheme inside a brand. */
export interface BrandPalette extends BrandColors {
  id: string;
  name: string;
}

/** A saved text style. Colours are theme roles where they matched one, else literal;
 *  shadow offsets and blur are fractions of the font size; outlineW is for a 40 px size. */
export interface BrandTextStyle {
  id: string;
  name: string;
  custom: true;
  font: string;
  weight: number;
  italic?: boolean;
  upper?: boolean;
  ls?: number;
  color: ThemeRole | Color;
  bg?: ThemeRole | Color;
  outline?: ThemeRole | Color;
  outlineW?: number;
  outlineFill?: boolean;
  shadow?: { x: number; y: number; blur: number; color: ThemeRole | Color; long?: boolean };
  softShadow?: boolean;
}

/** What a design file records about the brand it was made with. */
export interface BrandKit extends BrandColors {
  id?: string;
  name?: string;
  heading: string;
  body: string;
  logo: AssetId | null;
}

/** A brand as stored on the device and packed into a brand-kit file. Several can
 *  coexist; one is active. `assets` is the brand's own image library (the logo is
 *  one of them), inline in IndexedDB and written to assets/ in a kit file. */
/** A font file the user uploaded. `family` is the CSS name text elements refer to. */
export interface CustomFont {
  name: string;
  family: string;
  mime: 'font/ttf' | 'font/otf' | 'font/woff' | 'font/woff2';
  /** Data URL of the file; absent in brand.json, where the bytes live in fonts/. */
  src?: string;
}

export interface Brand extends BrandKit {
  id: string;
  name: string;
  created: number;
  updated: number;
  assets: Record<AssetId, Asset>;
  fonts: Record<string, CustomFont>;
  /** Uploaded pattern tiles, held in `assets`; `mono` ones recolour. */
  patterns: { asset: AssetId; name: string; mono: boolean }[];
  palettes: BrandPalette[];
  textStyles: BrandTextStyle[];
}

export interface BaseElement {
  id: ElementId;
  type: 'text' | 'shape' | 'line' | 'image' | 'chart' | 'qr';
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees, clockwise. */
  rot: number;
  opacity: number;
  groupId?: string;
  locked?: boolean;
  hidden?: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  /** The copy-pack field this text was built from (`title`, `sub`, `cta`, `stat.0` …).
   *  Lets edited text follow the design into another template. User-added text has none. */
  key?: string;
  font: string;
  size: number;
  weight: number;
  italic?: boolean;
  color: Color;
  align: 'left' | 'center' | 'right';
  /** Line height, unitless. */
  lh: number;
  /** Letter spacing, in em. */
  ls: number;
  upper?: boolean;
  /** Highlight behind the text. */
  bg?: Color;
  outline?: Color;
  /** Outline stroke width in px; defaults to size / 34. */
  outlineW?: number;
  /** Keep the fill colour under the outline (default: hollow). */
  outlineFill?: boolean;
  /** `true` is the original soft drop shadow; an object is a custom one. With `long`
   *  the glyphs are extruded along (x, y) in 1px steps — the sharp poster shadow. */
  shadow?: boolean | { x: number; y: number; blur: number; color: Color; long?: boolean };
}

export type ShapeKind =
  | 'rect' | 'rounded' | 'pill' | 'ellipse' | 'triangle' | 'rtriangle' | 'diamond'
  | 'pentagon' | 'hexagon' | 'octagon' | 'polygon' | 'star' | 'burst' | 'gear'
  | 'arrow' | 'chevron' | 'pointer' | 'parallelogram' | 'trapezoid' | 'cross'
  | 'arch' | 'half' | 'quarter' | 'ring' | 'heart' | 'drop' | 'cloud' | 'speech' | 'crescent'
  | 'bolt' | 'shield' | 'blob' | 'wave' | 'ticket' | 'tag' | 'bookmark' | 'banner'
  | 'poly' | 'path';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeKind;
  fill?: Color;
  stroke?: Color;
  /** Stroke width. */
  sw: number;
  radius: number;
  /** Star points; gear teeth. */
  points: number;
  /** Star inner radius, 0–1; for a ring, the hole radius. */
  inner: number;
  /** Regular-polygon sides. */
  sides: number;
  /** Unit-square points for `shape: 'poly'`. */
  pts?: [number, number][];
  /** SVG path data in a 100×100 box for `shape: 'path'` (occasion motifs). */
  d?: string;
  dash?: boolean;
  shadow?: boolean;
}

export interface LineElement extends BaseElement {
  type: 'line';
  stroke: Color;
  sw: number;
  dash?: boolean;
  arrow?: boolean;
}

/** brightness, contrast, saturate, blur, grayscale, sepia, hue-rotate. */
export interface ImageFilters {
  b?: number;
  c?: number;
  s?: number;
  bl?: number;
  g?: number;
  se?: number;
  hu?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  asset?: AssetId;
  /** The pre-cutout original, kept so background removal is reversible. */
  origAsset?: AssetId;
  /** Edge softness of the cutout in px, applied when the background was removed. */
  feather?: number;
  mask: 'none' | 'rounded' | 'circle' | 'arch';
  radius: number;
  /** Focus point, in per cent of the frame. */
  cx: number;
  cy: number;
  zoom: number;
  flip?: boolean;
  filters: ImageFilters;
  border?: Color;
  borderW?: number;
  /** `true` is the soft default; an object is a custom drop shadow. */
  shadow?: boolean | { x: number; y: number; blur: number; color: Color };
  /** Where the border and shadow are drawn. Defaults to the subject's silhouette
   *  when the asset has transparency and there is no mask, else the frame. */
  edge?: 'subject' | 'frame';
  /** Placeholder caption and tint, shown until a photo is dropped in. */
  label?: string;
  tint?: Color;
  /** Procedural sample art drawn while the frame has no asset (templates set this). */
  sample?: { kind: 'portrait' | 'landscape' | 'object'; v: number; c: Record<string, Color>; scene?: 'winter' | 'night'; prop?: string; obj?: string } | null;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chart: 'bar' | 'line' | 'pie' | 'donut';
  data: { l: string; v: number }[];
  colors: Color[];
  ink: Color;
  font: string;
  labels?: boolean;
  /** Donut hole fill. */
  hole?: Color;
}

export interface QRElement extends BaseElement {
  type: 'qr';
  value: string;
  fg: Color;
  qbg: Color;
}

export type Element =
  | TextElement | ShapeElement | LineElement | ImageElement | ChartElement | QRElement;

/** A tileable pattern over the page colour: a built-in tile from src/patterns.js by
 *  id, or `custom` with an uploaded tile held as an asset. A mono custom tile is an
 *  alpha mask flooded with `fg`; a colour one is drawn as is. */
export interface PagePattern {
  id: string | 'custom';
  asset?: AssetId;
  mono?: boolean;
  /** Tile colour; a theme role in templates, so palette swaps recolour it. */
  fg: Color;
  /** 0–1, how strongly the tile shows. */
  alpha: number;
  /** Tile size multiplier, 0.25–4. */
  scale: number;
  /** Rotation of the whole tiling in degrees, −180 to 180, clockwise positive. */
  rot?: number;
}

export interface Page {
  id: string;
  bg: Color;
  /** A photo covering the page, above the pattern. */
  bgAsset?: AssetId;
  pattern?: PagePattern;
  els: Element[];
}

export interface PinwheelDocument {
  /** Stable identity, so the recents list updates in place as the design changes. */
  id?: string;
  name: string;
  /** Page size in px. */
  w: number;
  h: number;
  /** Origin format, which is what enables re-layout on resize. */
  fmt: FormatId | 'custom';
  tpl?: TemplateId;
  theme: Theme;
  pages: Page[];
  brand?: BrandKit;
  created: ISODate;
}

/** A decoded image held in memory; `src` is a data URL. */
export interface Asset {
  src: string;
  name?: string;
  w?: number;
  h?: number;
  /** Has see-through pixels (a cutout or transparent PNG). Detected on import. */
  alpha?: boolean;
}

export type AssetIndex = Record<AssetId, {
  path: string;
  mime: string;
  name: string;
  bytes: number;
  w?: number;
  h?: number;
}>;

/** manifest.json inside a .pinwheel zip (spec §5). The file is a zip either way;
 *  `kind` says what is in it. Version 2 added `kind`; a manifest without it is a
 *  version-1 design. */
export interface ManifestBase {
  format: 'pinwheel';
  version: number;
  app: string;
  created: ISODate;
  modified: ISODate;
  name: string;
  assets: AssetIndex;
  /** Uploaded fonts in fonts/: a design carries the ones it uses, a brand kit all of its own. */
  fonts?: Record<string, { path: string; mime: string; name: string; family: string; bytes: number }>;
}

/** A design: document.json plus assets/ and thumbnail.png. */
export interface DesignManifest extends ManifestBase {
  kind?: 'design';
  size: { w: number; h: number; unit: 'px' };
  pages: number;
}

/** A brand kit: brand.json (a Brand whose assets carry no bytes) plus assets/. */
export interface BrandManifest extends ManifestBase {
  kind: 'brand';
}

export type PinwheelManifest = DesignManifest | BrandManifest;

/** A row in the recents list (IndexedDB `recents`). The full document and assets
 *  sit in `docs` under the same id; this record is what the home page lists and
 *  renders a live thumbnail from, so it carries page 1 with low-res images only. */
export interface RecentDesign {
  id: string;
  name: string;
  fmt: FormatId | 'custom';
  w: number;
  h: number;
  pages: number;
  created: ISODate;
  /** Epoch ms of the last change. The hundred newest are kept. */
  updated: number;
  tpl: TemplateId | null;
  preview: { page: Page; assets: Record<AssetId, Asset> };
}
