const config = {
    type: Phaser.WEBGL,
    canvas: document.getElementById("gameCanvas"),
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: innerWidth,
        height: innerHeight,
    },
    pixelArt: true,
    scene: [], // Szenen werden später in main.js gesetzt
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 200 },
        },
    },
};

export default config;