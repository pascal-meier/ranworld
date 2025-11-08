import config from "./core/config/phaserConfig.js";
import scenes from "./core/sceneRegistry.js";

new Phaser.Game({
  ...config,
  scene: scenes,
});
