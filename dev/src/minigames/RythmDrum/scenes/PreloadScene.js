export class RythmDrumPreloadScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumPreloadScene");
    }

    preload() {
        // Hier die Assets laden
        this.load.image("base-bg", "public/assets/common/space_bg.png");
        this.load.image("drum", "public/assets/rythmdrums/tonguedrum.png");
        this.load.image("d1", "public/assets/rythmdrums/tonguedrum_01.png");
        this.load.image("d2", "public/assets/rythmdrums/tonguedrum_02.png");
        this.load.image("d3", "public/assets/rythmdrums/tonguedrum_03.png");
        this.load.image("d4", "public/assets/rythmdrums/tonguedrum_04.png");
        this.load.image("d5", "public/assets/rythmdrums/tonguedrum_05.png");
        this.load.image("d6", "public/assets/rythmdrums/tonguedrum_06.png");
        this.load.image("d7", "public/assets/rythmdrums/tonguedrum_07.png");
        this.load.image("d8", "public/assets/rythmdrums/tonguedrum_08.png");

        for (let i = 1; i <= 8; i++) {
            this.load.audio(`sound${i}`, `public/assets/rythmdrums/sounds/${i}.wav`);
        }
    }

    create() {
        this.scene.start("RythmDrumGameScene");
    }
}
