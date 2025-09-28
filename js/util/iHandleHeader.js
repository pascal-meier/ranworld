export default class HeaderHandler{

    constructor(scene){
        this.scene = scene;
    }

    preload(){
        console.log("--- Loading header:", this.scene.scene.key);
    }

    create(){

    }
}