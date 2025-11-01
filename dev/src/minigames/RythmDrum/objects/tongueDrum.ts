// src/minigames/RythmDrum/objects/tongueDrum.ts
export default class TongueDrum extends Phaser.GameObjects.Image {
  private numSegments: number;
  private offset: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string = "drum"
  ) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    this.setInteractive();

    // Anzahl der Segmente (8 für 8 Sounds)
    this.numSegments = 8;

    // Optionale Rotation des Segments (Feinjustierung)
    this.offset = (360 / this.numSegments) * 2.5;

    // Event Listener
    this.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const segment = this.getSegmentFromPointer(pointer);
      if ((scene as any).onNotePlayed) {
        (scene as any).onNotePlayed(segment);
      }
    });
  }

  private getSegmentFromPointer(pointer: Phaser.Input.Pointer): number {
    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;

    let angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
    if (angle < 0) angle += 360;

    // Optionaler Offset, um visuell korrekt zu treffen
    angle = (angle + this.offset) % 360;

    const segment = Math.floor(angle / (360 / this.numSegments)) + 1;
    return segment;
  }

  flash(segment: number): void {
    // Kurzes visuelles Feedback beim Antippen
    this.setTint(0xffcc00);
    this.setTexture(`d${segment}`);
    this.scene.time.delayedCall(300, () => {
      this.clearTint();
      this.setTexture("drum");
    });
  }

  failFlash(): void {
    // Rot aufleuchten bei Fehler
    this.scene.tweens.add({
      targets: this,
      tint: 0xff3333,
      duration: 250,
    });
  }

  winFlash(): void {
    // Grün aufleuchten bei Erfolg
    this.scene.tweens.add({
      targets: this,
      tint: 0x33ff33,
      duration: 250,
    });
  }
}
