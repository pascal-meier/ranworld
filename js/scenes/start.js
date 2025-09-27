import {gW, gH} from "../../main.js";
import {textbox} from "../util/iHandleTextbox.js";
import {rngPoint} from "../rng/randomPoint.js";
import HitCounter from "../counter/planetHitCounter.js";

const COUNTER_API_URL = "https://r44pno55t2.execute-api.eu-central-1.amazonaws.com/api/counter";

export class Start extends Phaser.Scene
{
    constructor() {
        super({ key: 'Start' });
        this.hitCounter = null;
    }

    preload ()
    {
        //this.load.setBaseURL('https://labs.phaser.io');

        this.load.image('sky', './assets/00-menu/background-planet.png');
        this.load.image('logo', './assets/logo/600.png');
        this.load.image('blue', './assets/00-menu/particle_planet.png');
    }

    create ()
    {
        //Hintergrund
        const sky = this.add.image(gW/2, gH/1.5, 'sky');
        sky.displayWidth = gW;
        sky.displayHeight = gH/2;

        //Textbox
        textbox(this, "PRESS THE PLANET");

        //Partikel
        const particles = this.add.particles(0, 0, 'blue', {
            speed: gH/5,
            scale: { start: (gW/450), end: 0 },
            blendMode: 'ADD'
        });

        // Planet Hit Counter
        this.add.text(gW/10, gH/12, "Planet Hits:", {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        });

        this.hitCounter = new HitCounter(
            this,                 // Die aktuelle Szene
            gW/10,                   // X-Koordinate (z.B. links oben)
            gH/10,                   // Y-Koordinate
            COUNTER_API_URL       // Deine API URL
        );

        //Logo
        const logo = this.physics.add.image(rngPoint(gW,gH).x, rngPoint(gW,gH).y, 'logo');
        logo.displayWidth = gW/4;
        logo.displayHeight = gW/4;
        let speedX = 50;
        let speedY = 100;
        logo.setVelocity(speedX, speedY);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        particles.startFollow(logo);

        logo.setInteractive();
        logo.on('pointerdown', () => {
            this.hitCounter.incrementAndDisplay();
            let rndPoint = rngPoint(gW,gH);
            logo.x = rndPoint.x;
            logo.y = rndPoint.y;
            speedX = speedX * 1.1;
            speedY = speedY * 1.1;
            logo.setVelocity(speedX, speedY);
        });
    }

}