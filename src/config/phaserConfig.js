const config = {
    type: Phaser.WEBGL,
    canvas: document.getElementById("gameCanvas"),
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 320,
        height: 640,
    },
    pixelArt: true,
    scene: [], // Szenen werden in main.js gesetzt
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 200 },
        },
    },
};

export default config;