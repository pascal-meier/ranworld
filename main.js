import {getUserSystemInfo} from "./js/util/IgiveDeviceInfo.js";
import {textbox} from "./js/util/iHandleTextbox.js";
import {getConfig} from "./phaserConfig.js";




const config = getConfig();
console.log("--- main.js loaded", config);
const game = new Phaser.Game(config);



export const gW = game.scale.width;
export const gH = game.scale.height;