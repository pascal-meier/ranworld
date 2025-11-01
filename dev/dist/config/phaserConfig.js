const canvas = document.getElementById("gameCanvas");
const config = {
    type: Phaser.WEBGL,
    canvas: canvas ?? undefined, // falls das Element noch nicht existiert
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
    scene: [], // wird später in main.ts gesetzt
    physics: {
        default: "arcade",
        arcade: { debug: false, gravity: { x: 0, y: 0 } },
    },
    backgroundColor: "#000",
};
export default config;
