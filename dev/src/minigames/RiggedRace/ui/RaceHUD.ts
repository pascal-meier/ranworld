import { Button } from "../../../core/ui/Button.js";

interface RaceHudCallbacks {
  onStart: () => void;
  onBoost: () => void;
  onBack: () => void;
}

export class RaceHUD {
  private readonly scene: Phaser.Scene;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly fairnessText: Phaser.GameObjects.Text;
  private readonly selectionText: Phaser.GameObjects.Text;
  private readonly startButton: Button;
  private readonly boostButton: Button;
  private readonly backButton: Button;

  // ℹ️ Builds the headline, informational texts, and control buttons ℹ️
  constructor(scene: Phaser.Scene, callbacks: RaceHudCallbacks) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.titleText = scene.add
      .text(width / 2, height * 0.1, "Tap a runner to inspect", {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.selectionText = scene.add
      .text(width / 2, height * 0.16, "No runner selected", {
        fontSize: "20px",
        color: "#d8d8d8",
      })
      .setOrigin(0.5);

    this.fairnessText = scene.add
      .text(width / 2, height * 0.2, "Variance pulse ±0%", {
        fontSize: "18px",
        color: "#8bf0ff",
      })
      .setOrigin(0.5);

    this.startButton = new Button(scene, width * 0.2, height * 0.06, "Start", callbacks.onStart);
    this.boostButton = new Button(scene, width * 0.5, height * 0.06, "Boost (2)", callbacks.onBoost);
    this.backButton = new Button(scene, width * 0.8, height * 0.06, "Back", callbacks.onBack);
  }

  // ℹ️ Updates the headline text ℹ️
  setTitle(text: string): void {
    this.titleText.setText(text);
  }

  // ℹ️ Shows the currently selected runner plus their speed envelope ℹ️
  setSelectionSummary(name?: string, base?: number, variance?: number): void {
    if (!name || base === undefined || variance === undefined) {
      this.selectionText.setText("No runner selected");
      return;
    }

    this.selectionText.setText(`${name} · Base ${base}px/s · Variance ±${variance}px/s`);
  }

  // ℹ️ Displays the latest variance pulse description ℹ️
  setFairnessLabel(text: string): void {
    this.fairnessText.setText(text);
  }

  // ℹ️ Enables or disables the Boost button and updates its label ℹ️
  setBoostState(remaining: number, enabled: boolean): void {
    this.boostButton.setLabel(`Boost (${remaining})`);
    this.boostButton.setInteractionEnabled(enabled);
  }

  // ℹ️ Positions the HUD when the viewport changes ℹ️
  layout(width: number, height: number): void {
    const isPortrait = height > width;
    if (isPortrait) {
      this.titleText.setPosition(width / 2, height * 0.08);
      this.selectionText.setPosition(width / 2, height * 0.13);
      this.fairnessText.setPosition(width / 2, height * 0.18);
      const buttonYStart = height * 0.26;
      const buttonSpacing = height * 0.08;
      this.startButton.setPosition(width / 2, buttonYStart);
      this.boostButton.setPosition(width / 2, buttonYStart + buttonSpacing);
      this.backButton.setPosition(width / 2, buttonYStart + buttonSpacing * 2);
      return;
    }

    this.titleText.setPosition(width / 2, height * 0.1);
    this.selectionText.setPosition(width / 2, height * 0.16);
    this.fairnessText.setPosition(width / 2, height * 0.2);
    this.startButton.setPosition(width * 0.2, height * 0.08);
    this.boostButton.setPosition(width * 0.5, height * 0.08);
    this.backButton.setPosition(width * 0.8, height * 0.08);
  }
}
