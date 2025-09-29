export class RanChessBootScene extends Phaser.Scene {
    constructor() {
        super("RanChessBootScene");
    }

    preload() {
        // falls du gemeinsame Assets brauchst
    }

    create() {
        this.scene.start("RanChessPreloadScene");
    }
}
