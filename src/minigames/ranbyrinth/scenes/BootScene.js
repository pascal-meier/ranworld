export class RanByrinthBootScene extends Phaser.Scene {
    constructor() {
        super("RanByrinthBootScene");
    }

    preload() {
        // falls du gemeinsame Assets brauchst
    }

    create() {
        this.scene.start("RanByrinthPreloadScene");
    }
}
