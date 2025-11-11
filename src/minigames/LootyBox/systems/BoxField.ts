import { Box } from "../objects/Box.js";

interface BoxFieldConfig {
  onSelect: (box: Box) => void;
  frames?: number[];
}

/**
 * ℹ️ Manages spawning, layout, and interactivity of all boxes in the LootyBox minigame. ℹ️
 */
export class BoxField {
  private boxes: Box[] = [];
  private oddsTexts: Phaser.GameObjects.Text[] = [];

  /**
   * ℹ️ Stores the scene context plus configuration for future spawns. ℹ️
   */
  constructor(private scene: Phaser.Scene, private config: BoxFieldConfig) {}

  /**
   * ℹ️ Recreates every box sprite according to the configured frames. ℹ️
   */
  spawn(): void {
    this.destroyBoxes();
    const frames = this.config.frames ?? [0, 2, 4];
    const { width, height } = this.scene.scale;
    this.boxes = frames.map(
      (frame, index) =>
        new Box(
          this.scene,
          width / 2,
          height / 2,
          frame,
          index + 1,
          (box) => this.config.onSelect(box)
        )
    );
    this.layout();
  }

  /**
   * ℹ️ Recomputes box positions and scales for the provided viewport size. ℹ️
   */
  layout(width = this.scene.scale.gameSize.width, height = this.scene.scale.gameSize.height): void {
    if (!this.boxes.length) return;
    const spacing = Math.min(width * 0.25, 250);
    const centerY = height * 0.55;
    const baseScale = Phaser.Math.Clamp(Math.min(width, height) / 260, 1.4, 3.2);
    const middleIndex = (this.boxes.length - 1) / 2;

    this.boxes.forEach((box, index) => {
      const offset = (index - middleIndex) * spacing;
      box.setPosition(width / 2 + offset, centerY);
      box.setBaseScale(baseScale);
      const oddsText = this.oddsTexts[index];
      if (oddsText) this.positionOddsText(box, oddsText);
    });
  }

  /**
   * ℹ️ Enables or disables pointer interactivity for all boxes at once. ℹ️
   */
  setInteractivity(enabled: boolean): void {
    this.boxes.forEach((box) => {
      if (enabled) {
        box.setInteractive({ useHandCursor: true });
      } else {
        box.disableInteractive();
      }
    });
  }

  /**
   * ℹ️ Removes all boxes from the scene immediately. ℹ️
   */
  clear(): void {
    this.destroyBoxes();
  }

  /**
   * ℹ️ Shows odds labels beneath each box using the provided formatter. ℹ️
   */
  showOdds(formatLabel: (tier: number) => string): void {
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
  hideOdds(): void {
    this.oddsTexts.forEach((text) => text.setVisible(false));
  }

  /**
   * ℹ️ Destroys the tracked box instances and clears the registry. ℹ️
   */
  private destroyBoxes(): void {
    this.boxes.forEach((box) => box.destroy());
    this.boxes = [];
    this.oddsTexts.forEach((text) => text.destroy());
    this.oddsTexts = [];
  }

  private getOrCreateOddsText(index: number): Phaser.GameObjects.Text {
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

  private positionOddsText(box: Box, text: Phaser.GameObjects.Text): void {
    const offset = box.displayHeight / 2 + 28;
    text.setPosition(box.x, box.y + offset);
  }
}
