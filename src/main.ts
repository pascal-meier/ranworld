// src/main.ts
import config from "./config/phaserConfig.js";

// Hauptszenen
import { BootScene } from "./scenes/BootScene.js";
import { PlanetHitterScene } from "./scenes/PlanetHitterScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";

// Minigames (Arrays mit Scenes)
import LootyBox from "./minigames/LootyBox/index.js";
import RythmDrums from "./minigames/RythmDrum/index.js";
import RiggedRace from "./minigames/RiggedRace/index.js";

// ✅ Alle Szenen zusammenfassen
const scenes = [
  BootScene,
  PlanetHitterScene,
  MainMenuScene,
  ...LootyBox,
  ...RythmDrums,
  ...RiggedRace,
];

// ✅ Phaser starten
new Phaser.Game({
  ...config,
  scene: scenes,
});
