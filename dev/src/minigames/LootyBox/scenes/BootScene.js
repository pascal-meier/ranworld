export class RanCardsBootScene extends Phaser.Scene {
    constructor() {
        super("RanCardsBootScene");
    }

    preload() {
        // falls du gemeinsame Assets brauchst
    }

    create() {
        this.scene.start("RanCardsPreloadScene");
    }
}
