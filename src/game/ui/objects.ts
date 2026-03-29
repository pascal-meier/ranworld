import { LAB_THEME, textStyle } from "./theme.js";
import { makeNineSlice, makeRectangle, makeText } from "./display.js";
import "./components/index.js";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiPanel(x: number, y: number, width: number, height: number, fill?: number, border?: number): UIPanel;
      uiButton(config: UIButtonConfig): UIButton;
      uiTag(x: number, y: number, label: string, fill?: number): UITag;
      uiInfoCard(x: number, y: number, width: number, height: number, title: string, body: string | string[], titleColor?: string, fill?: number): UIInfoCard;
      
      // New Composite Components (Declared here for centralized discovery)
      uiPlanetCard(x: number, y: number, width: number, height: number): import("./components/PlanetCard.js").UIPlanetCard;
      uiCombatActor(x: number, y: number, width: number, height: number, title: string, titleColor: string, isPlayer: boolean): import("./components/CombatActorView.js").UICombatActor;
      uiRewardCard(x: number, y: number, width: number, height: number): import("./components/RewardCard.js").UIRewardCard;
      uiEventChoice(x: number, y: number, width: number, height: number): import("./components/EventChoice.js").UIEventChoice;
      uiStatBar(x: number, y: number, width: number, height: number): import("./components/StatBar.js").UIStatBar;
      uiResourceBar(x: number, y: number, width: number, height: number): import("./components/ResourceBar.js").UIResourceBar;
    }
  }
}

export interface UIButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  detail?: string;
  onClick: () => void;
  iconKey?: string;
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
    
    // Check if we should use the new pixel art panel
    const useTexture = scene.textures.exists("panel-main") && fill === LAB_THEME.panel;
    let background: Phaser.GameObjects.GameObject;
    
    if (useTexture) {
      // NineSlice: 256x256 image with 48px borders for the sci-fi frame
      background = makeNineSlice(scene, 0, 0, "panel-main", width, height, 48, 48, 48, 48, null);
    } else {
      background = makeRectangle(scene, 0, 0, width, height, fill, 0.97, null).setStrokeStyle(2, border, 1);
    }

    super(scene, x, y, [shadow, background]);
    
    // Add original stylistic elements if not using the texture
    if (!useTexture) {
      const topStripe = makeRectangle(scene, 2, 2, width - 4, 8, LAB_THEME.panelLine, 1, null);
      const cornerA = makeRectangle(scene, 0, 0, 8, 8, border, 1, null);
      const cornerB = makeRectangle(scene, width - 8, 0, 8, 8, border, 1, null);
      const cornerC = makeRectangle(scene, 0, height - 8, 8, 8, border, 1, null);
      const cornerD = makeRectangle(scene, width - 8, height - 8, 8, 8, border, 1, null);
      this.add([topStripe, cornerA, cornerB, cornerC, cornerD]);
    }
  }
}

export class UIButton extends Phaser.GameObjects.Container {
  public label: Phaser.GameObjects.Text;
  public detail?: Phaser.GameObjects.Text;
  private onHoverExtra?: () => void;
  private onOutExtra?: () => void;
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
    
    // Check if we should use the new pixel art button
    const useTexture = scene.textures.exists("button-primary") && !disabled;
    let background: Phaser.GameObjects.NineSlice | Phaser.GameObjects.Rectangle;
    
    if (useTexture) {
         // NineSlice for button. 256x64 image with 16px borders.
         background = makeNineSlice(scene, 0, 0, "button-primary", config.width, config.height, 16, 16, 16, 16, null);
    } else {
        background = makeRectangle(scene, 0, 0, config.width, config.height, idleFill, 1, null).setStrokeStyle(2, idleBorder, 1);
    }
    
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
    
    const labelObj = makeText(
      scene,
      localContentX,
      localLabelY,
      config.label,
      textStyle(labelSize, labelColor, "left", config.width - 28 - accentWidth),
      null
    ).setLineSpacing(-2);

    const children: Phaser.GameObjects.GameObject[] = [shadow, background, accentBar, labelObj];
    
    if (useTexture) {
        accentBar.setVisible(false);
    }

    let detailObj: Phaser.GameObjects.Text | undefined;
    if (showDetail) {
      detailObj = makeText(
        scene,
        localContentX,
        localDetailY,
        config.detail ?? "",
        textStyle(detailSize, detailColor, "left", config.width - 28 - accentWidth),
        null
      ).setLineSpacing(-2);
      children.push(detailObj);
    }

    if (config.iconKey && scene.textures.exists(config.iconKey)) {
      const icon = scene.add.image(config.width / 2, 38, config.iconKey).setOrigin(0.5);
      icon.setScale(Math.min(0.6, 60 / icon.height));
      children.push(icon);

      // Shift label down to accommodate icon
      labelObj.setY(68).setOrigin(0.5, 0).setX(config.width / 2);
      labelObj.setStyle({ align: "center" });
      if (detailObj) {
        detailObj.setY(82).setOrigin(0.5, 0).setX(config.width / 2);
        detailObj.setWordWrapWidth(config.width - 20).setStyle({ align: "center" });
      }
    }

    super(scene, config.x, config.y, children);
    
    this.label = labelObj;
    this.detail = detailObj;

    if (disabled) {
      this.setAlpha(0.7);
      return;
    }

    background.setInteractive({ useHandCursor: true });
    background.on("pointerover", () => {
      if (useTexture && scene.textures.exists("button-hover")) {
          (background as Phaser.GameObjects.NineSlice).setTexture("button-hover");
      } else {
          (background as Phaser.GameObjects.Rectangle).setFillStyle(config.fill ?? 0x22455a, 1);
          (background as Phaser.GameObjects.Rectangle).setStrokeStyle(2, LAB_THEME.accentFill, 1);
      }
      if (this.onHoverExtra) this.onHoverExtra();
    });
    background.on("pointerout", () => {
      if (useTexture) {
          (background as Phaser.GameObjects.NineSlice).setTexture("button-primary");
      } else {
          (background as Phaser.GameObjects.Rectangle).setFillStyle(idleFill, 1);
          (background as Phaser.GameObjects.Rectangle).setStrokeStyle(2, idleBorder, 1);
      }
      if (this.onOutExtra) this.onOutExtra();
    });
    background.on("pointerdown", () => {
        scene.sound.play("sfx-click");
        config.onClick();
    });
  }

  public setHoverExtras(onHover: () => void, onOut: () => void): this {
    this.onHoverExtra = onHover;
    this.onOutExtra = onOut;
    return this;
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

// Register factories
Phaser.GameObjects.GameObjectFactory.register("uiPanel", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number, fill?: number, border?: number) {
  const obj = new UIPanel(this.scene, x, y, width, height, fill, border);
  this.displayList.add(obj);
  return obj;
});

Phaser.GameObjects.GameObjectFactory.register("uiButton", function (this: Phaser.GameObjects.GameObjectFactory, config: UIButtonConfig) {
  const obj = new UIButton(this.scene, config);
  this.displayList.add(obj);
  return obj;
});

Phaser.GameObjects.GameObjectFactory.register("uiTag", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, label: string, fill?: number) {
  const obj = new UITag(this.scene, x, y, label, fill);
  this.displayList.add(obj);
  return obj;
});

Phaser.GameObjects.GameObjectFactory.register("uiInfoCard", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number, title: string, body: string | string[], titleColor?: string, fill?: number) {
  const obj = new UIInfoCard(this.scene, x, y, width, height, title, body, titleColor, fill);
  this.displayList.add(obj);
  return obj;
});
