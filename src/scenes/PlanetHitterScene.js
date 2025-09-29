import {Button} from "../common/ui/Button.js";

export class PlanetHitterScene extends Phaser.Scene {
    constructor() {
        super("PlanetHitterScene");  // Szenen-Key
    }

    preload() {
        // Lade hier alle Assets, die du für dein Intro brauchst, z. B. Planeten, Animationen, Musik
        this.load.image("planet", "assets/logo/100.png");
        //this.load.audio("intro-music", "assets/common/intro-music.mp3");
    }

    create() {
        const { width, height } = this.scale;

        // Hintergrund
        this.add.image(width/2, height/2, "base-bg");

        // z. B. ein Planet in der Mitte zeigen
        this.add.image(width/2, height/2, "planet");


        // Button zum Musik starten
        // new Button(this, width / 2, height - 200, "Musik starten", () => {
        //     this.sound.play("intro-music", { loop: true, volume: 0.5 });
        // });

        // Button zur nächsten szene
        new Button(this, width / 2, height - 100, "Zum Menü", () => {
            this.scene.start("MainMenuScene");
        });


    }
}
