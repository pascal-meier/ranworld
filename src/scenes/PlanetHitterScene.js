import {Button} from "../common/ui/Button.js";
import {rngPoint} from "../common/utils/RNGpoint.js";
import {qS, gH, gW, fontSizeXS, fontSizeS, fontSizeM} from "../config/constants.js";
import WebSocketClient from "../common/systems/WebSocketClient.js";

export class PlanetHitterScene extends Phaser.Scene {
    constructor() {
        super("PlanetHitterScene");  // Szenen-Key
    }

    preload() {
        // Lade hier alle Assets, die du für dein Intro brauchst, z. B. Planeten, Animationen, Musik
        this.load.image("planet", "public/assets/logo/100.png");
        this.load.image("particle", "public/assets/logo/particle_planet.png");
        //this.load.audio("intro-music", "assets/common/intro-music.mp3");
    }

    create() {
        this.scale.refresh();
        const { width, height } = this.scale;

        // Hintergrund
        const baseBG = this.add.image(width/2, height/2, "base-bg");
        baseBG.displayWidth=innerWidth;

        // z. B. ein Planet in der Mitte zeigen
        //Partikel
        const particles = this.add.particles(0, 0, 'particle', {
            speed: qS/6,
            scale: { start: (qS/550), end: 0 },
            blendMode: 'ADD'
        });

        //Logo
        const logo = this.physics.add.image(rngPoint(gW,gH).x, rngPoint(gW,gH).y, 'planet');
        logo.displayWidth = qS/5;
        logo.displayHeight = qS/5;
        let speedX = 50;
        let speedY = 100;
        logo.setVelocity(speedX, speedY);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);
        logo.setDepth(10);
        particles.startFollow(logo);

        // Interaktivität hinzufügen
        logo.setInteractive();
        logo.on('pointerdown', () => {
            //this.hitCounter.incrementAndDisplay();
            let rndPoint = rngPoint(gW,gH);
            logo.x = rndPoint.x;
            logo.y = rndPoint.y;
            speedX = speedX * 1.1;
            speedY = speedY * 1.1;
            logo.setVelocity(speedX, speedY);
            this.wsClient.send("incPcount");
            this.updateSpeed(logo);
        });

        // Speed-Anzeige
        this.add.text(gW*0.9, gH*0.1, "Speed:", {
            fontSize: `${fontSizeXS}px`,
            fill: '#ffffff',
            fontFamily: 'PokemonG1'
        }).setDepth(6).setOrigin(1,0);

        this.speedText = this.add.text(gW*0.9, gH*0.1+fontSizeS, "", {
            fontSize: `${fontSizeM}px`,
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        }).setDepth(6).setOrigin(1,0);

        this.updateSpeed(logo);

        // Button zum Musik starten
        // new Button(this, width / 2, height - 200, "Musik starten", () => {
        //     this.sound.play("intro-music", { loop: true, volume: 0.5 });
        // });

        // Button zur nächsten szene
        new Button(this, width / 2, height - 100, "Zum Menü", () => {
            this.scene.start("MainMenuScene");
        });

        // 🔹 PlanetHits-Anzeige Label
        this.add.text(gW*0.1, gH*0.1, "Hits:", {
            fontSize: `${fontSizeXS}px`,
            fill: '#ffffff',
            fontFamily: 'PokemonG1'
        }).setDepth(6);

        // 🔹 PlanetHits-Anzeige Wert
        this.hitsText = this.add.text(gW*0.1, gH*0.1 + fontSizeS, "load...", {
            fontSize: `${fontSizeM}px`,
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        }).setDepth(6);

        // WebSocket-Client
        this.wsClient = new WebSocketClient();

        // Callback für eingehende Nachrichten
        this.wsClient.connect((msg) => {
            console.log("🌐 WS Nachricht:", msg);

            // Wenn der Server die aktuelle Anzahl schickt
                if (msg.count !== undefined) {
                    this.hitsText.setText(String(msg.count));
                }

        });


        // Counter sofort abfragen
        this.time.delayedCall(100, () => {
            this.wsClient.send("getPcount");
        });

    }
    updateSpeed(logo){
        let speed = (logo.body.velocity.x/10)+(logo.body.velocity.y/10);
        this.speedText.setText(""+ speed.toFixed(0));
    }
}
