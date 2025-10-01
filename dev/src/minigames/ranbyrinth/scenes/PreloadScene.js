export class RanByrinthPreloadScene extends Phaser.Scene {
    constructor() {
        super("RanByrinthPreloadScene");
    }

    preload() {
        // Hier die Assets laden

    }

    create() {
        this.scene.start("RanByrinthGameScene");
    }
}
