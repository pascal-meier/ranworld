import { RiggedRaceBootScene } from "./scenes/BootScene.js";
import { RiggedRacePreloadScene } from "./scenes/PreloadScene.js";
import { RiggedRaceGameScene } from "./scenes/GameScene.js";
import type Phaser from "phaser";

// 💡: Array mit Typhinweis (Hilft VSCode + IntelliSense)
const RiggedRaceScenes: (typeof Phaser.Scene)[] = [
  RiggedRaceBootScene,
  RiggedRacePreloadScene,
  RiggedRaceGameScene
];

export default RiggedRaceScenes;
