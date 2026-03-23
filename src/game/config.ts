import { LAB_PLUGIN_KEY, LabPlugin } from "./core/LabPlugin.js";

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
    width: 960,
    height: 540,
  },
  plugins: {
    global: [
      {
        key: LAB_PLUGIN_KEY,
        plugin: LabPlugin,
        start: true,
      },
    ],
  },
  scene: [],
};

export default config;
