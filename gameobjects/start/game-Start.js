import {gW,gH, qS, fontSizeS, fontSizeM, fontSizeL} from "../../main.js";
import HitCounter from "./planetHitCounter.js";
import {rngPoint} from "../../js/rng/randomPoint.js";
import {drawGPTButton} from "../template/GPT-Button.js";
const COUNTER_API_URL = "https://r44pno55t2.execute-api.eu-central-1.amazonaws.com/api/counter";

export default class gameStart {

    constructor(scene){
        this.scene = scene;
        this.hitCounter = null;
        this.speedText = null;
    }

    preload(){
        this.scene.load.image('logo', './assets/logo/600.png');
        this.scene.load.image('blue', './assets/00-menu/particle_planet.png');
    }

    create(){
        //Partikel
        const particles = this.scene.add.particles(0, 0, 'blue', {
            speed: qS/6,
            scale: { start: (qS/550), end: 0 },
            blendMode: 'ADD'
        });
        particles.setDepth(9);

        // Planet Hit Counter
        this.scene.add.text(gW*0.1, gH*0.1, "Planet Hits:", {
            fontSize: `${fontSizeS}px`,
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        });
        this.scene.hitCounter = new HitCounter(
            this.scene,                 // Die aktuelle Szene
            gW*0.1,                   // X-Koordinate (z.B. links oben)
            gH*0.1,                   // Y-Koordinate
            COUNTER_API_URL       //  API URL
        );

        //Logo
        const logo = this.scene.physics.add.image(rngPoint(gW,gH).x, rngPoint(gW,gH).y, 'logo');
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
            this.scene.hitCounter.incrementAndDisplay();
            let rndPoint = rngPoint(gW,gH);
            logo.x = rndPoint.x;
            logo.y = rndPoint.y;
            speedX = speedX * 1.1;
            speedY = speedY * 1.1;
            logo.setVelocity(speedX, speedY);
            this.updateSpeed(logo);
        });

        // Speed-Anzeige
        this.scene.add.text(gW*0.9, gH*0.1, "Speed:", {
            fontSize: `${fontSizeS}px`,
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        }).setDepth(6).setOrigin(0.5,0);

        this.speedText = this.scene.add.text(gW*0.9, gH*0.1+fontSizeS, "", {
            fontSize: `${fontSizeM}px`,
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        }).setDepth(6).setOrigin(0.5,0);

        this.updateSpeed(logo);

        // Start-Button
        //drawGPTButton(this.scene).setPosition(0,gH*0.4);
    }
    updateSpeed(logo){
        let speed = (logo.body.velocity.x/10)+(logo.body.velocity.y/10);
        this.speedText.setText(""+ speed.toFixed(0));
    }
}