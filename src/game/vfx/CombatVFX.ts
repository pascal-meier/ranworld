export class CombatVFX {
  constructor(private scene: Phaser.Scene) {}

  public playHit(x: number, y: number, isCritical = false): void {
    const color = isCritical ? 0xffcc00 : 0xff4f3a;
    const count = isCritical ? 30 : 15;
    const speed = isCritical ? 300 : 200;

    // Spark Particles
    const particles = this.scene.add.particles(x, y, "ui-icons", {
        frame: "icon-research",
        scale: { start: 0.15, end: 0 },
        speed: speed,
        lifespan: 400,
        blendMode: "ADD",
        tint: color,
        quantity: count,
        emitting: false
    });
    particles.explode();
    this.scene.time.delayedCall(500, () => particles.destroy());

    // Flash Text
    this.playTextPopup(x, y - 40, isCritical ? "CRITICAL!" : "HIT!", color);

    // Camera Shake
    this.scene.cameras.main.shake(isCritical ? 150 : 80, isCritical ? 0.008 : 0.003);
  }

  public playBlock(x: number, y: number): void {
    const color = 0x8ce5c2;
    
    // Shield Flash
    const shield = this.scene.add.circle(x, y, 40, color, 0.4);
    this.scene.tweens.add({
        targets: shield,
        scale: 1.5,
        alpha: 0,
        duration: 300,
        ease: "Cubic.out",
        onComplete: () => shield.destroy()
    });

    this.playTextPopup(x, y - 40, "BLOCKED", color);
  }

  public playMiss(x: number, y: number): void {
    this.playTextPopup(x, y - 40, "MISS", 0xaaaaaa);
  }

  private playTextPopup(x: number, y: number, text: string, color: number): void {
    const txt = this.scene.add.text(x, y, text, {
        fontFamily: "'Outfit', sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        stroke: "#000000",
        strokeThickness: 3
    }).setOrigin(0.5);

    this.scene.tweens.add({
        targets: txt,
        y: y - 60,
        x: x + (Math.random() * 40 - 20),
        scale: { start: 0.5, to: 1.2 },
        alpha: { start: 1, to: 0 },
        duration: 1000,
        ease: "Back.easeOut",
        onComplete: () => txt.destroy()
    });
  }
}
