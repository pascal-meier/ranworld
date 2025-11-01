import { LootyBoxBootScene } from "./scenes/BootScene.js";
import { LootyBoxPreloadScene } from "./scenes/PreloadScene.js";
import { LootyBoxGameScene } from "./scenes/GameScene.js";
// 💡: Array mit Typhinweis (Hilft VSCode + IntelliSense)
const LootyBoxScenes = [
    LootyBoxBootScene,
    LootyBoxPreloadScene,
    LootyBoxGameScene
];
export default LootyBoxScenes;
