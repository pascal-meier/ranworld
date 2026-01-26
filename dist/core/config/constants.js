import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, SHORTEST_EDGE, } from "./virtualResolution.js";
const FONT_DIVISOR_XS = 30;
const FONT_DIVISOR_S = 20;
const FONT_DIVISOR_M = 10;
const FONT_DIVISOR_L = 5;
const FONT_DIVISOR_XL = 2;
// Viewport helpers derived from the fixed virtual resolution
export const viewportWidth = VIRTUAL_WIDTH;
export const viewportHeight = VIRTUAL_HEIGHT;
export const shortestViewportEdge = SHORTEST_EDGE;
// Dynamically scaled font sizes
export const fontSizeXS = Math.floor(shortestViewportEdge / FONT_DIVISOR_XS);
export const fontSizeS = Math.floor(shortestViewportEdge / FONT_DIVISOR_S);
export const fontSizeM = Math.floor(shortestViewportEdge / FONT_DIVISOR_M);
export const fontSizeL = Math.floor(shortestViewportEdge / FONT_DIVISOR_L);
export const fontSizeXL = Math.floor(shortestViewportEdge / FONT_DIVISOR_XL);
// Backwards-compatible aliases
export const gW = viewportWidth;
export const gH = viewportHeight;
export const qS = shortestViewportEdge;
