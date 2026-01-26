const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  canvas: canvas ?? undefined, 
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
  scene: [], 
  physics: {
    default: "arcade",
    arcade: { debug: false, gravity: { x: 5, y: 10 } },
  },
  backgroundColor: "#000",
};

export default config;
