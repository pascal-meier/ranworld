export class RythmDrumBootScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumBootScene");
    }
    preload() {
        // 🔹 Hier könnten später gemeinsame Assets geladen werden (z. B. ein Lade-Logo)
    }
    create() {
        // 🔹 Weiter zur Preload-Szene
        this.scene.start("RythmDrumPreloadScene");
    }
}
