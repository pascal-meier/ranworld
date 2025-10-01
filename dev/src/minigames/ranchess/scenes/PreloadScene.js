export class RanChessPreloadScene extends Phaser.Scene {
    constructor() {
        super("RanChessPreloadScene");
    }

    preload() {
        // Hier die Assets laden

    }

    create() {
        this.scene.start("RanChessGameScene");
    }
}
