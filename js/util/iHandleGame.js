import gameStart from "../../gameobjects/start/game-Start.js";

export default class GameHandler{

    constructor(scene){
        this.scene = scene;
        this.gameScene = new gameStart(scene);
    }

    preload(){
        let key = this.scene.scene.key;
        console.log("--- Loading game:", key);
        this.gameScene.preload();
    }

    create(){
       this.gameScene.create();
    }
}