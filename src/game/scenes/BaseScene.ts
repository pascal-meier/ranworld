import { getLabStore } from "../core/LabPlugin.js";

export abstract class BaseScene extends Phaser.Scene {
  protected get lab() {
    return getLabStore(this);
  }
}
