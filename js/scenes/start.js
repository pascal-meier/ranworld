import BackgroundHandler from "../util/iHandleBackground.js";
import GameHandler from "../util/iHandleGame.js";
import HeaderHandler from "../util/iHandleHeader.js";
import TextboxHandler from "../util/iHandleTextbox.js";

export class Start extends Phaser.Scene
{
    constructor() {
        super({ key: 'Start' });

        this.background = new BackgroundHandler(this);
        this.gameBox = new GameHandler(this);
        this.header = new HeaderHandler(this);
        this.textbox = new TextboxHandler(this, "Press Planet");
    }

    preload ()
    {
        this.background.preload();
        this.textbox.preload();
        this.gameBox.preload();
        this.header.preload();
    }

    create ()
    {
        //Hintergrund
        this.background.create();
        //Textbox
        this.textbox.create();
        //Game
        this.gameBox.create();
        //Header
        this.header.create();

    }

}