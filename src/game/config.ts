const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null;

type RuntimeGameConfig = Phaser.Types.Core.GameConfig & {
  renderType?: number;
};

const config: RuntimeGameConfig = {
  type: Phaser.WEBGL,
  renderType: Phaser.WEBGL,
  canvas: canvas ?? undefined,
  backgroundColor: "#06131f",
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 360,
  },
  scene: [],
};

export default config;
