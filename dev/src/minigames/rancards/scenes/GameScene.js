export class RanCardsGameScene extends Phaser.Scene {
    constructor() {
        super("RanCardsGameScene");
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2, "RanCards läuft!", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Beispiel: zurück ins Menü
        this.input.keyboard.once("keydown-ESC", () => {
            this.scene.start("MainMenuScene");
        });
    }
}
