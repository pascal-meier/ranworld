import config from "./game/config.js";
import scenes from "./game/scenes/index.js";
new Phaser.Game({
    ...config,
    scene: scenes,
});
