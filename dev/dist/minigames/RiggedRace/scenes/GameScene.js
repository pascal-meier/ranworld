import { Button } from "../../../common/ui/Button.js";
import { Track } from "../objects/track.js";
import { Fox } from "../objects/fox.js";
export class RiggedRaceGameScene extends Phaser.Scene {
    scoreValue;
    constructor() {
        super("RiggedRaceGameScene");
    }
    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        // 🖼️ Hintergrundbild
        const baseBG = this.add.image(width / 2, height / 2, "base-bg");
        baseBG.setDisplaySize(width, height); // skaliert sauber statt innerWidth
        baseBG.setOrigin(0.5);
        // Zurück-Button
        new Button(this, width / 4, height * 0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });
        // Titel
        this.add.text(centerX, height * 0.2, "CHOOSE RACER", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);
        // Rennstrecken
        const spacing = 100;
        let startY = 50;
        let track01 = new Track(this).setPosition(0, startY - 2 * spacing);
        let track02 = new Track(this).setPosition(0, startY - spacing);
        let track03 = new Track(this).setPosition(0, startY);
        //Foxes
        const fox1 = new Fox(this, "Speedy", "fox01")
            .setPosition(75, innerHeight * 0.5 - 2 * spacing);
        const fox2 = new Fox(this, "Turbo", "fox02")
            .setPosition(75, innerHeight * 0.5 - spacing);
        const fox3 = new Fox(this, "Lightning", "fox03")
            .setPosition(75, innerHeight * 0.5);
    }
}
