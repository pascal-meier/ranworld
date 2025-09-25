import {gW, gH} from "../../main.js";
import {textbox} from "../util/iHandleTextbox.js";
import {getUserSystemInfo} from "../util/IgiveDeviceInfo.js";
import {rngPoint} from "../rng/randomPoint.js";
export class Menu extends Phaser.Scene
{
    constructor() {
        super({ key: 'Menu' });
    }

    preload ()
    {
        //this.load.setBaseURL('https://labs.phaser.io');

        this.load.image('blue', './assets/00-menu/background-planet.png');
        this.load.image('logo', './assets/logo/600.png');
        this.load.image('sky', './assets/00-menu/particle_planet.png');
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
            scale: { start: (gW/300), end: 0 },
            blendMode: 'ADD'
        });
        //Logo
        const logo = this.physics.add.image(rngPoint(gW,gH).x, rngPoint(gW,gH).y, 'logo');
        logo.displayWidth = gW/3;
        logo.displayHeight = gW/3;
        logo.setVelocity(50, 100);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        particles.startFollow(logo);

        logo.setInteractive();
        logo.on('pointerdown', () => {
            this.scene.start('Start');
        });
    }
}