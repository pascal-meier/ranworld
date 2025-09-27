import {gW, gH} from "../../main.js";
import {textbox} from "../util/iHandleTextbox.js";
import {rngPoint} from "../rng/randomPoint.js";
import HitCounter from "../../gameobjects/counter/planetHitCounter.js";
import BackgroundHandler from "../util/iHandleBackground.js";
const COUNTER_API_URL = "https://r44pno55t2.execute-api.eu-central-1.amazonaws.com/api/counter";

export class Start extends Phaser.Scene
{
    constructor() {
        super({ key: 'Start' });
        this.hitCounter = null;
        this.background = new BackgroundHandler(this);
    }

    preload ()
    {
        this.load.image('logo', './assets/logo/600.png');
        this.load.image('blue', './assets/00-menu/particle_planet.png');
        this.background.preload();
    }

    create ()
    {
        //Hintergrund
        this.background.create();

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
            COUNTER_API_URL       //  API URL
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
            //this.hitCounter.incrementAndDisplay();
            let rndPoint = rngPoint(gW,gH);
            logo.x = rndPoint.x;
            logo.y = rndPoint.y;
            speedX = speedX * 1.1;
            speedY = speedY * 1.1;
            logo.setVelocity(speedX, speedY);
        });
    }

}