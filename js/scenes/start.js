import {gW, gH} from "../../main.js";
import {textbox} from "../util/iHandleTextbox.js";
import {rngPoint} from "../rng/randomPoint.js";
import HitCounter from "../../gameobjects/start/planetHitCounter.js";
import BackgroundHandler from "../util/iHandleBackground.js";
import GameHandler from "../util/iHandleGame.js";

export class Start extends Phaser.Scene
{
    constructor() {
        super({ key: 'Start' });

        this.background = new BackgroundHandler(this);
        this.gameBox = new GameHandler(this);
    }

    preload ()
    {
        this.background.preload();
        this.gameBox.preload();
    }

    create ()
    {
        //Hintergrund
        this.background.create();
        //Game
        this.gameBox.create();

        //Textbox
        textbox(this, "PRESS THE PLANET");
    }

}