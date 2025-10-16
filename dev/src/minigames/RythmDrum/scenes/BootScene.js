export class RythmDrumBootScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumBootScene");
    }

    preload() {
        // falls du gemeinsame Assets brauchst
    }

    create() {
        this.scene.start("RythmDrumPreloadScene");
    }
}
