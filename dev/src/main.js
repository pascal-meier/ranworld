import config from "./config/phaserConfig.js";
import { BootScene } from "./scenes/BootScene.js";
import { PlanetHitterScene } from "./scenes/PlanetHitterScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { whoAmI } from "./common/utils/WhoAmI.js"


// Minigames importieren
import RanByrinth from "./minigames/ranbyrinth/index.js";
import RanChess from "./minigames/ranchess/index.js";
import LootyBox from "./minigames/LootyBox/index.js";
import RythmDrums from "./minigames/RythmDrum/index.js";

config.scene = [
        BootScene,
        PlanetHitterScene,
        MainMenuScene,
    ...RanByrinth,
    ...RanChess,
    ...LootyBox,
    ...RythmDrums
    ];

new Phaser.Game(config);
whoAmI();
