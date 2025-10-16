import {Button} from "../../../common/ui/Button.js";

export class RythmDrumGameScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumGameScene");
    }

    create() {
        const scene = this; // wichtig: referenziere die Scene in inneren Funktionen
        const { width, height } = this.scale;

        // -----------------------
        // Status-Text-Container (vor den Events anlegen!)
        // -----------------------
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

        // -----------------------
        // Drum Sprite
        // -----------------------
        const tongueDrum = this.add.image(width / 2, height / 2, "drum");
        tongueDrum.setInteractive();

        // Anzahl der Segmente
        const numSegments = 8;
        const segmentSize = 360 / numSegments;
        // Offset (deine Logik, anpassbar)
        const offset = segmentSize * 2.5;

        tongueDrum.on("pointerdown", (pointer) => {
            const x = pointer.x - tongueDrum.x;
            const y = pointer.y - tongueDrum.y;

            let angle = Phaser.Math.RadToDeg(Math.atan2(y, x)); // -180 bis 180
            if (angle < 0) angle += 360; // 0–360 normalisieren

            angle = (angle + 360 + offset) % 360;

            const segment = Math.floor(angle / segmentSize) + 1;

            console.log(`Segment: ${segment}`);
            console.log(`Angle (normalized+offset): ${angle}`);

            // Update Text & Sprite
            if (this.statusTextContainer) this.statusTextContainer.setText(`${segment}`);
            tongueDrum.setTexture(`d${segment}`);

            // Play sound (neue Instanz und sofort abspielen)
            const soundKey = `sound${segment}`;
            const s = scene.sound.add(soundKey);
            s.play();
            // sauber aufräumen, wenn zu Ende
            s.once("complete", () => {
                s.destroy();
            });
        });

        // -----------------------
        // Buttons / UI
        // -----------------------
        // Zurück ins Menü
        const backButton = new Button (this, width / 4, height*0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });

        // Anzeige erfolgreiche Melodien
        this.melodyText = this.add.text(width*0.75, height*0.1, "Score: 0/3", {
            fontSize: "24px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Start-Button
        const startButton = new Button (this, width / 2, height*0.1, "Start", () => {
            console.log("Start Melody");
            startMelody(1);
        });

        // -----------------------
        // startMelody Funktion (benutzt `scene`)
        // -----------------------
        function startMelody(number) {
            console.log("Starting melody", number);

            // Sequenz (aus deinem Kommentar)
            const sequence = [1, 7, 5, 7, 6, 7, 1, 6, 5];

            // Optional: feste Verzögerung statt "wait for complete"
            // const delay = 500;

            let index = 0;

            const playNext = () => {
                if (index >= sequence.length) {
                    if (scene.statusTextContainer) scene.statusTextContainer.setText("Fertig!");
                    return;
                }

                const segment = sequence[index];
                const soundKey = `sound${segment}`;

                // Instanz erstellen und abspielen
                const melody = scene.sound.add(soundKey);
                melody.play();

                // Update UI (Text + z.B. Drum-Sprite)
                if (scene.statusTextContainer) scene.statusTextContainer.setText(`Ton ${segment}`);
                // optional: visuelles Feedback
                tongueDrum.setTexture(`d${segment}`);

                index++;

                // Warte bis Sound fertig ist, dann räume auf und spiele nächsten
                melody.once("complete", () => {
                    melody.destroy();
                    // kurze Frame-Delay optional, ansonsten direkt playNext()
                    // scene.time.delayedCall(100, playNext, [], scene);
                    playNext();
                });

                // Wenn du stattdessen eine feste Pause willst (unabhängig von Soundlänge):
                // scene.time.delayedCall(delay, playNext, [], scene);
            };

            // Starte Kette
            playNext();
        }
    }
}
