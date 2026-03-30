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
    this.scene.launch("OverlayScene");
    this.scene.start("TitleScene");
  }
}
