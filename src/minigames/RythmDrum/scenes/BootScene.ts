export class RythmDrumBootScene extends Phaser.Scene {
  constructor() {
    super("RythmDrumBootScene");
  }

  preload(): void {
    // 🔹 Hier könnten später gemeinsame Assets geladen werden (z. B. ein Lade-Logo)
  }

  create(): void {
    // 🔹 Weiter zur Preload-Szene
    this.scene.start("RythmDrumPreloadScene");
  }
}
