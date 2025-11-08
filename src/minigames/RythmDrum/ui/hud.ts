import { Button } from "../../../core/ui/Button.js"; // Pfad prüfen: ui -> common/ui

export default class HUD {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private statusText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;
    private inputDisplay: Phaser.GameObjects.Container;
    private centerNotesText: Phaser.GameObjects.Text;
    private startButton: Button;
    private backButton: Button;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const { width, height } = scene.scale;

        // Container über allem
        this.container = scene.add.container(0, 0).setDepth(100);

        // Status-Text (oben Mitte)
        this.statusText = scene.add.text(width / 2, height * 0.12, "Bereit?", {
            fontSize: "32px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.container.add(this.statusText);

        // Score (oben rechts)
        this.scoreText = scene.add.text(width * 0.85, height * 0.08, "Score: 0", {
            fontSize: "22px",
            color: "#ffffff"
        }).setOrigin(0.5);
        this.container.add(this.scoreText);

        // Spieler-Input-Anzeige (unten)
        this.inputDisplay = scene.add.container(width / 2, height * 0.88);
        this.container.add(this.inputDisplay);

        // Center note text (über Drum)
        this.centerNotesText = scene.add.text(width / 2, height / 2, "", {
            fontSize: "48px",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5).setAlpha(0);
        this.centerNotesText.setDepth(110);
        this.container.add(this.centerNotesText);

        // Buttons: Start & Back
        this.startButton = new Button(scene, width * 0.8, height * 0.15, "▶", () => {});
        this.backButton = new Button(scene, width * 0.12, height * 0.08, "←", () => {});

        this.container.add(this.startButton);
        this.container.add(this.backButton);
    }

    // --- Callbacks registration ---
    setStartCallback(cb: () => void): void {
        this.startButton.setCallback(cb);
    }

    setBackCallback(cb: () => void): void {
        this.backButton.setCallback(cb);
    }

    // Show/hide start button (useful while playing)
    setStartVisible(visible: boolean): void {
        this.startButton.setVisible(visible);
    }

    // --- Simple setters ---
    setStatus(text: string): void {
        this.statusText.setText(text);
    }

    setScore(n: number): void {
        this.scoreText.setText(`Score: ${n}`);
    }

    clearPlayerInput(): void {
        this.inputDisplay.removeAll(true);
    }

    // Show the player input bottom row
    showPlayerInput(playerArray: number[] = [], successArray: (boolean | undefined)[] = []): void {
        this.inputDisplay.removeAll(true);

        const spacing = 40;
        let x = -((playerArray.length - 1) * spacing) / 2;

        for (let i = 0; i < playerArray.length; i++) {
            const note = playerArray[i];
            const ok = successArray[i];
            const color =
                ok === undefined ? "#ffffff" : ok ? "#ffffff" : "#ff5555";

            const t = this.scene.add.text(x, 0, `${note}`, {
                fontSize: "28px",
                color,
                fontStyle: "bold"
            }).setOrigin(0.5);
            this.inputDisplay.add(t);
            x += spacing;
        }
    }

    // Show a center note with a short pop animation
    showCenterNote(note?: number): void {
        if (note === undefined || note === null) {
            this.centerNotesText.setAlpha(0);
            return;
        }

        this.centerNotesText.setText(`${note}`);
        this.centerNotesText.setAlpha(1);
        this.centerNotesText.setScale(0.85);

        this.scene.tweens.killTweensOf(this.centerNotesText);

        this.scene.tweens.add({
            targets: this.centerNotesText,
            scale: { from: 1.2, to: 1 },
            ease: "Back.out",
            duration: 200
        });

        this.scene.tweens.add({
            targets: this.centerNotesText,
            alpha: { from: 1, to: 0.75 },
            duration: 700,
            delay: 150,
            ease: "Quad.easeOut"
        });
    }

    // Enable or disable HUD interactions
    setInteractive(enabled: boolean): void {
        this.startButton.setInteractive(enabled);
        this.backButton.setInteractive(enabled);
    }
}

