import {Button} from "../../../common/ui/Button.js";

export class RythmDrumGameScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumGameScene");
    }

    create() {
        const { width, height } = this.scale;

        const tongueDrum = this.add.image(width / 2, height / 2, "drum");
        tongueDrum.setInteractive();

        tongueDrum.on("pointerdown", (pointer) => {
            const x = pointer.x - tongueDrum.x;
            const y = pointer.y - tongueDrum.y;

            let angle = Phaser.Math.RadToDeg(Math.atan2(y, x)); // -180 bis 180
            if (angle < 0) angle += 360; // 0–360 normalisieren

            const numSegments = 8;
            const segmentSize = 360 / numSegments;

            //Offset-Logik
            const offset = segmentSize*2.5;
            angle = (angle + 360 + offset) % 360;

            const segment = Math.floor(angle / segmentSize) + 1;

            console.log(`Segment: ${segment}`);
            console.log(`Segment: ${angle}`);

            this.statusTextContainer.setText(`${segment}`);

            tongueDrum.setTexture(`d${segment}`);

            // 🔊 Ton abspielen
            const soundKey = `sound${segment}`;
            this.sound.play(soundKey);

        });



        // Textcontainer mit Hilfsfunktion:
        this.statusTextContainer = this.add.container(width / 2, height / 2);

        const text = this.add.text(0, 0, "PLAY", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);

        this.statusTextContainer.add(text);

        // kleine Hilfsfunktion zum Ändern des Textes
        this.statusTextContainer.setText = function (newText) {
            text.setText(newText);
        };



        // Zurück ins Menü
        const backButton = new Button (this, width / 4, height*0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });
    }
}
