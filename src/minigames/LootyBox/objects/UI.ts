import { Button } from "../../../core/ui/Button.js";
import type { TransparencyPhaseDefinition } from "../systems/PhaseManager.js";

export class LootyBoxUi {
  private titleText: Phaser.GameObjects.Text;
  private scoreLabel: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private backButton: Button;
  private phaseTitle: Phaser.GameObjects.Text;
  private phaseDescription: Phaser.GameObjects.Text;
  private phaseDetail: Phaser.GameObjects.Text;
  private transparencyButton: Button;

  /**
   * ℹ️ Creates the LootyBox HUD including title, score, and transparency controls. ℹ️
   */
  constructor(
    private scene: Phaser.Scene,
    private goalScore: number,
    private onTransparencyToggle: () => void = () => {}
  ) {
    const { width, height } = scene.scale;
    this.titleText = scene.add
      .text(width / 2, height * 0.18, `Reach ${goalScore}`, {
        fontSize: "32px",
        color: "#fff",
        fontFamily: "Ranworldfont01",
      })
      .setOrigin(0.5);

    this.scoreLabel = scene.add
      .text(width * 0.7, height * 0.1, "Score:", {
        fontSize: "32px",
        color: "#fff",
        fontFamily: "Ranworldfont01",
      })
      .setOrigin(1, 0.5);

    this.scoreText = scene.add
      .text(width * 0.8, height * 0.1, "0", {
        fontSize: "32px",
        color: "#fff",
        fontFamily: "Ranworldfont01",
      })
      .setOrigin(0, 0.5);

    this.phaseTitle = scene.add
      .text(width / 2, height * 0.32, "Phase 1 - Mystery Odds", {
        fontSize: "24px",
        color: "#ffe7a0",
        fontFamily: "Ranworldfont01",
      })
      .setOrigin(0.5);

    this.phaseDescription = scene.add
      .text(width / 2, height * 0.38, "Only the outcome is visible.", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "Ranworldfont01",
        align: "center",
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5);

    this.phaseDetail = scene.add
      .text(width / 2, height * 0.48, "", {
        fontSize: "18px",
        color: "#d5f6ff",
        fontFamily: "Ranworldfont01",
        align: "center",
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5);

    this.backButton = new Button(scene, width / 4, height * 0.1, "Back", () =>
      scene.scene.start("MainMenuScene")
    );

    this.transparencyButton = new Button(
      scene,
      width * 0.8,
      height * 0.85,
      "Change Phase",
      () => this.onTransparencyToggle()
    );

    scene.scale.on("resize", this.handleResize, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off("resize", this.handleResize, this);
    });
    this.handleResize(scene.scale.gameSize);
  }

  /**
   * ℹ️ Updates the numeric score display. ℹ️
   */
  updateScore(score: number): void {
    this.scoreText.setText(score.toString());
  }

  /**
   * ℹ️ Changes the main HUD title text. ℹ️
   */
  updateTitle(text: string): void {
    this.titleText.setText(text);
  }

  /**
   * ℹ️ Shows the current transparency phase name and description. ℹ️
   */
  setPhaseInfo(definition: TransparencyPhaseDefinition): void {
    this.phaseTitle.setText(definition.title);
    this.phaseDescription.setText(definition.description);
  }

  /**
   * ℹ️ Writes the phase-specific detail text below the description. ℹ️
   */
  setPhaseDetail(detail: string): void {
    this.phaseDetail.setText(detail);
  }

  /**
   * ℹ️ Reflows and rescales all HUD elements for responsive layouts. ℹ️
   */
  private handleResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    const shortestSide = Math.min(width, height);
    const titleFont = Phaser.Math.Clamp(shortestSide * 0.065, 24, 72);
    const hudFont = Phaser.Math.Clamp(shortestSide * 0.05, 18, 56);
    const descFont = Phaser.Math.Clamp(shortestSide * 0.035, 14, 36);
    const detailFont = Phaser.Math.Clamp(shortestSide * 0.032, 12, 32);
    const topPadding = Math.max(40, height * 0.08);
    const horizontalPadding = Math.max(24, width * 0.04);

    this.titleText.setFontSize(titleFont).setPosition(width / 2, height * 0.18);

    this.scoreText
      .setFontSize(hudFont)
      .setPosition(width - horizontalPadding, topPadding);

    const labelOffset = Math.max(80, shortestSide * 0.12);
    this.scoreLabel
      .setFontSize(hudFont)
      .setPosition(this.scoreText.x - labelOffset, topPadding);

    this.phaseTitle.setFontSize(descFont + 4).setPosition(width / 2, height * 0.32);
    this.phaseDescription
      .setFontSize(descFont)
      .setWordWrapWidth(width * 0.8)
      .setPosition(width / 2, height * 0.38);
    this.phaseDetail
      .setFontSize(detailFont)
      .setWordWrapWidth(width * 0.8)
      .setPosition(width / 2, height * 0.48);

    const buttonScale = Phaser.Math.Clamp(shortestSide / 800, 0.6, 1.25);
    this.backButton.setPosition(horizontalPadding, topPadding).setScale(buttonScale);
    this.transparencyButton
      .setPosition(width - horizontalPadding - 40, height - Math.max(40, height * 0.08))
      .setScale(buttonScale);
  }
}
