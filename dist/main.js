import config from "./game/config.js";
import scenes from "./game/scenes/index.js";
async function bootGame() {
    if ("fonts" in document) {
        try {
            await Promise.all([
                document.fonts.load('12px "Pixelify Sans"'),
                document.fonts.load('bold 12px "Pixelify Sans"'),
            ]);
        }
        catch {
            // Fall back to normal startup if the web font fails to load.
        }
    }
    new Phaser.Game({
        ...config,
        scene: scenes,
    });
}
void bootGame();
