import { RiggedRaceBootScene } from "./scenes/BootScene.js";
import { RiggedRacePreloadScene } from "./scenes/PreloadScene.js";
import { RiggedRaceGameScene } from "./scenes/GameScene.js";
// 💡: Array mit Typhinweis (Hilft VSCode + IntelliSense)
const RiggedRaceScenes = [
    RiggedRaceBootScene,
    RiggedRacePreloadScene,
    RiggedRaceGameScene
];
export default RiggedRaceScenes;
