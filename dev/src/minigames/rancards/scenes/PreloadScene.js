export class RanCardsPreloadScene extends Phaser.Scene {
    constructor() {
        super("RanCardsPreloadScene");
    }

    preload() {
        // Hier die Assets laden

    }

    create() {
        this.scene.start("RanCardsGameScene");
    }
}
