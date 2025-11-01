export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }
    preload() {
        // 🖼️ Logos, Fonts, UI-Assets laden
        this.load.image("base-bg", "public/assets/backgrounds/Start.png");
    }
    create() {
        // 🔁 Optional: Resize-Handler (vorbereitet, falls du RESIZE-Mode nutzt)
        this.scale.on("resize", this.onResize, this);
        // 🚀 Starte nächste Szene
        this.scene.start("PlanetHitterScene");
    }
    /**
     * Wird aufgerufen, wenn sich die Fenstergröße ändert (bei RESIZE-Mode)
     */
    onResize(gameSize) {
        const { width, height } = gameSize;
        console.log(`New size: ${width}x${height}`);
        // Optional: Position oder UI anpassen
    }
}
