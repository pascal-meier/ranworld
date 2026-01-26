import type { Button } from "../../../core/ui/Button";
import { InputDisplay } from "./InputDisplay.js";
import { clampValue } from "./hudUtils.js";

interface HUDLayoutTargets {
  backButton: Button;
  startButton: Button;
  phaseTitleText: Phaser.GameObjects.Text;
  phaseDetailText: Phaser.GameObjects.Text;
  statusText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  phaseProgressText: Phaser.GameObjects.Text;
  chanceText: Phaser.GameObjects.Text;
  inputDisplay: InputDisplay;
}

interface LayoutNumbers {
  isPortrait: boolean;
  padding: number;
  titleFont: number;
  detailFont: number;
  statusFont: number;
  boardFont: number;
  chanceFont: number;
  inputFontSize: number;
  inputSpacing: number;
  startWidth: number;
  startHeight: number;
  startFont: number;
  backWidth: number;
  backHeight: number;
  backFont: number;
}

// Encapsulates HUD sizing and positioning to keep HUD lean.
export class HUDLayout {
  apply(targets: HUDLayoutTargets, width: number, height: number): void {
    const texts = [
      targets.phaseTitleText,
      targets.phaseDetailText,
      targets.statusText,
      targets.scoreText,
      targets.phaseProgressText,
      targets.chanceText,
    ];
    const hasDestroyedText = texts.some((t) => {
      if (!t || !t.scene) return true;
      const sys: any = (t.scene as any).sys;
      if (sys && sys.isDestroyed) return true;
      if (!t.frame) return true;
      const frameData = (t.frame as any).data;
      return frameData === null || frameData === undefined;
    });
    if (hasDestroyedText) {
      return;
    }

    const numbers = this.computeNumbers(width, height);
    const wrapWidth = Math.max(width - numbers.padding * 2, width * 0.6);

    targets.startButton.setButtonSize(numbers.startWidth, numbers.startHeight);
    targets.startButton.setFontSize(numbers.startFont);
    targets.backButton.setButtonSize(numbers.backWidth, numbers.backHeight);
    targets.backButton.setFontSize(numbers.backFont);

    const wrapStyle = { wordWrap: { width: wrapWidth, useAdvancedWrap: true }, align: "center" };

    targets.phaseTitleText.setStyle({ fontSize: `${numbers.titleFont}px`, fontStyle: "bold", ...wrapStyle });
    targets.phaseDetailText.setStyle({ fontSize: `${numbers.detailFont}px`, ...wrapStyle });
    targets.statusText.setStyle({ fontSize: `${numbers.statusFont}px`, fontStyle: "bold", ...wrapStyle });
    targets.scoreText.setStyle({ fontSize: `${numbers.boardFont}px`, ...wrapStyle });
    targets.phaseProgressText.setStyle({ fontSize: `${numbers.boardFont}px`, ...wrapStyle });
    targets.chanceText.setStyle({ fontSize: `${numbers.chanceFont}px`, ...wrapStyle });

    targets.inputDisplay.setMetrics(numbers.inputFontSize, numbers.inputSpacing);

    if (numbers.isPortrait) {
      this.layoutPortrait(targets, width, height, numbers);
    } else {
      this.layoutLandscape(targets, width, height, numbers);
    }
  }

  private computeNumbers(width: number, height: number): LayoutNumbers {
    const isPortrait = height >= width;
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const padding = Math.max(shortSide * 0.07, 14);

    const titleFont = clampValue(shortSide * 0.08, 18, 44);
    const detailFont = clampValue(shortSide * 0.05, 14, 26);
    const statusFont = clampValue(shortSide * 0.065, 18, 34);
    const boardFont = clampValue(shortSide * 0.045, 14, 24);
    const chanceFont = clampValue(shortSide * 0.042, 14, 22);
    const inputFontSize = clampValue(shortSide * 0.07, 20, 36);
    const inputSpacing = clampValue(inputFontSize * 1.05, 24, 64);

    const startWidth = Math.min(
      clampValue(longSide * (isPortrait ? 0.48 : 0.28), 200, 420),
      width - padding * 2,
    );
    const startHeight = clampValue(shortSide * 0.16, 54, 102);
    const startFont = clampValue(startHeight * 0.38, 18, 32);

    const backWidth = clampValue(width * 0.25, 120, 200);
    const backHeight = clampValue(startHeight * 0.55, 42, 80);
    const backFont = clampValue(backHeight * 0.48, 16, 24);

    return {
      isPortrait,
      padding,
      titleFont,
      detailFont,
      statusFont,
      boardFont,
      chanceFont,
      inputFontSize,
      inputSpacing,
      startWidth,
      startHeight,
      startFont,
      backWidth,
      backHeight,
      backFont,
    };
  }

  private layoutPortrait(
    targets: HUDLayoutTargets,
    width: number,
    height: number,
    numbers: LayoutNumbers,
  ): void {
    const { padding, backHeight, backWidth, startHeight } = numbers;
    const gapSmall = padding * 0.15;
    const gapMedium = padding * 0.25;

    const backY = padding + backHeight / 2;
    targets.backButton.setPosition(padding + backWidth / 2, backY);

    let cursorY = padding + backHeight + gapSmall;

    const titleH = this.textHeight(targets.phaseTitleText);
    targets.phaseTitleText.setPosition(width / 2, cursorY + titleH / 2);
    cursorY += titleH + gapSmall;

    const detailH = this.textHeight(targets.phaseDetailText);
    targets.phaseDetailText.setPosition(width / 2, cursorY + detailH / 2);
    cursorY += detailH + gapSmall;

    const statusH = this.textHeight(targets.statusText);
    targets.statusText.setPosition(width / 2, cursorY + statusH / 2);
    cursorY += statusH + gapMedium;

    const scoreH = this.textHeight(targets.scoreText);
    targets.scoreText.setOrigin(0.5).setPosition(width / 2, cursorY + scoreH / 2);
    cursorY += scoreH + gapSmall;

    const progressH = this.textHeight(targets.phaseProgressText);
    targets.phaseProgressText.setOrigin(0.5).setPosition(width / 2, cursorY + progressH / 2);
    cursorY += progressH + gapSmall;

    const chanceH = this.textHeight(targets.chanceText);
    targets.chanceText.setOrigin(0.5).setPosition(width / 2, cursorY + chanceH / 2);
    cursorY += chanceH + gapMedium;

    const inputY = height - padding * 1.8;
    targets.inputDisplay.setPosition(width / 2, inputY);

    const startMinY = cursorY + padding * 0.6 + startHeight * 0.5;
    const startMaxY = inputY - startHeight * 0.9;
    const startY = clampValue(startMinY, startMinY, Math.max(startMinY, startMaxY));
    targets.startButton.setPosition(width / 2, startY);
  }

  private layoutLandscape(
    targets: HUDLayoutTargets,
    width: number,
    height: number,
    numbers: LayoutNumbers,
  ): void {
    const { padding, titleFont, detailFont, statusFont, boardFont, backWidth, backHeight, startWidth, startHeight } =
      numbers;

    const gapSmall = padding * 0.12;
    const gapMedium = padding * 0.2;

    targets.backButton.setPosition(padding + backWidth / 2, padding + backHeight / 2);

    let cursorY = padding;

    const titleH = this.textHeight(targets.phaseTitleText);
    targets.phaseTitleText.setPosition(width / 2, cursorY + titleH / 2);
    cursorY += titleH + gapSmall;

    const detailH = this.textHeight(targets.phaseDetailText);
    targets.phaseDetailText.setPosition(width / 2, cursorY + detailH / 2);
    cursorY += detailH + gapSmall;

    const statusH = this.textHeight(targets.statusText);
    targets.statusText.setPosition(width / 2, cursorY + statusH / 2);
    cursorY += statusH + gapMedium;

    const boardX = width - padding;
    const scoreH = this.textHeight(targets.scoreText);
    targets.scoreText.setOrigin(1, 0.5).setPosition(boardX, padding + scoreH / 2);

    const progressH = this.textHeight(targets.phaseProgressText);
    targets.phaseProgressText
      .setOrigin(1, 0.5)
      .setPosition(boardX, padding + scoreH + gapSmall + progressH / 2);

    const chanceH = this.textHeight(targets.chanceText);
    targets.chanceText
      .setOrigin(1, 0.5)
      .setPosition(boardX, padding + scoreH + gapSmall + progressH + gapSmall + chanceH / 2);

    const startX = width - padding - startWidth / 2;
    const startY = height - padding - startHeight / 2;
    targets.startButton.setPosition(startX, startY);

    targets.inputDisplay.setPosition(width / 2, height - padding * 1.6);
  }

  private textHeight(text: Phaser.GameObjects.Text): number {
    const bounds = text.getBounds();
    return bounds.height;
  }
}
