// src/games/riggedrace/objects/fox.ts

export class Fox extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private nameText: Phaser.GameObjects.Text;
  private speed: number;
  private luck: number;
  private isSelected: boolean = false;

  constructor(scene: Phaser.Scene, name: string, textureKey: string) {
    super(scene);

    this.speed = Phaser.Math.Between(60, 80);
    this.luck = Phaser.Math.Between(5, 10);

    // 🦊 Sprite hinzufügen
    this.sprite = scene.add.sprite(0, 0, textureKey).setOrigin(0.5);
    this.sprite.setScale(2);

    // 📛 Name darunter anzeigen
    this.nameText = scene.add.text(0, 40, name, {
      fontSize: "18px",
      color: "#ffffff",
    }).setOrigin(0.5);

    // Beide Objekte in Container hinzufügen
    this.add([this.sprite, this.nameText]);

    // Szene hinzufügen
    scene.add.existing(this);

    // Interaktivität
    this.setSize(this.sprite.width, this.sprite.height);
    this.setInteractive({ useHandCursor: true });

    this.on("pointerdown", () => this.onClick());
  }

  private onClick(): void {
    this.isSelected = !this.isSelected;

    this.sprite.setTint(this.isSelected ? 0xffcc00 : 0xffffff);

    // Optional: Ausgabe oder Szene-Event
    this.scene.events.emit("foxSelected", this);
  }

  public setPosition(x: number, y: number): this {
    super.setPosition(x, y);
    return this;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getLuck(): number {
    return this.luck;
  }

  public getName(): string {
    return this.nameText.text;
  }

  public setSelected(value: boolean): void {
    this.isSelected = value;
    this.sprite.setTint(value ? 0xffcc00 : 0xffffff);
  }

  public resetStats(): void {
  this.speed = Phaser.Math.Between(60, 80);
  this.luck = Phaser.Math.Between(5, 10);
  console.log(this.nameText.text + " " + this.speed + " " + this.luck);
}

}
