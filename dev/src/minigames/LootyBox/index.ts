import { LootyBoxBootScene } from "./scenes/BootScene.js";
import { LootyBoxPreloadScene } from "./scenes/PreloadScene.js";
import { LootyBoxGameScene } from "./scenes/GameScene.js";
import type Phaser from "phaser";

// 💡: Array mit Typhinweis (Hilft VSCode + IntelliSense)
const LootyBoxScenes: (typeof Phaser.Scene)[] = [
  LootyBoxBootScene,
  LootyBoxPreloadScene,
  LootyBoxGameScene
];

export default LootyBoxScenes;
