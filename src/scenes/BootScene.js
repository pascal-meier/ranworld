export class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Hier könntest du Dinge laden, die IMMER gebraucht werden
        // (z. B. Logos, Fonts, UI-Assets)
        this.load.image("base-bg", "assets/backgrounds/Start.png");
    }

    create() {
        // Ladebildschirm oder direkter Sprung
        // → zuerst Intro (PlanetHitter)
        this.scene.start("PlanetHitterScene");
    }
}
