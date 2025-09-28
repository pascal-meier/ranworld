import {gW,gH} from "../../main.js";
import HitCounter from "./planetHitCounter.js";
import {rngPoint} from "../../js/rng/randomPoint.js";
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
            speed: gH/5,
            scale: { start: (gW/450), end: 0 },
            blendMode: 'ADD'
        });

        // Planet Hit Counter
        this.scene.add.text(gW/10, gH/12, "Planet Hits:", {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        });
        this.scene.hitCounter = new HitCounter(
            this.scene,                 // Die aktuelle Szene
            gW/10,                   // X-Koordinate (z.B. links oben)
            gH/10,                   // Y-Koordinate
            COUNTER_API_URL       //  API URL
        );

        //Logo
        const logo = this.scene.physics.add.image(rngPoint(gW,gH).x, rngPoint(gW,gH).y, 'logo');
        logo.displayWidth = gW/4;
        logo.displayHeight = gW/4;
        let speedX = 50;
        let speedY = 100;
        logo.setVelocity(speedX, speedY);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);
        particles.startFollow(logo);

        // Speed-Anzeige vorbereiten
        this.speedText = this.scene.add.text(gW*0.9, gH/10, "Speed: 0", {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        });

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

        this.updateSpeed(logo);
    }
    updateSpeed(logo){
        let speed = (logo.body.velocity.x/10)+(logo.body.velocity.y/10);
        this.speedText.setText("Speed: "+ speed.toFixed(0));
    }
}