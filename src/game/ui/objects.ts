import { LAB_THEME, textStyle } from "./theme.js";
import { makeRectangle, makeText } from "./display.js";

export interface UIButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  detail?: string;
  onClick: () => void;
  fill?: number;
  border?: number;
  disabled?: boolean;
}

export class UIPanel extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    fill = LAB_THEME.panel,
    border = LAB_THEME.borderSoft
  ) {
    const shadow = makeRectangle(scene, 4, 4, width, height, LAB_THEME.panelShadow, 0.45, null);
    const background = makeRectangle(scene, 0, 0, width, height, fill, 0.97, null).setStrokeStyle(2, border, 1);
    const topStripe = makeRectangle(scene, 2, 2, width - 4, 8, LAB_THEME.panelLine, 1, null);
    const cornerA = makeRectangle(scene, 0, 0, 8, 8, border, 1, null);
    const cornerB = makeRectangle(scene, width - 8, 0, 8, 8, border, 1, null);
    const cornerC = makeRectangle(scene, 0, height - 8, 8, 8, border, 1, null);
    const cornerD = makeRectangle(scene, width - 8, height - 8, 8, 8, border, 1, null);

    super(scene, x, y, [shadow, background, topStripe, cornerA, cornerB, cornerC, cornerD]);
  }
}

export class UIButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, config: UIButtonConfig) {
    const disabled = Boolean(config.disabled);
    const compact = config.height <= 36;
    const medium = config.height > 36 && config.height <= 50;
    const showDetail = Boolean(config.detail) && !compact;
    const labelSize = compact ? 8 : medium ? 10 : 12;
    const detailSize = medium ? 7 : 8;
    const labelY = compact ? config.y + 9 : showDetail ? config.y + 6 : config.y + 10;
    const detailY = medium ? config.y + 23 : config.y + 25;
    const accentWidth = compact ? 5 : 6;
    const idleFill = disabled ? 0x24343d : config.fill ?? LAB_THEME.panelAlt;
    const idleBorder = disabled ? 0x4a5d69 : config.border ?? LAB_THEME.border;
    const accentFill = disabled ? 0x5d707d : LAB_THEME.accentFill;
    const labelColor = disabled ? LAB_THEME.textMuted : LAB_THEME.text;
    const detailColor = disabled ? "#78909d" : LAB_THEME.textMuted;
    const localContentX = 18 + accentWidth;
    const localLabelY = labelY - config.y;
    const localDetailY = detailY - config.y;

    const shadow = makeRectangle(scene, 4, 4, config.width, config.height, LAB_THEME.panelShadow, 0.45, null);
    const background = makeRectangle(scene, 0, 0, config.width, config.height, idleFill, 1, null).setStrokeStyle(2, idleBorder, 1);
    const accentBar = makeRectangle(
      scene,
      6,
      6,
      accentWidth,
      Math.max(10, config.height - 12),
      accentFill,
      1,
      null
    );
    const label = makeText(
      scene,
      localContentX,
      localLabelY,
      config.label,
      textStyle(labelSize, labelColor, "left", config.width - 28 - accentWidth),
      null
    ).setLineSpacing(-2);

    const children: Phaser.GameObjects.GameObject[] = [shadow, background, accentBar, label];

    if (showDetail) {
      const detail = makeText(
        scene,
        localContentX,
        localDetailY,
        config.detail ?? "",
        textStyle(detailSize, detailColor, "left", config.width - 28 - accentWidth),
        null
      ).setLineSpacing(-2);
      children.push(detail);
    }

    super(scene, config.x, config.y, children);

    if (disabled) {
      this.setAlpha(0.7);
      return;
    }

    background.setInteractive({ useHandCursor: true });
    background.on("pointerover", () => {
      background.setFillStyle(config.fill ?? 0x22455a, 1);
      background.setStrokeStyle(2, LAB_THEME.accentFill, 1);
    });
    background.on("pointerout", () => {
      background.setFillStyle(idleFill, 1);
      background.setStrokeStyle(2, idleBorder, 1);
    });
    background.on("pointerdown", config.onClick);
  }
}

export class UITag extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, label: string, fill = LAB_THEME.tag) {
    const width = Math.max(92, label.length * 8 + 24);
    const background = makeRectangle(scene, 0, 0, width, 22, fill, 1, null).setStrokeStyle(1, LAB_THEME.borderSoft, 1);
    const marker = makeRectangle(scene, 5, 5, 5, 12, LAB_THEME.accentFill, 1, null);
    const text = makeText(scene, 16, 4, label, textStyle(8), null);

    super(scene, x, y, [background, marker, text]);
  }
}

export class UIInfoCard extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    body: string | string[],
    titleColor = LAB_THEME.text,
    fill = LAB_THEME.panelAlt
  ) {
    const panel = new UIPanel(scene, 0, 0, width, height, fill);
    const titleText = makeText(scene, 12, 10, title, textStyle(9, titleColor), null);
    const bodyCopy = Array.isArray(body) ? body.join("\n") : body;
    const bodyText = makeText(scene, 12, 28, bodyCopy, textStyle(8, LAB_THEME.text, "left", width - 24), null).setLineSpacing(-2);

    super(scene, x, y, [panel, titleText, bodyText]);
  }
}
