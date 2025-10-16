import config from "./config/phaserConfig.js";
import { BootScene } from "./scenes/BootScene.js";
import { PlanetHitterScene } from "./scenes/PlanetHitterScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";


// Minigames importieren
import RanByrinth from "./minigames/ranbyrinth/index.js";
import RanChess from "./minigames/ranchess/index.js";
import RanCards from "./minigames/rancards/index.js";
import RythmDrums from "./minigames/RythmDrum/index.js";

config.scene = [
        BootScene,
        PlanetHitterScene,
        MainMenuScene,
    ...RanByrinth,
    ...RanChess,
    ...RanCards,
    ...RythmDrums
    ];

new Phaser.Game(config);

