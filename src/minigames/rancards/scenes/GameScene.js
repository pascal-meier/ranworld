import {Button} from "../../../common/ui/Button.js";

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

        // Zurück ins Menü
        const backButton = new Button (this, width / 4, height*0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });
    }
}
