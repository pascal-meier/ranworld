import type { NodeKind } from "../types.js";
import { LAB_THEME, textStyle } from "./theme.js";
import { makeCircle, makeFrameImage, makeRectangle, makeText, type DisplayParent } from "./display.js";

function getNodeIconKey(kind: NodeKind): string | null {
  if (kind === "combat") {
    return "node-combat-symbol";
  }

  if (kind === "event") {
    return "node-event-symbol";
  }

  if (kind === "reward") {
    return "node-reward-symbol";
  }

  if (kind === "flee") {
    return "node-flee-symbol";
  }

  return null;
}

export function renderTutorialNodeIcon(
  scene: Phaser.Scene,
  kind: NodeKind,
  x: number,
  y: number,
  parent: DisplayParent
): void {
  makeCircle(scene, x, y, 18, 0x1d4d6c, 0.35, parent);

  if (scene.textures.exists("ui-icons")) {
    makeFrameImage(scene, x, y, "ui-icons", "icon-seed", parent).setDisplaySize(28, 28);
  }

  if (kind === "boss" && scene.textures.exists("ui-icons")) {
    makeFrameImage(scene, x - 5, y, "ui-icons", "node-combat-symbol", parent)
      .setDisplaySize(16, 16)
      .setFlipX(true)
      .setAngle(-32)
      .setTint(0xe9f4ff);
    makeFrameImage(scene, x + 5, y, "ui-icons", "node-combat-symbol", parent)
      .setDisplaySize(16, 16)
      .setAngle(32)
      .setTint(0xe9f4ff);
    return;
  }

  const iconKey = getNodeIconKey(kind);

  if (!iconKey || !scene.textures.exists("ui-icons")) {
    return;
  }

  const icon = makeFrameImage(scene, x, y, "ui-icons", iconKey, parent);

  if (kind === "flee") {
    icon.setCrop(2, 3, 60, 58).setDisplaySize(16, 16).setTint(0xe9f4ff);
    return;
  }

  icon.setDisplaySize(16, 16);
}

export function renderTutorialInfoButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  parent: DisplayParent
): void {
  const hitbox = makeRectangle(scene, x, y, 28, 28, LAB_THEME.panelAlt, 1, parent)
    .setStrokeStyle(2, LAB_THEME.borderSoft, 1)
    .setInteractive({ useHandCursor: true });
  makeText(scene, x + 14, y + 6, "i", textStyle(9, LAB_THEME.accent, "center"), parent).setOrigin(0.5, 0);
  hitbox.on("pointerdown", onClick);
  hitbox.on("pointerover", () => {
    hitbox.setFillStyle(0x24485d, 1);
    hitbox.setStrokeStyle(2, LAB_THEME.accentFill, 1);
  });
  hitbox.on("pointerout", () => {
    hitbox.setFillStyle(LAB_THEME.panelAlt, 1);
    hitbox.setStrokeStyle(2, LAB_THEME.borderSoft, 1);
  });

  makeText(scene, x + 36, y + 6, label, textStyle(8, LAB_THEME.textMuted), parent);
}
