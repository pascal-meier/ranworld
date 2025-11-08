import { BootScene } from "../scenes/BootScene.js";
import { MainMenuScene } from "../scenes/MainMenuScene.js";
import { PlanetHitterScene } from "../scenes/PlanetHitterScene.js";
import LootyBoxScenes from "../minigames/LootyBox/index.js";
import RythmDrumScenes from "../minigames/RythmDrum/index.js";
import RiggedRaceScenes from "../minigames/RiggedRace/index.js";
import CantropyDrawScenes from "../minigames/CantropyDraw/index.js";
export const coreScenes = [BootScene, MainMenuScene, PlanetHitterScene];
export const miniGameScenes = [
    ...LootyBoxScenes,
    ...RythmDrumScenes,
    ...RiggedRaceScenes,
    ...CantropyDrawScenes,
];
const scenes = [...coreScenes, ...miniGameScenes];
export default scenes;
