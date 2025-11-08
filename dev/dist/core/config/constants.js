// Globale Bildschirmmaße (responsive Werte)
export const gW = window.innerWidth;
export const gH = window.innerHeight;
// Kleinster Wert (z. B. für quadratische Layouts)
export const qS = Math.min(gW, gH);
// Schriftgrößen dynamisch berechnen
export const fontSizeXS = Math.floor(qS / 30);
export const fontSizeS = Math.floor(qS / 20);
export const fontSizeM = Math.floor(qS / 10);
export const fontSizeL = Math.floor(qS / 5);
export const fontSizeXL = Math.floor(qS / 2);
