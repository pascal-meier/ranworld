import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  SHORTEST_EDGE,
} from "./virtualResolution.js";

const FONT_DIVISOR_XS = 30;
const FONT_DIVISOR_S = 20;
const FONT_DIVISOR_M = 10;
const FONT_DIVISOR_L = 5;
const FONT_DIVISOR_XL = 2;

// Viewport helpers derived from the fixed virtual resolution
export const viewportWidth: number = VIRTUAL_WIDTH;
export const viewportHeight: number = VIRTUAL_HEIGHT;
export const shortestViewportEdge: number = SHORTEST_EDGE;

// Dynamically scaled font sizes
export const fontSizeXS: number = Math.floor(shortestViewportEdge / FONT_DIVISOR_XS);
export const fontSizeS: number = Math.floor(shortestViewportEdge / FONT_DIVISOR_S);
export const fontSizeM: number = Math.floor(shortestViewportEdge / FONT_DIVISOR_M);
export const fontSizeL: number = Math.floor(shortestViewportEdge / FONT_DIVISOR_L);
export const fontSizeXL: number = Math.floor(shortestViewportEdge / FONT_DIVISOR_XL);

// Backwards-compatible aliases
export const gW = viewportWidth;
export const gH = viewportHeight;
export const qS = shortestViewportEdge;
