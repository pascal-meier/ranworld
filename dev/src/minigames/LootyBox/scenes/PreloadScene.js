export class LootyBoxPreloadScene extends Phaser.Scene {
    constructor() {
        super("LootyBoxPreloadScene");
    }

    preload() {
        // Hier die Assets laden
        this.load.image("base-bg", "public/assets/common/space_bg.png");
        this.load.spritesheet("box", "public/assets/lootybox/boxes.png", { frameWidth: 40, frameHeight: 32});
        this.load.image("open-particles", "public/assets/lootybox/spark.png");
    }

    create() {
        this.scene.start("LootyBoxGameScene");
    }
}
