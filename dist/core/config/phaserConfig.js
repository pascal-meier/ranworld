import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "./virtualResolution.js";
const canvas = document.getElementById("gameCanvas");
const config = {
    type: Phaser.WEBGL,
    canvas: canvas ?? undefined,
    pixelArt: true,
    backgroundColor: "#000",
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
    },
    scale: {
        width: VIRTUAL_WIDTH,
        height: VIRTUAL_HEIGHT,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 1,
        expandParent: true,
    },
    scene: [], // wird spaeter in main.ts gesetzt
    physics: {
        default: "arcade",
        arcade: { debug: false, gravity: { x: 5, y: 10 } },
    },
};
export default config;
