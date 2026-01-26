import type { Button as ButtonType } from "../../../core/ui/Button";
import { Button as ButtonRuntime } from "../../../core/ui/Button.js";
import { InputDisplay } from "./InputDisplay.js";
import { HUDLayout } from "./HUDLayout.js";
import { clampValue, createText, getChanceColor } from "./hudUtils.js";

// HUD handles all on-screen UI for the rhythm drum minigame.
// Layout and font sizes are recalculated in `resize` so everything
// stays readable on different resolutions and orientations.
export default class HUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private phaseTitleText: Phaser.GameObjects.Text;
  private phaseDetailText: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private phaseProgressText: Phaser.GameObjects.Text;
  private chanceText: Phaser.GameObjects.Text;
  private inputDisplay: InputDisplay;
  private centerNotesText: Phaser.GameObjects.Text;
  private startButton: ButtonType;
  private backButton: ButtonType;
  private layout: HUDLayout;
  private startState: "ready" | "playing" | "locked" | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;
    this.layout = new HUDLayout();

    this.container = scene.add.container(0, 0).setDepth(100);

    this.phaseTitleText = createText(scene, width / 2, height * 0.05, "Phase", {
      fontSize: "30px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    this.container.add(this.phaseTitleText);

    this.phaseDetailText = createText(scene, width / 2, height * 0.08, "", {
      fontSize: "18px",
      color: "#c5c5c5",
    });
    this.container.add(this.phaseDetailText);

    this.statusText = createText(scene, width / 2, height * 0.14, "Ready?", {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    this.container.add(this.statusText);

    this.scoreText = createText(scene, width * 0.85, height * 0.08, "Score: 0", {
      fontSize: "22px",
      color: "#ffffff",
    });
    this.container.add(this.scoreText);

    this.phaseProgressText = createText(scene, width * 0.85, height * 0.12, "Round 0/0", {
      fontSize: "18px",
      color: "#c5c5c5",
    });
    this.container.add(this.phaseProgressText);

    this.chanceText = createText(scene, width * 0.85, height * 0.16, "Chance: 0%", {
      fontSize: "18px",
      color: "#6befa8",
    });
    this.container.add(this.chanceText);

    this.inputDisplay = new InputDisplay(scene, width / 2, height * 0.88);
    this.container.add(this.inputDisplay.getContainer());

    this.centerNotesText = createText(scene, width / 2, height / 2, "", {
      fontSize: "48px",
      color: "#ffffff",
      align: "center",
    }).setAlpha(0);
    this.centerNotesText.setDepth(110);
    this.container.add(this.centerNotesText);

    this.startButton = new ButtonRuntime(scene, width * 0.8, height * 0.2, "Start Round", () => {});
    this.backButton = new ButtonRuntime(scene, width * 0.12, height * 0.08, "Back", () => {});

    this.container.add(this.startButton);
    this.container.add(this.backButton);

    this.resize(width, height);
  }

  setStartCallback(cb: () => void): void {
    this.startButton.setCallback(cb);
  }

  setBackCallback(cb: () => void): void {
    this.backButton.setCallback(cb);
  }

  // Recalculate layout and font sizes whenever the game viewport changes.
  // Uses a dedicated layout helper so HUD stays focused on behavior.
  resize(width: number, height: number): void {
    this.layout.apply(
      {
        backButton: this.backButton,
        startButton: this.startButton,
        phaseTitleText: this.phaseTitleText,
        phaseDetailText: this.phaseDetailText,
        statusText: this.statusText,
        scoreText: this.scoreText,
        phaseProgressText: this.phaseProgressText,
        chanceText: this.chanceText,
        inputDisplay: this.inputDisplay,
      },
      width,
      height,
    );
  }

  setStartVisible(visible: boolean): void {
    this.startButton.setVisible(visible);
  }

  setStartEnabled(enabled: boolean): void {
    this.startButton.setInteractionEnabled(enabled);
  }

  setStartState(state: "ready" | "playing" | "locked"): void {
    if (state === this.startState) return;
    this.startState = state;

    if (state === "ready") {
      this.startButton.setLabel("Start Round");
      this.startButton.setTintColors(0xffffff, 0xf0f0f0);
      this.startButton.setLabelColor("#ffffff");
      this.startButton.setInteractionEnabled(true);
      return;
    }

    if (state === "playing") {
      this.startButton.setLabel("Playing...");
      this.startButton.setTintColors(0xbebebe, 0xdcdcdc);
      this.startButton.setLabelColor("#f5f5f5");
      this.startButton.setInteractionEnabled(false);
      return;
    }

    this.startButton.setLabel("Please wait");
    this.startButton.setTintColors(0x999999, 0xb0b0b0);
    this.startButton.setLabelColor("#f5f5f5");
    this.startButton.setInteractionEnabled(false);
  }

  setStatus(text: string): void {
    this.statusText.setText(text);
  }

  setPhaseInfo(title: string, detail: string = ""): void {
    this.phaseTitleText.setText(title);
    this.phaseDetailText.setText(detail);
  }

  setPhaseProgress(current: number, total: number | string): void {
    this.phaseProgressText.setText(`Round ${current}/${total}`);
  }

  setChanceInfo(label: string, intensity: number = 0): void {
    this.chanceText.setText(label);
    this.chanceText.setColor(getChanceColor(intensity));
  }

  setScore(n: number): void {
    this.scoreText.setText(`Score: ${n}`);
  }

  clearPlayerInput(): void {
    this.inputDisplay.clear();
  }

  // Draw the player's input sequence at the bottom of the screen.
  // Spacing and font size come from the responsive values computed in layout.
  showPlayerInput(
    playerArray: number[] = [],
    successArray: (boolean | undefined)[] = [],
  ): void {
    this.inputDisplay.render(playerArray, successArray);
  }

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

  setInteractive(enabled: boolean): void {
    this.startButton.setInteractionEnabled(enabled);
    this.backButton.setInteractionEnabled(enabled);
  }

  flashPhaseChange(title: string): void {
    this.phaseTitleText.setText(title);
    this.scene.tweens.add({
      targets: this.phaseTitleText,
      scale: { from: 1.15, to: 1 },
      duration: 220,
      ease: "Back.easeOut",
    });
  }

  // Keep the center note label aligned with the drum overlay and scale
  // its font relative to the drum diameter so it matches the circle size.
  syncDrumOverlay(x: number, y: number, diameter: number): void {
    this.centerNotesText.setPosition(x, y);
    const overlayFont = clampValue(diameter * 0.14, 12, 32);
    this.centerNotesText.setStyle({ fontSize: `${overlayFont}px` });
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.centerNotesText);
    this.inputDisplay.destroy();
    this.container.destroy(true);
  }
}
