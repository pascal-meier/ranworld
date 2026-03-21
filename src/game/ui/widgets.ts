import { LAB_THEME } from "./theme.js";
import { UIButton, UIPanel, UITag, type UIButtonConfig } from "./objects.js";

export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill = LAB_THEME.panel,
  border = LAB_THEME.borderSoft
): Phaser.GameObjects.Container {
  return new UIPanel(scene, x, y, width, height, fill, border);
}

export function createButton(
  scene: Phaser.Scene,
  config: UIButtonConfig
): Phaser.GameObjects.Container {
  return new UIButton(scene, config);
}

export function createTag(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  fill = LAB_THEME.tag
): Phaser.GameObjects.Container {
  return new UITag(scene, x, y, label, fill);
}
