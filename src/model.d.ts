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

export interface BrandKit {
  bg: Color;
  ink: Color;
  accent: Color;
  accent2: Color;
  heading: string;
  body: string;
  logo: AssetId | null;
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
  shadow?: boolean;
}

export type ShapeKind =
  | 'rect' | 'rounded' | 'ellipse' | 'triangle' | 'diamond' | 'star' | 'burst'
  | 'polygon' | 'arrow' | 'chevron' | 'parallelogram' | 'arch' | 'half' | 'quarter' | 'poly';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeKind;
  fill?: Color;
  stroke?: Color;
  /** Stroke width. */
  sw: number;
  radius: number;
  /** Star points. */
  points: number;
  /** Star inner radius, 0–1. */
  inner: number;
  /** Regular-polygon sides. */
  sides: number;
  /** Unit-square points for `shape: 'poly'`. */
  pts?: [number, number][];
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
  shadow?: boolean;
  /** Placeholder caption and tint, shown until a photo is dropped in. */
  label?: string;
  tint?: Color;
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

export interface Page {
  id: string;
  bg: Color;
  bgAsset?: AssetId;
  els: Element[];
}

export interface PinwheelDocument {
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
}

/** manifest.json inside a .pinwheel zip (spec §5). */
export interface PinwheelManifest {
  format: 'pinwheel';
  version: number;
  app: string;
  created: ISODate;
  modified: ISODate;
  name: string;
  size: { w: number; h: number; unit: 'px' };
  pages: number;
  assets: Record<AssetId, {
    path: string;
    mime: string;
    name: string;
    bytes: number;
    w?: number;
    h?: number;
  }>;
}
