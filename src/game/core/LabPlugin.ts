import { LabStore } from "./LabStore.js";

export const LAB_PLUGIN_KEY = "LabPlugin";

export class LabPlugin extends Phaser.Plugins.BasePlugin {
  public readonly store = new LabStore();
}

export function getLabStore(scene: Phaser.Scene): LabStore {
  return (scene.plugins.get(LAB_PLUGIN_KEY) as LabPlugin).store;
}
