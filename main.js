import {getUserSystemInfo} from "./js/util/IgiveDeviceInfo.js";

const canvasHeight = document.getElementById("gameCanvas").height;
const canvasWidth = document.getElementById("gameCanvas").width;


class Example extends Phaser.Scene
{
    preload ()
    {
        //this.load.setBaseURL('https://labs.phaser.io');

        this.load.image('sky', './assets/00-menu/background-planet.png');
        this.load.image('logo', './assets/logo/600.png');
        this.load.image('blue', './assets/00-menu/particle_planet.png');
    }

    create ()
    {
        const sky = this.add.image(gW/2, gH/1.5, 'sky');
        sky.displayWidth = gW;
        sky.displayHeight = gH/2;
        //sky.height = game.scale.height;

        const particles = this.add.particles(0, 0, 'blue', {
            speed: gH/5,
            scale: { start: (gW/300), end: 0 },
            blendMode: 'ADD'
        });

        const logo = this.physics.add.image(gW/2, gH/2, 'logo');

        logo.displayWidth = gW/3;
        logo.displayHeight = gW/3;

        logo.setVelocity(50, 100);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        particles.startFollow(logo);

        console.log(getUserSystemInfo(this));
    }
}



const config = {
    type: Phaser.WEBGL,
    canvas: document.getElementById('gameCanvas'),
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: canvasWidth,
        height: canvasHeight
    },
    pixelArt: true,
    scene: Example,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    }
};

const game = new Phaser.Game(config);
const gW = game.scale.width;
const gH = game.scale.height;