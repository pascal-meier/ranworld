const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 60;
const DEFAULT_FONT_SIZE = 24;

const MENU_TEXTURE_KEY = "ui_button_menu";
const BACK_TEXTURE_KEY = "ui_button_back";
const NORMAL_TINT = 0xffffff;
const HOVER_TINT = 0xf0f0f0;



export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private clickCallback?: () => void;
  private buttonWidth = DEFAULT_WIDTH;
  private buttonHeight = DEFAULT_HEIGHT;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback?: () => void,
  ) {
    super(scene, x, y);
    this.clickCallback = callback;

    const textureKey = this.isBackLabel(text) ? BACK_TEXTURE_KEY : MENU_TEXTURE_KEY;
    this.background = scene.add.image(0, 0, textureKey).setOrigin(0.5);

    this.label = scene.add
      .text(0, 0, text, {
        fontSize: `${DEFAULT_FONT_SIZE}px`,
        fontFamily: "Ranworldfont01",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add([this.background, this.label]);
    scene.add.existing(this);

    this.setButtonSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
    this.setNormalState();

    this.background
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.setHoverState())
      .on("pointerout", () => this.setNormalState())
      .on("pointerdown", () => this.handleClick());
  }

  private handleClick(): void {
    this.scene.tweens.add({
      targets: this,
      scale: { from: 0.95, to: 1 },
      duration: 120,
      ease: "Quad.easeOut",
    });

    this.clickCallback?.();
  }

  private setHoverState(): void {
    this.background.setTint(HOVER_TINT);
  }

  private setNormalState(): void {
    this.background.setTint(NORMAL_TINT);
  }

  private isBackLabel(text: string): boolean {
    return text.trim().toLowerCase() === "back";
  }

  public setCallback(callback: () => void): void {
    this.clickCallback = callback;
  }

  public setLabel(text: string): void {
    this.label.setText(text);
    // update background when label switches between back/menu
    const textureKey = this.isBackLabel(text) ? BACK_TEXTURE_KEY : MENU_TEXTURE_KEY;
    if (this.background.texture.key !== textureKey) {
      this.background.setTexture(textureKey);
    }
  }

  public setFontSize(size: number): void {
    this.label.setFontSize(size);
  }

  public setButtonSize(width: number, height: number): void {
    this.buttonWidth = width;
    this.buttonHeight = height;
    this.background.setDisplaySize(width, height);
    this.setSize(width, height);
  }

  public getButtonSize(): { width: number; height: number } {
    return { width: this.buttonWidth, height: this.buttonHeight };
  }

  public setInteractionEnabled(enabled: boolean): void {
    if (enabled) {
      this.background.setInteractive({ useHandCursor: true });
      this.alpha = 1;
      this.setNormalState();
      return;
    }

    this.background.disableInteractive();
    this.alpha = 0.5;
    this.setNormalState();
  }
}

