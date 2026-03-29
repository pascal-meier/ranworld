import { BaseScene } from "./BaseScene.js";
import { soundGenerator } from "../audio/SoundGenerator.js";
import { ASSET_MANIFEST } from "../AssetManifest.js";

export class BootScene extends BaseScene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    // Standard Assets from Manifest
    ASSET_MANIFEST.atlases.forEach(asset => {
        this.load.atlas(asset.key, asset.path, asset.atlasJson);
    });

    ASSET_MANIFEST.images.forEach(asset => {
        this.load.image(asset.key, asset.path);
    });
  }

  create(): void {
    // Generate and cache synthetic audio
    this.cache.audio.add("sfx-click", soundGenerator.generateClickBuffer());
    this.cache.audio.add("sfx-confirm", soundGenerator.generateConfirmBuffer());
    this.cache.audio.add("sfx-hit", soundGenerator.generateHitBuffer());
    this.cache.audio.add("sfx-miss", soundGenerator.generateMissBuffer());
    this.cache.audio.add("sfx-block", soundGenerator.generateBlockBuffer());
    this.cache.audio.add("sfx-crit", soundGenerator.generateCritBuffer());
    this.cache.audio.add("sfx-reward", soundGenerator.generateRewardBuffer());
    this.cache.audio.add("amb-lab", soundGenerator.generateAmbientBuffer());

    this.scene.launch("OverlayScene");
    this.scene.start("TitleScene");
  }
}
