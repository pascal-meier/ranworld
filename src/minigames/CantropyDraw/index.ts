import { CantropyDrawBootScene } from "./scenes/BootScene.js";
import { CantropyDrawPreloadScene } from "./scenes/PreloadScene.js";
import { CantropyDrawGameScene } from "./scenes/GameScene.js";

// 💡: Array mit Typhinweis (Hilft VSCode + IntelliSense)
const CantropyDrawScenes: (typeof Phaser.Scene)[] = [
  CantropyDrawBootScene,
  CantropyDrawPreloadScene,
  CantropyDrawGameScene
];

export default CantropyDrawScenes;
