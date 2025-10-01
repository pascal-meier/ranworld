export class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Hier könntest du Dinge laden, die IMMER gebraucht werden
        // (z. B. Logos, Fonts, UI-Assets)
        this.load.image("base-bg", "public/assets/backgrounds/Start.png");
    }

    create() {
        // Resize-Handler definieren
        this.scene.start("PlanetHitterScene");
    }
}
