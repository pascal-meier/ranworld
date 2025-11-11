import { Box } from "../objects/Box.js";
/**
 * ℹ️ Manages spawning, layout, and interactivity of all boxes in the LootyBox minigame. ℹ️
 */
export class BoxField {
    scene;
    config;
    boxes = [];
    oddsTexts = [];
    /**
     * ℹ️ Stores the scene context plus configuration for future spawns. ℹ️
     */
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
    }
    /**
     * ℹ️ Recreates every box sprite according to the configured frames. ℹ️
     */
    spawn() {
        this.destroyBoxes();
        const frames = this.config.frames ?? [0, 2, 4];
        const { width, height } = this.scene.scale;
        this.boxes = frames.map((frame, index) => new Box(this.scene, width / 2, height / 2, frame, index + 1, (box) => this.config.onSelect(box)));
        this.layout();
    }
    /**
     * ℹ️ Recomputes box positions and scales for the provided viewport size. ℹ️
     */
    layout(width = this.scene.scale.gameSize.width, height = this.scene.scale.gameSize.height) {
        if (!this.boxes.length)
            return;
        const spacing = Math.min(width * 0.25, 250);
        const centerY = height * 0.55;
        const baseScale = Phaser.Math.Clamp(Math.min(width, height) / 260, 1.4, 3.2);
        const middleIndex = (this.boxes.length - 1) / 2;
        this.boxes.forEach((box, index) => {
            const offset = (index - middleIndex) * spacing;
            box.setPosition(width / 2 + offset, centerY);
            box.setBaseScale(baseScale);
            const oddsText = this.oddsTexts[index];
            if (oddsText)
                this.positionOddsText(box, oddsText);
        });
    }
    /**
     * ℹ️ Enables or disables pointer interactivity for all boxes at once. ℹ️
     */
    setInteractivity(enabled) {
        this.boxes.forEach((box) => {
            if (enabled) {
                box.setInteractive({ useHandCursor: true });
            }
            else {
                box.disableInteractive();
            }
        });
    }
    /**
     * ℹ️ Removes all boxes from the scene immediately. ℹ️
     */
    clear() {
        this.destroyBoxes();
    }
    /**
     * ℹ️ Shows odds labels beneath each box using the provided formatter. ℹ️
     */
    showOdds(formatLabel) {
        this.boxes.forEach((box, index) => {
            const oddsText = this.getOrCreateOddsText(index);
            oddsText.setText(formatLabel(box.getTier()));
            oddsText.setVisible(true);
            this.positionOddsText(box, oddsText);
        });
    }
    /**
     * ℹ️ Hides all box odds labels without destroying them. ℹ️
     */
    hideOdds() {
        this.oddsTexts.forEach((text) => text.setVisible(false));
    }
    /**
     * ℹ️ Destroys the tracked box instances and clears the registry. ℹ️
     */
    destroyBoxes() {
        this.boxes.forEach((box) => box.destroy());
        this.boxes = [];
        this.oddsTexts.forEach((text) => text.destroy());
        this.oddsTexts = [];
    }
    getOrCreateOddsText(index) {
        if (!this.oddsTexts[index]) {
            const text = this.scene.add
                .text(0, 0, "", {
                fontSize: "16px",
                color: "#ffe7a0",
                fontFamily: "Ranworldfont01",
                align: "center",
                wordWrap: { width: 220 },
            })
                .setOrigin(0.5, 0);
            text.setVisible(false);
            this.oddsTexts[index] = text;
        }
        return this.oddsTexts[index];
    }
    positionOddsText(box, text) {
        const offset = box.displayHeight / 2 + 28;
        text.setPosition(box.x, box.y + offset);
    }
}
