import { Button } from "../../../common/ui/Button.js";

export class RythmDrumGameScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumGameScene");
    }

    create() {
        const scene = this;
        const { width, height } = this.scale;

        // --- Initialwerte ---
        this.playerInput = [];
        this.isInputPhase = false;
        this.sequence = [1, 7, 5, 7, 6, 7, 1, 6, 5];

        // --- Statusanzeige ---
        this.statusTextContainer = this.add.container(width / 2, height / 2);
        const statusText = this.add.text(0, 0, "PLAY", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);
        this.statusTextContainer.add(statusText);
        this.statusTextContainer.setText = (newText) => statusText.setText(newText);

        // --- Drum Sprite ---
        const tongueDrum = this.add.image(width / 2, height / 2, "drum");
        tongueDrum.setInteractive();

        tongueDrum.on("pointerdown", (pointer) => {
            const x = pointer.x - tongueDrum.x;
            const y = pointer.y - tongueDrum.y;
            let angle = Phaser.Math.RadToDeg(Math.atan2(y, x));
            if (angle < 0) angle += 360;

            const numSegments = 8;
            const segmentSize = 360 / numSegments;
            const offset = segmentSize * 2.5;
            angle = (angle + 360 + offset) % 360;
            const segment = Math.floor(angle / segmentSize) + 1;

            // Sound & visuelles Feedback
            const soundKey = `sound${segment}`;
            const s = this.sound.add(soundKey);
            s.play();
            s.once("complete", () => s.destroy());
            tongueDrum.setTexture(`d${segment}`);
            this.statusTextContainer.setText(`${segment}`);

            // --- Eingabephase ---
            if (this.isInputPhase) {
                this.playerInput.push(segment);
                this.updatePlayerDisplay();

                const index = this.playerInput.length - 1;
                const correct = this.sequence[index] === segment;

                if (!correct) this.markInputIncorrect(index);

                if (this.playerInput.length === this.sequence.length) {
                    this.checkMelody();
                }
            }
        });

        // --- UI ---
        const backButton = new Button(this, width / 4, height * 0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });

        this.melodyText = this.add.text(width * 0.75, height * 0.1, "Score: 0/3", {
            fontSize: "24px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Spieleranzeige als Container
        this.inputDisplay = this.add.container(width / 2, height * 0.9);
        this.inputDisplay.setDepth(10);

        // --- Methoden für Anzeige & Überprüfung ---
        this.updatePlayerDisplay = function () {
            this.inputDisplay.removeAll(true);
            let x = 0;
            const spacing = 30;
            for (let i = 0; i < this.playerInput.length; i++) {
                const note = this.playerInput[i];
                const t = this.add.text(x, 0, `${note}`, {
                    fontSize: "28px",
                    color: "#ffffff",
                }).setOrigin(0.5);
                this.inputDisplay.add(t);
                x += spacing;
            }
        };

        this.markInputIncorrect = function (index) {
            this.inputDisplay.each((child) => child.setColor("#ffffff"));
            const wrong = this.inputDisplay.getAt(index);
            if (wrong) wrong.setColor("#ff0000");
        };

        this.checkMelody = function () {
            const correct = this.playerInput.every(
                (note, i) => note === this.sequence[i]
            );
            if (correct) {
                this.statusTextContainer.setText("🎉 Richtig!");
                this.melodyText.setText("Score: 1/3");
                this.sequence = [3, 7, 3, 7, 6, 7, 2, 5, 4];
            } else {
                this.statusTextContainer.setText("❌ Falsch!");
            }
            this.isInputPhase = false;
        };

        // --- Start Button ---
        const startButton = new Button(this, width / 2, height * 0.1, "Start", () => {
            startMelody(this);
        });

        // --- Melody Abspiel-Funktion ---
        function startMelody(scene) {

            const sequence = scene.sequence;
            const delay = 500; // feste Pause zwischen Tönen
            let index = 0;

            const playNext = () => {
                if (index >= sequence.length) {
                    if (scene.statusTextContainer)
                        scene.statusTextContainer.setText("Fertig!");
                    return;
                }

                const segment = sequence[index];
                const soundKey = `sound${segment}`;
                const melody = scene.sound.add(soundKey);
                melody.play();

                // UI-Feedback
                scene.statusTextContainer.setText(`Ton ${segment}`);
                tongueDrum.setTexture(`d${segment}`);

                index++;
                scene.time.delayedCall(delay, playNext, [], scene);
            };

            // Start der Wiedergabe
            playNext();

            // Nach der Wiedergabe → Eingabephase aktivieren
            scene.time.delayedCall(sequence.length * delay + 500, () => {
                scene.statusTextContainer.setText("Dein Zug!");
                scene.playerInput = [];
                scene.inputDisplay.removeAll(true);
                scene.isInputPhase = true;
            });
        }
    }
}
