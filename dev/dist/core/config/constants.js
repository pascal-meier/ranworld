const FONT_DIVISOR_XS = 30;
const FONT_DIVISOR_S = 20;
const FONT_DIVISOR_M = 10;
const FONT_DIVISOR_L = 5;
const FONT_DIVISOR_XL = 2;
// ℹ️ Viewport helpers used across scenes for responsive layouts ℹ️
export const viewportWidth = window.innerWidth;
export const viewportHeight = window.innerHeight;
export const shortestViewportEdge = Math.min(viewportWidth, viewportHeight);
// ℹ️ Dynamically scaled font sizes derived from viewport dimensions ℹ️
export const fontSizeXS = Math.floor(shortestViewportEdge / FONT_DIVISOR_XS);
export const fontSizeS = Math.floor(shortestViewportEdge / FONT_DIVISOR_S);
export const fontSizeM = Math.floor(shortestViewportEdge / FONT_DIVISOR_M);
export const fontSizeL = Math.floor(shortestViewportEdge / FONT_DIVISOR_L);
export const fontSizeXL = Math.floor(shortestViewportEdge / FONT_DIVISOR_XL);
// ℹ️ Backwards-compatible aliases (remove once consumers migrate) ℹ️
export const gW = viewportWidth;
export const gH = viewportHeight;
export const qS = shortestViewportEdge;
