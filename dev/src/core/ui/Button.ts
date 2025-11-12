const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 60;
const NORMAL_FILL = 0x1e1e1e;
const NORMAL_ALPHA = 0.8;
const HOVER_FILL = 0x444444;
const HOVER_ALPHA = 1;
const STROKE_COLOR = 0xffffff;
const DEFAULT_FONT_SIZE = 24;

export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private clickCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback?: () => void
  ) {
    super(scene, x, y);
    this.clickCallback = callback;

    this.background = scene.add
      .rectangle(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT, NORMAL_FILL, NORMAL_ALPHA)
      .setStrokeStyle(2, STROKE_COLOR)
      .setOrigin(0.5);

    this.label = scene.add
      .text(0, 0, text, {
        fontSize: `${DEFAULT_FONT_SIZE}px`,
        fontFamily: "Ranworldfont01",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add([this.background, this.label]);
    scene.add.existing(this);
    this.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);

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
    this.background.setFillStyle(HOVER_FILL, HOVER_ALPHA);
  }

  private setNormalState(): void {
    this.background.setFillStyle(NORMAL_FILL, NORMAL_ALPHA);
  }

  public setCallback(callback: () => void): void {
    this.clickCallback = callback;
  }

  public setLabel(text: string): void {
    this.label.setText(text);
  }

  public setInteractionEnabled(enabled: boolean): void {
    if (enabled) {
      this.background.setInteractive({ useHandCursor: true });
      this.alpha = 1;
      return;
    }

    this.background.disableInteractive();
    this.alpha = 0.5;
  }
}
