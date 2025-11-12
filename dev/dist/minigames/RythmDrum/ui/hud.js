import { Button } from "../../../core/ui/Button.js";
export default class HUD {
    scene;
    container;
    phaseTitleText;
    phaseDetailText;
    statusText;
    scoreText;
    phaseProgressText;
    chanceText;
    inputDisplay;
    centerNotesText;
    startButton;
    backButton;
    // ℹ️ Builds the HUD container, text labels, and control buttons ℹ️
    constructor(scene) {
        this.scene = scene;
        const { width, height } = scene.scale;
        this.container = scene.add.container(0, 0).setDepth(100);
        this.phaseTitleText = scene.add
            .text(width / 2, height * 0.05, "Phase", {
            fontSize: "30px",
            color: "#ffffff",
            fontStyle: "bold",
        })
            .setOrigin(0.5);
        this.container.add(this.phaseTitleText);
        this.phaseDetailText = scene.add
            .text(width / 2, height * 0.08, "", {
            fontSize: "18px",
            color: "#c5c5c5",
        })
            .setOrigin(0.5);
        this.container.add(this.phaseDetailText);
        this.statusText = scene.add
            .text(width / 2, height * 0.14, "Ready?", {
            fontSize: "32px",
            color: "#ffffff",
            fontStyle: "bold",
        })
            .setOrigin(0.5);
        this.container.add(this.statusText);
        this.scoreText = scene.add
            .text(width * 0.85, height * 0.08, "Score: 0", {
            fontSize: "22px",
            color: "#ffffff",
        })
            .setOrigin(0.5);
        this.container.add(this.scoreText);
        this.phaseProgressText = scene.add
            .text(width * 0.85, height * 0.12, "Round 0/0", {
            fontSize: "18px",
            color: "#c5c5c5",
        })
            .setOrigin(0.5);
        this.container.add(this.phaseProgressText);
        this.chanceText = scene.add
            .text(width * 0.85, height * 0.16, "Chance: 0%", {
            fontSize: "18px",
            color: "#6befa8",
        })
            .setOrigin(0.5);
        this.container.add(this.chanceText);
        this.inputDisplay = scene.add.container(width / 2, height * 0.88);
        this.container.add(this.inputDisplay);
        this.centerNotesText = scene.add
            .text(width / 2, height / 2, "", {
            fontSize: "48px",
            color: "#ffffff",
            align: "center",
        })
            .setOrigin(0.5)
            .setAlpha(0);
        this.centerNotesText.setDepth(110);
        this.container.add(this.centerNotesText);
        this.startButton = new Button(scene, width * 0.8, height * 0.2, "Start Round", () => { });
        this.backButton = new Button(scene, width * 0.12, height * 0.08, "Back", () => { });
        this.container.add(this.startButton);
        this.container.add(this.backButton);
    }
    // ℹ️ Hooks the provided handler to the start button ℹ️
    setStartCallback(cb) {
        this.startButton.setCallback(cb);
    }
    // ℹ️ Hooks the provided handler to the back button ℹ️
    setBackCallback(cb) {
        this.backButton.setCallback(cb);
    }
    // ℹ️ Shows or hides the start button depending on game state ℹ️
    setStartVisible(visible) {
        this.startButton.setVisible(visible);
    }
    // ℹ️ Enables or disables the start button to prevent double taps ℹ️
    setStartEnabled(enabled) {
        this.startButton.setInteractionEnabled(enabled);
    }
    // ℹ️ Updates the main status banner ℹ️
    setStatus(text) {
        this.statusText.setText(text);
    }
    // ℹ️ Shows the current phase title and descriptive line ℹ️
    setPhaseInfo(title, detail = "") {
        this.phaseTitleText.setText(title);
        this.phaseDetailText.setText(detail);
    }
    // ℹ️ Refreshes the round progress indicator ℹ️
    setPhaseProgress(current, total) {
        this.phaseProgressText.setText(`Round ${current}/${total}`);
    }
    // ℹ️ Updates the chance label text and color ℹ️
    setChanceInfo(label, intensity = 0) {
        this.chanceText.setText(label);
        this.chanceText.setColor(this.getChanceColor(intensity));
    }
    // ℹ️ Displays the player's current score ℹ️
    setScore(n) {
        this.scoreText.setText(`Score: ${n}`);
    }
    // ℹ️ Removes all note indicators from the input display ℹ️
    clearPlayerInput() {
        this.inputDisplay.removeAll(true);
    }
    // ℹ️ Draws each tapped note plus correctness coloring ℹ️
    showPlayerInput(playerArray = [], successArray = []) {
        this.inputDisplay.removeAll(true);
        const spacing = 40;
        let x = -((playerArray.length - 1) * spacing) / 2;
        for (let i = 0; i < playerArray.length; i++) {
            const note = playerArray[i];
            const ok = successArray[i];
            const color = ok === undefined ? "#ffffff" : ok ? "#ffffff" : "#ff5555";
            const t = this.scene.add
                .text(x, 0, `${note}`, {
                fontSize: "28px",
                color,
                fontStyle: "bold",
            })
                .setOrigin(0.5);
            this.inputDisplay.add(t);
            x += spacing;
        }
    }
    // ℹ️ Pops the current note in the center of the drum for emphasis ℹ️
    showCenterNote(note) {
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
            duration: 200,
        });
        this.scene.tweens.add({
            targets: this.centerNotesText,
            alpha: { from: 1, to: 0.75 },
            duration: 700,
            delay: 150,
            ease: "Quad.easeOut",
        });
    }
    // ℹ️ Toggles both HUD buttons' interactivity at once ℹ️
    setInteractive(enabled) {
        this.startButton.setInteractionEnabled(enabled);
        this.backButton.setInteractionEnabled(enabled);
    }
    // ℹ️ Animates the phase title to highlight transitions ℹ️
    flashPhaseChange(title) {
        this.phaseTitleText.setText(title);
        this.scene.tweens.add({
            targets: this.phaseTitleText,
            scale: { from: 1.15, to: 1 },
            duration: 220,
            ease: "Back.easeOut",
        });
    }
    // ℹ️ Converts chance intensity into a readable HUD color ℹ️
    getChanceColor(intensity) {
        if (intensity <= 0.2) {
            return "#6befa8";
        }
        if (intensity <= 0.5) {
            return "#ffd369";
        }
        return "#ff5c8d";
    }
}
