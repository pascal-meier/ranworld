import { LAB_THEME } from "./theme.js";
import { UIButton, UIPanel, UITag, type UIButtonConfig } from "./objects.js";
import { attachDisplayObject, type DisplayParent } from "./display.js";

export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill = LAB_THEME.panel,
  border = LAB_THEME.borderSoft,
  parent?: DisplayParent
): Phaser.GameObjects.Container {
  const panel = new UIPanel(scene, x, y, width, height, fill, border);
  return attachDisplayObject(scene, panel, parent);
}

export function createButton(
  scene: Phaser.Scene,
  config: UIButtonConfig,
  parent?: DisplayParent
): UIButton {
  const btn = new UIButton(scene, config);
  return attachDisplayObject(scene, btn, parent);
}

export function createTag(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  fill = LAB_THEME.tag,
  parent?: DisplayParent
): Phaser.GameObjects.Container {
  const tag = new UITag(scene, x, y, label, fill);
  return attachDisplayObject(scene, tag, parent);
}
