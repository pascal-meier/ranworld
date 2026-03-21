import type { EventChoice, NodeDefinition, RewardChoice, RunState } from "../../types.js";
import { getCategoryName, getLayerName, getUpgradeTrackLabel } from "../../mechanics/catalog.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { createPanel, createButton } from "../../ui/widgets.js";
import { createScreenLayout, insetRect, type LayoutRect, type ScreenLayout } from "../../ui/layout.js";

export interface RunRenderContext {
  scene: Phaser.Scene;
  state: RunState;
  width: number;
  height: number;
  layout: ScreenLayout;
  contentInner: LayoutRect;
}

export function createRunRenderContext(scene: Phaser.Scene, state: RunState): RunRenderContext {
  const { width, height } = scene.scale;
  const layout = createScreenLayout(width, height, {
    margin: 16,
    top: 12,
    gap: 12,
    headerHeight: 52,
    footerHeight: 112,
  });

  return {
    scene,
    state,
    width,
    height,
    layout,
    contentInner: insetRect(layout.content, 12),
  };
}

export function renderRunFrame(ctx: RunRenderContext): void {
  const { scene, width, height } = ctx;

  scene.add.rectangle(width / 2, height / 2, width, height, LAB_THEME.background, 1);
  scene.add.rectangle(width / 2, 20, width, 40, 0x0b1a26, 1);
}

export function renderHud(ctx: RunRenderContext): void {
  const { scene, state, width, layout } = ctx;
  createPanel(scene, layout.header.x, layout.header.y, layout.header.width, layout.header.height);

  scene.add
    .text(
      layout.header.x + 12,
      layout.header.y + 10,
      `PLANET ${state.planet}  SITE ${state.currentSite}/${state.sitesPerPlanet}  HP ${state.player.hp}/${state.player.maxHp}  SUP ${state.player.supplies}  FOC ${state.player.focus}  CHG ${state.player.mitigationCharges}`,
      textStyle(9, LAB_THEME.text, "left", width - 56)
    )
    .setOrigin(0);

  const moduleText =
    state.activeMechanics.length > 0
      ? state.activeMechanics.map((id) => getMechanicDefinition(id).shortLabel).join(" / ")
      : "none";

  scene.add
    .text(
      layout.header.x + 12,
      layout.header.y + 28,
      `${state.selectedPlanetImageKey ? state.planetName.toUpperCase() : "SELECT PLANET"}  |  MODULES ${moduleText}  |  M MODS`,
      textStyle(8, LAB_THEME.textMuted, "left", width - 56)
    )
    .setOrigin(0);
}

export function renderMainPanel(ctx: RunRenderContext, fill = LAB_THEME.panel): void {
  const { scene, layout } = ctx;
  createPanel(scene, layout.content.x, layout.content.y, layout.content.width, layout.content.height, fill);
}

export function renderUpgradePanel(ctx: RunRenderContext): void {
  const { scene, state, width, layout } = ctx;
  createPanel(scene, layout.footer.x, layout.footer.y, layout.footer.width, layout.footer.height, LAB_THEME.panelAlt);
  scene.add.text(layout.footer.x + 16, layout.footer.y + 12, "ACTIVE UPGRADES", textStyle(9)).setOrigin(0);

  const copy =
    state.activeMechanics.length > 0
      ? state.activeMechanics
          .map((id) => {
            const mechanic = getMechanicDefinition(id);
            return `${mechanic.shortLabel}: ${mechanic.effectText}`;
          })
          .join("  |  ")
      : "No active upgrades yet.";

  scene.add
    .text(layout.footer.x + 16, layout.footer.y + 36, copy, textStyle(8, LAB_THEME.textMuted, "left", width - 64))
    .setOrigin(0);
}

export function renderPlanetBackdrop(ctx: RunRenderContext): void {
  const { scene, contentInner } = ctx;
  const frame: LayoutRect = {
    x: contentInner.x,
    y: contentInner.y + 44,
    width: contentInner.width,
    height: Math.min(280, contentInner.height - 56),
  };

  scene.add.rectangle(
    frame.x + frame.width / 2,
    frame.y + frame.height / 2,
    frame.width,
    frame.height,
    0x08121a,
    1
  );

  if (scene.textures.exists("planet-background")) {
    renderPlanetSprite(
      scene,
      "planet-background",
      frame.x + frame.width / 2,
      frame.y + frame.height / 2,
      frame.width - 24,
      frame.height - 28,
      0.28
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
  alpha = 1
): void {
  if (!scene.textures.exists(key)) {
    return;
  }

  const texture = scene.textures.get(key).getSourceImage() as { width: number; height: number };
  const scale = Math.min(maxWidth / texture.width, maxHeight / texture.height);

  scene.add.image(x, y, key).setScale(scale).setAlpha(alpha).setOrigin(0.5);
}

export function renderRerollButton(
  ctx: RunRenderContext,
  x: number,
  y: number,
  width: number,
  onClick: () => void
): boolean {
  const { state, scene } = ctx;

  if (!state.activeMechanics.includes("reroll-mechanics") || state.player.rerollCharges <= 0) {
    return false;
  }

  createButton(scene, {
    x,
    y,
    width,
    height: 26,
    label: `REROLL ${state.player.rerollCharges}`,
    detail: "",
    onClick,
    fill: 0x284861,
    border: LAB_THEME.borderSoft,
  });

  return true;
}

export function renderActiveMechanicEffects(
  ctx: RunRenderContext,
  x: number,
  y: number,
  width: number,
  maxLines: number
): void {
  const { scene, state } = ctx;

  if (state.activeMechanics.length === 0) {
    scene.add.text(x, y, "No active modules.", textStyle(8, LAB_THEME.textMuted, "left", width)).setOrigin(0);
    return;
  }

  const lines = state.activeMechanics.slice(0, maxLines).map((id) => {
    const mechanic = getMechanicDefinition(id);
    return `${mechanic.shortLabel} [${mechanic.tableId} / ${mechanic.upgradeTrack === "ship-upgrade" ? "ship" : "world"}]: ${mechanic.effectText}`;
  });

  scene.add.text(x, y, lines.join("\n"), textStyle(8, LAB_THEME.textMuted, "left", width)).setOrigin(0);
}

export function renderModifiersPanel(ctx: RunRenderContext): void {
  const { scene, state, width, height } = ctx;

  scene.add.rectangle(width / 2, height / 2, width, height, 0x02060a, 0.72);
  createPanel(scene, 34, 52, width - 68, height - 104, 0x0c1c27, LAB_THEME.border);

  scene.add.text(52, 72, "ACTIVE MODIFIERS", textStyle(13)).setOrigin(0);
  scene.add.text(52, 96, "Press M or Esc to close.", textStyle(8, LAB_THEME.textMuted)).setOrigin(0);

  if (state.activeMechanics.length === 0) {
    scene.add.text(52, 126, "No active modifiers yet.", textStyle(10, LAB_THEME.textMuted)).setOrigin(0);
    return;
  }

  let y = 122;
  for (const mechanicId of state.activeMechanics) {
    const mechanic = getMechanicDefinition(mechanicId);

    createPanel(scene, 48, y, width - 96, 76, LAB_THEME.panelAlt);
    scene.add
      .text(
        62,
        y + 8,
        `${mechanic.shortLabel.toUpperCase()}  /  ${mechanic.tableId}  /  ${getUpgradeTrackLabel(mechanic.upgradeTrack).toUpperCase()}`,
        textStyle(9, LAB_THEME.text)
      )
      .setOrigin(0);
    scene.add
      .text(
        62,
        y + 24,
        `${getLayerName(mechanic.layerId)} / ${getCategoryName(mechanic.categoryId)}`,
        textStyle(8, LAB_THEME.accent, "left", width - 128)
      )
      .setOrigin(0);
    scene.add
      .text(62, y + 42, mechanic.effectText, textStyle(9, LAB_THEME.textMuted, "left", width - 128))
      .setOrigin(0);

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
  const { scene, state } = ctx;
  const selectable = node.column === state.currentColumn;
  const cleared = node.cleared || node.column < state.currentColumn;
  const nodeRadius = selectable ? 29 : 25;
  const baseSize = selectable ? 60 : 50;
  const symbolSize = selectable ? 32 : 26;

  const circle = scene.add.circle(
    x,
    y,
    nodeRadius,
    cleared ? 0x254a44 : selectable ? 0x1d4d6c : 0x152636,
    0.35
  );

  if (selectable && !cleared) {
    circle.setInteractive({ useHandCursor: true });
    circle.on("pointerdown", () => scene.events.emit("run-node-selected", node.id));
  }

  if (scene.textures.exists("node-base")) {
    const base = scene.add.image(x, y, "node-base").setDisplaySize(baseSize, baseSize);

    if (selectable && !cleared) {
      base.setInteractive({ useHandCursor: true });
      base.on("pointerdown", () => scene.events.emit("run-node-selected", node.id));
    }

    if (cleared) {
      base.setAlpha(0.65);
    }
  }

  const symbolKey = getNodeSymbolKey(node.kind);
  if (node.kind === "boss" && scene.textures.exists("node-combat-symbol")) {
    const bossSwordSize = selectable ? 32 : 27;
    const leftSword = scene.add
      .image(x - 6, y - 1, "node-combat-symbol")
      .setDisplaySize(bossSwordSize, bossSwordSize)
      .setFlipX(true)
      .setAngle(-32)
      .setTint(0xe9f4ff);
    const rightSword = scene.add
      .image(x + 6, y - 1, "node-combat-symbol")
      .setDisplaySize(bossSwordSize, bossSwordSize)
      .setAngle(32)
      .setTint(0xe9f4ff);

    if (cleared) {
      leftSword.setAlpha(0.65);
      rightSword.setAlpha(0.65);
    }
  } else if (symbolKey && scene.textures.exists(symbolKey)) {
    const symbol = scene.add.image(x, y, symbolKey);

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
  scene.add
    .text(x, labelY, node.title, textStyle(8, LAB_THEME.textMuted, "center", 120))
    .setOrigin(0.5, labelOriginY);
}

export function renderEventOption(
  scene: Phaser.Scene,
  option: EventChoice,
  x: number,
  y: number,
  width: number,
  onClick: () => void
): void {
  const chanceCopy =
    option.shownChance !== undefined || option.actualChance !== undefined
      ? ` ${option.shownChance ?? option.actualChance}% / ${option.actualChance ?? option.shownChance}%`
      : "";

  createButton(scene, {
    x,
    y,
    width,
    height: 42,
    label: option.label.toUpperCase(),
    detail: `${option.description}${chanceCopy}`,
    onClick,
  });
}

export function renderRewardChoice(
  scene: Phaser.Scene,
  choice: RewardChoice,
  x: number,
  y: number,
  width: number,
  onClick: () => void
): void {
  createButton(scene, {
    x,
    y,
    width,
    height: 64,
    label: choice.label.toUpperCase(),
    detail: choice.description,
    onClick,
  });
}
