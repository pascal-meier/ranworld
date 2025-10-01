const config = {
    type: Phaser.WEBGL,
    canvas: document.getElementById("gameCanvas"),
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
    scene: [], // Szenen werden in main.js gesetzt
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
        },
    },
};

export default config;