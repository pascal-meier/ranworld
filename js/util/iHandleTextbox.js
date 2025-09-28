import {gH, gW} from "../../main.js";

export default class TextboxHandler{
    constructor(scene, text){
        this.scene = scene;
        this.text = text;
    }

    preload(){
        console.log("--- Loading textbox:", this.scene.scene.key);
    }

    create(){
           this.box = this.scene.add.text(gW/2, gH/2, this.text, {
                fontFamily: 'PokemonG1',
                fontSize: '24px',
                color: '#ffffff',
                padding: { x: 10, y: 10 },
                align: 'center',
                wordWrap: { width: gW - 40 }
            }).setOrigin(0.5, 0.5);

    }
}
