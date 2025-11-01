export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MainMenuScene" });
    }
    preload() {
        // Beispiel: UI-Grafiken laden (wenn du sie hast)
        // this.load.image("button-bg", "assets/common/ui/button-bg.png");
    }
    create() {
        const { width, height } = this.scale;
        // 🖼️ Hintergrundbild
        const baseBG = this.add.image(width / 2, height / 2, "base-bg");
        baseBG.setDisplaySize(width, height); // skaliert sauber statt innerWidth
        baseBG.setOrigin(0.5);
        // 🧭 Titel
        this.add
            .text(width / 2, height * 0.15, "RanWorld", {
            fontSize: "48px",
            color: "#ffffff",
            fontFamily: "Arial",
        })
            .setOrigin(0.5);
        // 🕹️ Buttons
        const spacing = 100;
        let startY = height * 0.4;
        this.createMenuButton(width / 2, startY, "LootyBox", () => {
            this.scene.start("LootyBoxBootScene");
        });
        startY += spacing;
        this.createMenuButton(width / 2, startY, "RythmDrum", () => {
            this.scene.start("RythmDrumBootScene");
        });
    }
    /**
     * Erstellt einen einfachen Text-Button mit Hover- und Click-Effekten
     */
    createMenuButton(x, y, text, callback) {
        // Wenn du eine eigene Button-Klasse nutzt:
        // new Button(this, x, y, text, callback);
        // Alternativ einfacher Text-Button:
        const bg = this.add.rectangle(x, y, 250, 60, 0xffffff, 0.1).setInteractive();
        const label = this.add
            .text(x, y, text, {
            fontSize: "24px",
            color: "#ffffff",
            fontFamily: "Arial",
        })
            .setOrigin(0.5);
        // Hover-Effekte
        bg.on("pointerover", () => bg.setFillStyle(0xffffff, 0.25));
        bg.on("pointerout", () => bg.setFillStyle(0xffffff, 0.1));
        bg.on("pointerdown", callback);
    }
}
