import config from "./config/phaserConfig.js";
import { BootScene } from "./scenes/BootScene.js";
import { PlanetHitterScene } from "./scenes/PlanetHitterScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";


// Minigames importieren
import RanByrinth from "./minigames/ranbyrinth/index.js";
import RanChess from "./minigames/ranchess/index.js";
import RanCards from "./minigames/rancards/index.js";

config.scene = [
        BootScene,
        PlanetHitterScene,
        MainMenuScene,
    ...RanByrinth,
    ...RanChess,
    ...RanCards
    ];

new Phaser.Game(config);
