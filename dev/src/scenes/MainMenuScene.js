import {Button} from "../common/ui/Button.js";

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("MainMenuScene");
    }

    preload() {
        // Beispiel: Button-Grafiken laden
        //this.load.image("button-bg", "assets/common/ui/button-bg.png");
    }

    create() {
        const { width, height } = this.scale;

        // Hintergrund
        const baseBG = this.add.image(width/2, height/2, "base-bg");
        baseBG.displayWidth=innerWidth;

        this.add.text(width / 2, 100, "RanWorld", {
            fontSize: "48px",
            color: "#ffffff",
            fontFamily: "Arial",
        }).setOrigin(0.5);

        // Buttons
        new Button(this, width / 2, 200, "RanByrinth", () => {
            this.scene.start("RanByrinthBootScene");
        });

        new Button(this, width / 2, 300, "RanChess", () => {
            this.scene.start("RanChessBootScene");
        });

        new Button(this, width / 2, 400, "RanCards", () => {
            this.scene.start("RanCardsBootScene");
        });

        new Button(this, width / 2, 500, "RythmDrum", () => {
            this.scene.start("RythmDrumBootScene");
        });
    }

    createButton(x, y, text, callback) {
        // Hintergrund
        const bg = this.add.image(x, y, "button-bg").setInteractive();
        bg.setDisplaySize(250, 60);

        // Text
        const label = this.add.text(x, y, text, {
            fontSize: "24px",
            color: "#000000",
            fontFamily: "Arial",
        }).setOrigin(0.5);

        // Events
        bg.on("pointerover", () => {
            bg.setTint(0xaaaaaa);
        });
        bg.on("pointerout", () => {
            bg.clearTint();
        });
        bg.on("pointerdown", () => {
            callback();
        });
    }
}
