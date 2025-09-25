// Phaser game configuration file
// This file exports a function that returns the Phaser game configuration object
import { Menu } from './js/scenes/menu.js';
import { Start } from './js/scenes/start.js';


const canvasHeight = document.getElementById("gameCanvas").height;
const canvasWidth = document.getElementById("gameCanvas").width;
export function getConfig () {
    return {
        type: Phaser.WEBGL,
        canvas: document.getElementById('gameCanvas'),
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: canvasWidth,
            height: canvasHeight
        },
        pixelArt: true,
        scene: [Start, Menu],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        }
    }
}