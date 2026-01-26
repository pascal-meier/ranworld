export class RythmDrumPreloadScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumPreloadScene");
    }

    preload() {
        // Lade alle benötigten Assets für das Minispiel
        this.load.image("base-bg", "public/assets/common/space_bg.png");
        this.load.image("drum", "public/assets/rythmdrums/tonguedrum.png");

        // Drum-Varianten (1–8)
        for (let i = 1; i <= 8; i++) {
            this.load.image(`d${i}`, `public/assets/rythmdrums/tonguedrum_0${i}.png`);
            this.load.audio(`${i}`, `public/assets/rythmdrums/sounds/${i}.wav`);
        }

        // Extra-Sounds
        this.load.audio("fail", "public/assets/rythmdrums/sounds/fail.wav");
        this.load.audio("success", "public/assets/rythmdrums/sounds/success.wav");

        // Ladebalken
        const { width, height } = this.scale;
        const progressText = this.add.text(width / 2, height / 2, "Loading...", {
            fontSize: "20px",
            color: "#ffffff",
        }).setOrigin(0.5);

        this.load.on("progress", (value: number) => {
            progressText.setText(`Loading: ${Math.round(value * 100)}%`);
        });
    }

    create() {
        // Weiter zur Spielszene
        this.scene.start("RythmDrumGameScene");
    }
}
