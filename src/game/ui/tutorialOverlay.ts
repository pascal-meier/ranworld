import type { NodeKind } from "../types.js";
import type { TutorialDefinition } from "../tutorials/catalog.js";
import { LAB_THEME, textStyle } from "./theme.js";
import { createButton, createPanel } from "./widgets.js";

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

function renderTutorialNodeIcon(scene: Phaser.Scene, kind: NodeKind, x: number, y: number): void {
  scene.add.circle(x, y, 18, 0x1d4d6c, 0.35);

  if (scene.textures.exists("node-base")) {
    scene.add.image(x, y, "node-base").setDisplaySize(28, 28);
  }

  if (kind === "boss" && scene.textures.exists("node-combat-symbol")) {
    scene.add
      .image(x - 5, y, "node-combat-symbol")
      .setDisplaySize(16, 16)
      .setFlipX(true)
      .setAngle(-32)
      .setTint(0xe9f4ff);
    scene.add
      .image(x + 5, y, "node-combat-symbol")
      .setDisplaySize(16, 16)
      .setAngle(32)
      .setTint(0xe9f4ff);
    return;
  }

  const iconKey = getNodeIconKey(kind);

  if (!iconKey || !scene.textures.exists(iconKey)) {
    return;
  }

  const icon = scene.add.image(x, y, iconKey);

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
  onClick: () => void
): void {
  const hitbox = scene.add
    .rectangle(x, y, 28, 28, LAB_THEME.panelAlt, 1)
    .setStrokeStyle(2, LAB_THEME.borderSoft, 1)
    .setInteractive({ useHandCursor: true });
  scene.add.text(x + 14, y + 6, "i", textStyle(9, LAB_THEME.accent, "center")).setOrigin(0.5, 0);
  hitbox.on("pointerdown", onClick);
  hitbox.on("pointerover", () => {
    hitbox.setFillStyle(0x24485d, 1);
    hitbox.setStrokeStyle(2, LAB_THEME.accentFill, 1);
  });
  hitbox.on("pointerout", () => {
    hitbox.setFillStyle(LAB_THEME.panelAlt, 1);
    hitbox.setStrokeStyle(2, LAB_THEME.borderSoft, 1);
  });

  scene.add.text(x + 36, y + 6, label, textStyle(8, LAB_THEME.textMuted)).setOrigin(0);
}

export function renderTutorialOverlay(
  scene: Phaser.Scene,
  tutorial: TutorialDefinition,
  onClose: () => void
): void {
  const { width, height } = scene.scale;
  const panelWidth = Math.min(700, width - 120);
  const panelHeight = Math.min(436, height - 100);
  const panelX = Math.floor((width - panelWidth) / 2);
  const panelY = Math.floor((height - panelHeight) / 2);
  const contentX = panelX + 20;
  let rowY = panelY + 102;

  const blocker = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x02060a, 0.74)
    .setInteractive({ useHandCursor: false });
  blocker.on("pointerdown", () => undefined);

  createPanel(scene, panelX, panelY, panelWidth, panelHeight, 0x133229, 0x8ce5c2);
  scene.add.rectangle(panelX + 10, panelY + 14, panelWidth - 20, 8, 0x8ce5c2, 0.75).setOrigin(0);
  scene.add.text(contentX, panelY + 24, tutorial.title, textStyle(13, LAB_THEME.positive)).setOrigin(0);
  scene.add
    .text(contentX, panelY + 52, tutorial.intro, textStyle(9, "#b7d8cc", "left", panelWidth - 40))
    .setOrigin(0);

  for (const item of tutorial.items) {
    createPanel(scene, panelX + 16, rowY, panelWidth - 32, 46, 0x1c4238, 0x4f8e79);

    if (item.nodeKind) {
      renderTutorialNodeIcon(scene, item.nodeKind, panelX + 40, rowY + 23);
    }

    scene.add.text(panelX + 68, rowY + 8, item.heading, textStyle(8, LAB_THEME.positive)).setOrigin(0);
    scene.add
      .text(panelX + 68, rowY + 22, item.body, textStyle(8, "#c8ddd5", "left", panelWidth - 116))
      .setOrigin(0);

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
  });
}
