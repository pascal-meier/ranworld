import {gW,gH} from "../../main.js";

export default class BackgroundHandler{

    constructor(scene){
        this.scene = scene;
    }

    preload(){
        let key = this.scene.scene.key;
        console.log("Loading background for scene:", key);
        this.scene.load.image('bg-img',`../../assets/backgrounds/${key}.png`);
    }

    create(){
        const sky = this.scene.add.image(gW/2, gH/1.5, 'bg-img');
        sky.displayWidth = gW;
        sky.displayHeight = gH/2;
    }
}