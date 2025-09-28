import {gW,gH} from "../../main.js";

export default class BackgroundHandler{

    constructor(scene){
        this.scene = scene;
    }

    preload(){
        let key = this.scene.scene.key;
        console.log("--- Loading background:", key);
        this.scene.load.image('bg-img',`assets/backgrounds/${key}.png`);
    }

    create(){
        const bgImage = this.scene.add.image(gW/2, gH/1.5, 'bg-img');
        bgImage.displayWidth = gW;
        bgImage.displayHeight = gH/2;
    }
}