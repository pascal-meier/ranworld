import type { EventChoice, NodeDefinition, RewardChoice, RunState } from "../../types.js";
import { getCategoryName, getLayerName, getUpgradeTrackLabel } from "../../mechanics/catalog.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { createPanel, createButton } from "../../ui/widgets.js";
import { createScreenLayout, insetRect, type LayoutRect, type ScreenLayout } from "../../ui/layout.js";
import { makeCircle, makeFrameImage, makeGraphics, makeImage, makeRectangle, makeText, type DisplayParent } from "../../ui/display.js";
import { REROLL_SUPPLY_COST } from "../../core/balance.js";

export interface RunRenderContext {
  scene: Phaser.Scene;
  state: RunState;
  width: number;
  height: number;
  layout: ScreenLayout;
  contentInner: LayoutRect;
  phaseRoot: DisplayParent;
  overlayRoot: DisplayParent;
  onSelectNode: (nodeId: string) => void;
}

export function getCenteredX(totalWidth: number, parentWidth: number): number {
  return Math.floor((parentWidth - totalWidth) / 2);
}

export function getVerticalStackY(index: number, height: number, gap: number, startY: number): number {
  return startY + index * (height + gap);
}

export function createRunRenderContext(
  scene: Phaser.Scene,
  state: RunState,
  phaseRoot: DisplayParent,
  overlayRoot: DisplayParent,
  onSelectNode: (nodeId: string) => void
): RunRenderContext {
  const { width, height } = scene.scale;
  const layout = createScreenLayout(width, height, {
    margin: 16,
    top: 12,
    gap: 12,
    headerHeight: 52,
    footerHeight: 156,
  });

  return {
    scene,
    state,
    width,
    height,
    layout,
    contentInner: insetRect(layout.content, 12),
    phaseRoot,
    overlayRoot,
    onSelectNode,
  };
}

export function renderRunFrame(ctx: RunRenderContext): void {
  const { scene, width, height, phaseRoot } = ctx;

  makeRectangle(scene, 0, 0, width, height, LAB_THEME.background, 1, phaseRoot).setOrigin(0);
  makeRectangle(scene, 0, 0, width, 40, 0x0b1a26, 1, phaseRoot).setOrigin(0);
}

export function renderHud(ctx: RunRenderContext): void {
  const { scene, state, width, layout, phaseRoot } = ctx;
  createPanel(scene, layout.header.x, layout.header.y, layout.header.width, layout.header.height, LAB_THEME.panel, LAB_THEME.borderSoft, phaseRoot);

  let currentX = layout.header.x + 12;
  const currentY = layout.header.y + 10;
  
  const drawStat = (frame: string, text: string, spacing: number) => {
    makeFrameImage(scene, currentX, currentY + 5, "ui-icons", frame, phaseRoot).setDisplaySize(12, 12).setOrigin(0, 0.5);
    currentX += 16;
    const txt = makeText(scene, currentX, currentY, text, textStyle(9, LAB_THEME.text), phaseRoot);
    currentX += txt.width + spacing;
  };

  const planetText = makeText(scene, currentX, currentY, `PLANET ${state.planet}   SITE ${state.currentSite}/${state.sitesPerPlanet}`, textStyle(9, LAB_THEME.text), phaseRoot);
  currentX += planetText.width + 16;
  
  drawStat("status-heal", `${state.player.hp}/${state.player.maxHp}`, 12);
  drawStat("icon-supplies", `${state.player.supplies}`, 12);
  drawStat("icon-focus", `${state.player.focus}`, 12);
  drawStat("status-warning", `${state.player.mitigationCharges}`, 12);

  const moduleText =
    state.activeMechanics.length > 0
      ? state.activeMechanics.map((id) => getMechanicDefinition(id).shortLabel).join(" / ")
      : "none";

  makeText(
    scene,
    layout.header.x + 12,
    layout.header.y + 28,
    `${state.selectedPlanetImageKey ? state.planetName.toUpperCase() : "SELECT PLANET"}  |  MODULES ${moduleText}  |  M MODS`,
    textStyle(8, LAB_THEME.textMuted, "left", width - 56),
    phaseRoot
  );
}

export function renderMainPanel(ctx: RunRenderContext, fill = LAB_THEME.panel): void {
  const { scene, layout, phaseRoot } = ctx;
  createPanel(scene, layout.content.x, layout.content.y, layout.content.width, layout.content.height, fill, LAB_THEME.borderSoft, phaseRoot);
}

export function renderUpgradePanel(ctx: RunRenderContext): void {
  const { scene, state, width, layout, phaseRoot } = ctx;
  createPanel(scene, layout.footer.x, layout.footer.y, layout.footer.width, layout.footer.height, LAB_THEME.panelAlt, LAB_THEME.borderSoft, phaseRoot);
  makeText(scene, layout.footer.x + 16, layout.footer.y + 12, "ACTIVE UPGRADES", textStyle(9), phaseRoot);

  const copy =
    state.activeMechanics.length > 0
      ? state.activeMechanics
          .map((id) => {
            const mechanic = getMechanicDefinition(id);
            return `${mechanic.shortLabel}: ${mechanic.effectText}`;
          })
          .join("  |  ")
      : "No active upgrades yet.";

  makeText(
    scene,
    layout.footer.x + 16,
    layout.footer.y + 36,
    copy,
    textStyle(8, LAB_THEME.textMuted, "left", width - 64),
    phaseRoot
  );
}

export function renderPlanetBackdrop(ctx: RunRenderContext): void {
  const { scene, contentInner, phaseRoot } = ctx;
  const frame: LayoutRect = {
    x: contentInner.x,
    y: contentInner.y + 44,
    width: contentInner.width,
    height: Math.min(280, contentInner.height - 56),
  };

  makeRectangle(scene, frame.x, frame.y, frame.width, frame.height, 0x08121a, 1, phaseRoot).setOrigin(0);

  if (scene.textures.exists("planet-background")) {
    renderPlanetSprite(
      scene,
      "planet-background",
      frame.x + frame.width / 2,
      frame.y + frame.height / 2,
      frame.width - 24,
      frame.height - 28,
      0.28,
      phaseRoot
    );
  }
}

export function renderPlanetSprite(
  scene: Phaser.Scene,
  key: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  alpha = 1,
  parent?: DisplayParent
): void {
  if (!scene.textures.exists(key)) {
    return;
  }

  const texture = scene.textures.get(key).getSourceImage() as { width: number; height: number };
  const scale = Math.min(maxWidth / texture.width, maxHeight / texture.height);

  makeImage(scene, x, y, key, parent).setScale(scale).setAlpha(alpha).setOrigin(0.5);
}

export function renderRerollButton(
  ctx: RunRenderContext,
  x: number,
  y: number,
  width: number,
  onClick: () => void,
  disabled = false
): boolean {
  const { state, scene, phaseRoot } = ctx;

  if (!state.activeMechanics.includes("reroll-mechanics")) {
    return false;
  }

  const unavailable =
    disabled ||
    state.player.rerollCharges <= 0 ||
    state.player.supplies < REROLL_SUPPLY_COST;

  createButton(scene, {
    x,
    y,
    width,
    height: 26,
    label: `REROLL ${state.player.rerollCharges} / ${REROLL_SUPPLY_COST} SUP`,
    detail: "",
    onClick,
    fill: 0x284861,
    border: LAB_THEME.borderSoft,
    disabled: unavailable,
  }, phaseRoot);

  return true;
}

export function renderActiveMechanicEffects(
  ctx: RunRenderContext,
  x: number,
  y: number,
  width: number,
  maxLines: number
): void {
  const { scene, state, phaseRoot, onSelectNode } = ctx;

  if (state.activeMechanics.length === 0) {
    makeText(scene, x, y, "No active modules.", textStyle(8, LAB_THEME.textMuted, "left", width), phaseRoot);
    return;
  }

  const lines = state.activeMechanics.slice(0, maxLines).map((id) => {
    const mechanic = getMechanicDefinition(id);
    return `${mechanic.shortLabel} [${mechanic.tableId} / ${mechanic.upgradeTrack === "ship-upgrade" ? "ship" : "world"}]: ${mechanic.effectText}`;
  });

  makeText(scene, x, y, lines.join("\n"), textStyle(8, LAB_THEME.textMuted, "left", width), phaseRoot);
}

export function renderModifiersPanel(ctx: RunRenderContext, onClose: () => void): void {
  const { scene, state, width, height, overlayRoot } = ctx;

  makeRectangle(scene, 0, 0, width, height, 0x02060a, 0.72, overlayRoot)
    .setOrigin(0)
    .setInteractive({ useHandCursor: false })
    .on("pointerdown", onClose);
  const panel = createPanel(scene, 34, 52, width - 68, height - 104, 0x0c1c27, LAB_THEME.border, overlayRoot);
  panel
    .setSize(width - 68, height - 104)
    .setInteractive(new Phaser.Geom.Rectangle(0, 0, width - 68, height - 104), Phaser.Geom.Rectangle.Contains)
    .on("pointerdown", onClose);

  makeText(scene, 52, 72, "ACTIVE MODIFIERS", textStyle(13), overlayRoot);
  makeText(scene, 52, 96, "Press M or Esc to close.", textStyle(8, LAB_THEME.textMuted), overlayRoot);
  createButton(scene, {
    x: width - 176,
    y: 68,
    width: 120,
    height: 26,
    label: "SCHLIESSEN",
    detail: "",
    onClick: onClose,
    fill: 0x284861,
    border: LAB_THEME.borderSoft,
  }, overlayRoot);

  if (state.activeMechanics.length === 0) {
    makeText(scene, 52, 126, "No active modifiers yet.", textStyle(10, LAB_THEME.textMuted), overlayRoot);
    return;
  }

  let y = 122;
  for (const mechanicId of state.activeMechanics) {
    const mechanic = getMechanicDefinition(mechanicId);

    createPanel(scene, 48, y, width - 96, 76, LAB_THEME.panelAlt, LAB_THEME.borderSoft, overlayRoot);
    makeText(
      scene,
      62,
      y + 8,
      `${mechanic.shortLabel.toUpperCase()}  /  ${mechanic.tableId}  /  ${getUpgradeTrackLabel(mechanic.upgradeTrack).toUpperCase()}`,
      textStyle(9, LAB_THEME.text),
      overlayRoot
    );
    makeText(
      scene,
      62,
      y + 24,
      `${getLayerName(mechanic.layerId)} / ${getCategoryName(mechanic.categoryId)}`,
      textStyle(8, LAB_THEME.accent, "left", width - 128),
      overlayRoot
    );
    makeText(
      scene,
      62,
      y + 42,
      mechanic.effectText,
      textStyle(9, LAB_THEME.textMuted, "left", width - 128),
      overlayRoot
    );

    y += 84;
  }
}

export function getNodeSymbolKey(kind: NodeDefinition["kind"]): string | null {
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

export function renderNode(
  ctx: RunRenderContext,
  node: NodeDefinition,
  x: number,
  y: number
): void {
  const { scene, state, phaseRoot, onSelectNode } = ctx;
  const selectable = node.column === state.currentColumn;
  const cleared = node.cleared || node.column < state.currentColumn;
  const nodeRadius = selectable ? 29 : 25;
  const baseSize = selectable ? 60 : 50;
  const symbolSize = selectable ? 32 : 26;

  const circle = makeCircle(
    scene,
    x,
    y,
    nodeRadius,
    cleared ? 0x254a44 : selectable ? 0x1d4d6c : 0x152636,
    0.35,
    phaseRoot
  );

  if (selectable && !cleared) {
    circle.setInteractive({ useHandCursor: true });
    circle.on("pointerdown", () => onSelectNode(node.id));
  }

  if (scene.textures.exists("ui-icons")) {
    const base = makeFrameImage(scene, x, y, "ui-icons", "node-base-style", phaseRoot).setDisplaySize(baseSize, baseSize);

    if (selectable && !cleared) {
      base.setInteractive({ useHandCursor: true });
      base.on("pointerdown", () => onSelectNode(node.id));
    }

    if (cleared) {
      base.setAlpha(0.65);
    }
  }

  const symbolKey = getNodeSymbolKey(node.kind);
  if (node.kind === "boss" && scene.textures.exists("ui-icons")) {
    const bossSwordSize = selectable ? 32 : 27;
    const leftSword = makeFrameImage(scene, x - 6, y - 1, "ui-icons", "node-combat-symbol", phaseRoot)
      .setDisplaySize(bossSwordSize, bossSwordSize)
      .setFlipX(true)
      .setAngle(-32)
      .setTint(0xe9f4ff);
    const rightSword = makeFrameImage(scene, x + 6, y - 1, "ui-icons", "node-combat-symbol", phaseRoot)
      .setDisplaySize(bossSwordSize, bossSwordSize)
      .setAngle(32)
      .setTint(0xe9f4ff);

    if (cleared) {
      leftSword.setAlpha(0.65);
      rightSword.setAlpha(0.65);
    }
  } else if (symbolKey) {
    const symbol = makeFrameImage(scene, x, y, "ui-icons", symbolKey, phaseRoot);

    if (node.kind === "flee") {
      symbol
        .setCrop(2, 3, 60, 58)
        .setDisplaySize(selectable ? 30 : 25, selectable ? 30 : 25)
        .setTint(0xe9f4ff);
    } else {
      symbol.setDisplaySize(symbolSize, symbolSize);
    }

    if (cleared) {
      symbol.setAlpha(0.65);
    }
  }

  const labelY = node.lane === 0 ? y - 48 : y + 40;
  const labelOriginY = node.lane === 0 ? 1 : 0;
  makeText(scene, x, labelY, node.title, textStyle(8, LAB_THEME.textMuted, "center", 120), phaseRoot).setOrigin(0.5, labelOriginY);
}
