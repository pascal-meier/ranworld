import { LootyBoxBootScene } from "./scenes/BootScene.js";
import { LootyBoxPreloadScene } from "./scenes/PreloadScene.js";
import { LootyBoxGameScene } from "./scenes/GameScene.js";
import type Phaser from "phaser";

// Typed list of scenes to help IDE auto-complete.
const LootyBoxScenes: (typeof Phaser.Scene)[] = [
  LootyBoxBootScene,
  LootyBoxPreloadScene,
  LootyBoxGameScene,
];

export default LootyBoxScenes;
