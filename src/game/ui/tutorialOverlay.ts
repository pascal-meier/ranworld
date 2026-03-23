import type { NodeKind } from "../types.js";
import type { TutorialDefinition } from "../tutorials/catalog.js";
import { LAB_THEME, textStyle } from "./theme.js";
import { createButton, createPanel } from "./widgets.js";
import { makeCircle, makeImage, makeRectangle, makeText, type DisplayParent } from "./display.js";

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

function renderTutorialNodeIcon(
  scene: Phaser.Scene,
  kind: NodeKind,
  x: number,
  y: number,
  parent: DisplayParent
): void {
  makeCircle(scene, x, y, 18, 0x1d4d6c, 0.35, parent);

  if (scene.textures.exists("node-base")) {
    makeImage(scene, x, y, "node-base", parent).setDisplaySize(28, 28);
  }

  if (kind === "boss" && scene.textures.exists("node-combat-symbol")) {
    makeImage(scene, x - 5, y, "node-combat-symbol", parent)
      .setDisplaySize(16, 16)
      .setFlipX(true)
      .setAngle(-32)
      .setTint(0xe9f4ff);
    makeImage(scene, x + 5, y, "node-combat-symbol", parent)
      .setDisplaySize(16, 16)
      .setAngle(32)
      .setTint(0xe9f4ff);
    return;
  }

  const iconKey = getNodeIconKey(kind);

  if (!iconKey || !scene.textures.exists(iconKey)) {
    return;
  }

  const icon = makeImage(scene, x, y, iconKey, parent);

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

export function renderTutorialOverlay(
  scene: Phaser.Scene,
  tutorial: TutorialDefinition,
  onClose: () => void,
  parent: DisplayParent
): void {
  const { width, height } = scene.scale;
  const panelWidth = Math.min(700, width - 120);
  const panelHeight = Math.min(436, height - 100);
  const panelX = Math.floor((width - panelWidth) / 2);
  const panelY = Math.floor((height - panelHeight) / 2);
  const contentX = panelX + 20;
  let rowY = panelY + 102;

  const blocker = makeRectangle(scene, 0, 0, width, height, 0x02060a, 0.74, parent)
    .setOrigin(0)
    .setInteractive({ useHandCursor: false });
  blocker.on("pointerdown", onClose);

  const panel = createPanel(scene, panelX, panelY, panelWidth, panelHeight, 0x133229, 0x8ce5c2, parent);
  panel
    .setSize(panelWidth, panelHeight)
    .setInteractive(new Phaser.Geom.Rectangle(0, 0, panelWidth, panelHeight), Phaser.Geom.Rectangle.Contains)
    .on("pointerdown", onClose);
  makeRectangle(scene, panelX + 10, panelY + 14, panelWidth - 20, 8, 0x8ce5c2, 0.75, parent).setOrigin(0);
  makeText(scene, contentX, panelY + 24, tutorial.title, textStyle(13, LAB_THEME.positive), parent);
  makeText(scene, contentX, panelY + 52, tutorial.intro, textStyle(9, "#b7d8cc", "left", panelWidth - 40), parent);
  createButton(scene, {
    x: panelX + panelWidth - 148,
    y: panelY + 22,
    width: 124,
    height: 26,
    label: "SCHLIESSEN",
    detail: "",
    onClick: onClose,
    fill: 0x2a5a47,
    border: 0x8ce5c2,
  }, parent);

  for (const item of tutorial.items) {
    createPanel(scene, panelX + 16, rowY, panelWidth - 32, 46, 0x1c4238, 0x4f8e79, parent);

    if (item.nodeKind) {
      renderTutorialNodeIcon(scene, item.nodeKind, panelX + 40, rowY + 23, parent);
    }

    makeText(scene, panelX + 68, rowY + 8, item.heading, textStyle(8, LAB_THEME.positive), parent);
    makeText(scene, panelX + 68, rowY + 22, item.body, textStyle(8, "#c8ddd5", "left", panelWidth - 116), parent);

    rowY += 54;
  }

  createButton(scene, {
    x: panelX + panelWidth - 184,
    y: panelY + panelHeight - 58,
    width: 160,
    height: 38,
    label: tutorial.confirmLabel,
    detail: "",
    onClick: onClose,
    fill: 0x2a5a47,
    border: 0x8ce5c2,
  }, parent);
}
