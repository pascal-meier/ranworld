export class RanChessBootScene extends Phaser.Scene {
    constructor() {
        super("RanChessBootScene");
    }

    preload() {
    }

    create() {
        this.scene.start("RanChessPreloadScene");
    }
}
