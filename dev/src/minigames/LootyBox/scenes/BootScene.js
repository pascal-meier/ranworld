export class LootyBoxBootScene extends Phaser.Scene {
    constructor() {
        super("LootyBoxBootScene");
    }

    preload() {
        
    }

    create() {
        this.scene.start("LootyBoxPreloadScene");
    }
}
