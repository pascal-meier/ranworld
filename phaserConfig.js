// Phaser game configuration file
// This file exports a function that returns the Phaser game configuration object
import { Menu } from './js/scenes/menu.js';
import { Start } from './js/scenes/start.js';


const canvasHeight = window.innerHeight;
const canvasWidth = window.innerWidth;
export function getConfig () {
    return {
        type: Phaser.WEBGL,
        canvas: document.getElementById('gameCanvas'),
        scale: {
            mode: Phaser.Scale.FIT,
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