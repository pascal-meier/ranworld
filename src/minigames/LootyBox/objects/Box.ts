export class Box extends Phaser.GameObjects.Sprite {
  private readonly tier: number;
  private readonly closedFrame: number;
  private readonly openFrame: number;
  private boxScale: number;
  private readonly onClick: (box: Box) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, frame: number, tier: number, onClick: (box: Box) => void) {
    super(scene, x, y, "box", frame);
    this.tier = tier;
    this.closedFrame = frame;
    this.openFrame = frame + 1;
    this.boxScale = 3;
    this.onClick = onClick;

    this.setInteractive({ useHandCursor: true });
    this.setOrigin(0.5).setScale(this.boxScale);
    this.registerEvents();
    scene.add.existing(this);
  }

  private registerEvents(): void {
    this.on("pointerover", () => this.scene.tweens.add({ targets: this, scale: this.boxScale * 1.2, duration: 150 }));
    this.on("pointerout", () => this.scene.tweens.add({ targets: this, scale: this.boxScale, duration: 150 }));
    this.on("pointerdown", () => this.onClick(this));
  }

  open(): void {
    this.setFrame(this.openFrame);
    this.scene.tweens.add({
      targets: this,
      scale: this.boxScale * 1.4,
      yoyo: true,
      duration: 200,
      ease: "Back.Out",
    });
  }

  getTier(): number {
    return this.tier;
  }

  /**
   * Passt die Basis-Skalierung an, damit die Box auf unterschiedlichen Bildschirmgroessen sinnvoll wirkt.
   */
  setBaseScale(scale: number): void {
    this.boxScale = scale;
    this.setScale(this.boxScale);
  }
}
