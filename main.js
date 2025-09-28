import {getConfig} from "./phaserConfig.js";




const config = getConfig();

const game = new Phaser.Game(config);


// Einheiten für Positionierung und Skalierung
export const gW = game.scale.width;
export const gH = game.scale.height;
export const qS = getQuadraticSize();
function getQuadraticSize(){
    if (gW < gH) return gH;
    else return gW;
}
export const fontSizeS = qS/40;
export const fontSizeM = qS/30;
export const fontSizeL = qS/20;