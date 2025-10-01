export class RanChessGameScene extends Phaser.Scene {
    constructor() {
        super("RanChessGameScene");
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2, "RanChess läuft!", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Beispiel: zurück ins Menü
        this.input.keyboard.once("keydown-ESC", () => {
            this.scene.start("MainMenuScene");
        });
    }
}
