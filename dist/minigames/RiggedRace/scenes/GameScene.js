import { Button } from "../../../common/ui/Button.js";
import { Track } from "../objects/track.js";
import { Fox } from "../objects/fox.js";
import { Race } from "../objects/race.js";
export class RiggedRaceGameScene extends Phaser.Scene {
    scoreValue;
    foxes = [];
    selectedFox = null;
    race;
    constructor() {
        super("RiggedRaceGameScene");
    }
    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        // 🖼️ Hintergrundbild
        const baseBG = this.add.image(width / 2, height / 2, "base-bg");
        baseBG.setDisplaySize(width, height);
        baseBG.setOrigin(0.5);
        // 🔙 Zurück-Button
        new Button(this, width / 4, height * 0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });
        // 🏁 Titel
        let titeltext = this.add.text(centerX, height * 0.2, "CHOOSE RACER", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);
        // 🛤️ Rennstrecken
        const spacing = 100;
        const startY = 50;
        new Track(this).setPosition(0, startY - 2 * spacing);
        new Track(this).setPosition(0, startY - spacing);
        new Track(this).setPosition(0, startY);
        // 🦊 Füchse erzeugen
        const fox1 = new Fox(this, "Miyo", "fox01")
            .setPosition(75, innerHeight * 0.5 - 2 * spacing);
        const fox2 = new Fox(this, "Anber", "fox02")
            .setPosition(75, innerHeight * 0.5 - spacing);
        const fox3 = new Fox(this, "Ret", "fox03")
            .setPosition(75, innerHeight * 0.5);
        this.foxes = [fox1, fox2, fox3];
        // 🎧 Reagiere auf Klicks eines Fuchses
        this.events.on("foxSelected", (clickedFox) => {
            this.handleFoxSelection(clickedFox);
        });
        // 🏁 Rennen erstellen (z. B. mit Ziellinie rechts vom Bildschirm)
        this.race = new Race(this, this.foxes, this.scale.width - 100);
        // ▶️ Start-Button
        new Button(this, this.scale.width * 0.75, this.scale.height * 0.1, "Start Race", () => {
            if (!this.selectedFox) {
                console.log("⚠️ Bitte zuerst einen Fuchs auswählen!");
                return;
            }
            this.race.start();
        });
        // 🎉 Gewinner-Event
        this.events.on("raceFinished", (winner) => {
            console.log("🎉 Der Gewinner ist:", winner.getName());
            titeltext.text = winner.getName() + " wins!";
            // z. B. Text einblenden oder Belohnung anzeigen
            this.time.delayedCall(3000, () => {
                this.race.reset();
                this.selectedFox = null;
            });
        });
    }
    handleFoxSelection(clickedFox) {
        // Wenn derselbe Fuchs erneut geklickt wurde → abwählen
        if (this.selectedFox === clickedFox) {
            clickedFox.setSelected(false);
            this.selectedFox = null;
            return;
        }
        // Anderen abwählen
        if (this.selectedFox) {
            this.selectedFox.setSelected(false);
        }
        // Neuen aktivieren
        clickedFox.setSelected(true);
        this.selectedFox = clickedFox;
        console.log("Aktuell gewählter Fuchs:", this.selectedFox.getName());
    }
}
