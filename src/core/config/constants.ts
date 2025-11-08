// Globale Bildschirmmaße (responsive Werte)
export const gW: number = window.innerWidth;
export const gH: number = window.innerHeight;

// Kleinster Wert (z. B. für quadratische Layouts)
export const qS: number = Math.min(gW, gH);

// Schriftgrößen dynamisch berechnen
export const fontSizeXS: number = Math.floor(qS / 30);
export const fontSizeS: number = Math.floor(qS / 20);
export const fontSizeM: number = Math.floor(qS / 10);
export const fontSizeL: number = Math.floor(qS / 5);
export const fontSizeXL: number = Math.floor(qS / 2);
