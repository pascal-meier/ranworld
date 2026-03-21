import { LAB_THEME, textStyle } from "./theme.js";

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
    const shadow = scene.add
      .rectangle(x + 4, y + 4, width, height, LAB_THEME.panelShadow, 0.45)
      .setOrigin(0);

    const background = scene.add
      .rectangle(x, y, width, height, fill, 0.97)
      .setStrokeStyle(2, border, 1)
      .setOrigin(0);

    const topStripe = scene.add
      .rectangle(x + 2, y + 2, width - 4, 8, LAB_THEME.panelLine, 1)
      .setOrigin(0);

    const cornerA = scene.add.rectangle(x, y, 8, 8, border, 1).setOrigin(0);
    const cornerB = scene.add.rectangle(x + width - 8, y, 8, 8, border, 1).setOrigin(0);
    const cornerC = scene.add.rectangle(x, y + height - 8, 8, 8, border, 1).setOrigin(0);
    const cornerD = scene.add.rectangle(x + width - 8, y + height - 8, 8, 8, border, 1).setOrigin(0);

    super(scene, 0, 0, [shadow, background, topStripe, cornerA, cornerB, cornerC, cornerD]);
    scene.add.existing(this);
  }
}

export class UIButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, config: UIButtonConfig) {
    const compact = config.height <= 36;
    const medium = config.height > 36 && config.height <= 50;
    const showDetail = Boolean(config.detail) && !compact;
    const labelSize = compact ? 8 : medium ? 10 : 12;
    const detailSize = medium ? 7 : 8;
    const labelY = compact ? config.y + 9 : showDetail ? config.y + 6 : config.y + 10;
    const detailY = medium ? config.y + 23 : config.y + 25;
    const accentWidth = compact ? 5 : 6;
    const contentX = config.x + 18 + accentWidth;
    const idleFill = config.fill ?? LAB_THEME.panelAlt;
    const idleBorder = config.border ?? LAB_THEME.border;

    const shadow = scene.add
      .rectangle(config.x + 4, config.y + 4, config.width, config.height, LAB_THEME.panelShadow, 0.45)
      .setOrigin(0);

    const background = scene.add
      .rectangle(config.x, config.y, config.width, config.height, idleFill, 1)
      .setStrokeStyle(2, idleBorder, 1)
      .setOrigin(0);

    const accentBar = scene.add
      .rectangle(
        config.x + 6,
        config.y + 6,
        accentWidth,
        Math.max(10, config.height - 12),
        LAB_THEME.accentFill,
        1
      )
      .setOrigin(0);

    const label = scene.add
      .text(
        contentX,
        labelY,
        config.label,
        textStyle(labelSize, LAB_THEME.text, "left", config.width - 28 - accentWidth)
      )
      .setLineSpacing(-2)
      .setOrigin(0);

    const children: Phaser.GameObjects.GameObject[] = [shadow, background, accentBar, label];

    if (showDetail) {
      const detail = scene.add
        .text(
          contentX,
          detailY,
          config.detail ?? "",
          textStyle(detailSize, LAB_THEME.textMuted, "left", config.width - 28 - accentWidth)
        )
        .setLineSpacing(-2)
        .setOrigin(0);
      children.push(detail);
    }

    super(scene, 0, 0, children);
    scene.add.existing(this);

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
    const background = scene.add
      .rectangle(x, y, width, 22, fill, 1)
      .setStrokeStyle(1, LAB_THEME.borderSoft, 1)
      .setOrigin(0);
    const marker = scene.add.rectangle(x + 5, y + 5, 5, 12, LAB_THEME.accentFill, 1).setOrigin(0);
    const text = scene.add.text(x + 16, y + 4, label, textStyle(8)).setOrigin(0);

    super(scene, 0, 0, [background, marker, text]);
    scene.add.existing(this);
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
    const panel = new UIPanel(scene, x, y, width, height, fill);
    const titleText = scene.add.text(x + 12, y + 10, title, textStyle(9, titleColor)).setOrigin(0);
    const bodyCopy = Array.isArray(body) ? body.join("\n") : body;
    const bodyText = scene.add
      .text(x + 12, y + 28, bodyCopy, textStyle(8, LAB_THEME.text, "left", width - 24))
      .setLineSpacing(-2)
      .setOrigin(0);

    super(scene, 0, 0, [panel, titleText, bodyText]);
    scene.add.existing(this);
  }
}
