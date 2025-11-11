export class LootEffect {
  static spawn(scene: Phaser.Scene, box: Phaser.GameObjects.Sprite, color: string) {
    if (!scene.textures.exists("open-particles")) return;
    const tint = Phaser.Display.Color.HexStringToColor(color).color;
    const particles = scene.add.particles(0, 0, "open-particles", {
      x: box.x,
      y: box.y,
      speed: { min: -200, max: 800 },
      lifespan: 1800,
      scale: { start: 0.08, end: 0 },
      quantity: 5,
      tint,
      blendMode: "ADD",
    });
    scene.time.delayedCall(800, () => particles.destroy());
  }
}
