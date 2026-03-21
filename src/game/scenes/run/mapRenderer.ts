import type { RunRenderContext } from "./shared.js";
import { renderMainPanel, renderPlanetBackdrop, renderPlanetSprite, renderNode } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import type { NodeDefinition, NodeKind } from "../../types.js";
import { renderTutorialInfoButton } from "../../ui/tutorialOverlay.js";

function describeNodeChoice(kind: NodeKind): { heading: string; detail: string; accent: string } {
  if (kind === "combat") {
    return {
      heading: "COMBAT",
      detail: "Risk HP for +1 supply.",
      accent: LAB_THEME.accent,
    };
  }

  if (kind === "event") {
    return {
      heading: "EVENT",
      detail: "Safe repair or risky archive.",
      accent: LAB_THEME.positive,
    };
  }

  if (kind === "reward") {
    return {
      heading: "REWARD",
      detail: "Pick 1 of 3 packages.",
      accent: LAB_THEME.text,
    };
  }

  if (kind === "boss") {
    return {
      heading: "BOSS",
      detail: "Win to keep planet gains.",
      accent: LAB_THEME.danger,
    };
  }

  return {
    heading: "FLEE",
    detail: "Skip boss, lose planet rewards.",
    accent: LAB_THEME.textMuted,
  };
}

function renderNodeChoiceCard(
  scene: Phaser.Scene,
  node: NodeDefinition,
  x: number,
  y: number,
  width: number
): void {
  const copy = describeNodeChoice(node.kind);

  createPanel(scene, x, y, width, 62, LAB_THEME.panelAlt);
  scene.add.text(x + 12, y + 10, `${copy.heading} / ${node.title.toUpperCase()}`, textStyle(8, copy.accent)).setOrigin(0);
  scene.add
    .text(x + 12, y + 28, copy.detail, textStyle(8, LAB_THEME.textMuted, "left", width - 24))
    .setLineSpacing(-2)
    .setOrigin(0);
}

export function renderMapPhase(ctx: RunRenderContext, onOpenTutorial?: () => void): void {
  const { scene, state, width, contentInner } = ctx;
  renderMainPanel(ctx);
  renderPlanetBackdrop(ctx);
  const currentNodes = state.map[state.currentColumn] ?? [];
  const availableSummary = state.currentColumn === state.sitesPerPlanet - 1
    ? "Boss keeps this planet's gains. Flee skips the risk but drops planet rewards."
    : currentNodes
        .map((node) => `${describeNodeChoice(node.kind).heading}: ${describeNodeChoice(node.kind).detail}`)
        .join("  |  ");

  renderSectionHeader(
    scene,
    contentInner.x + 4,
    contentInner.y + 6,
    state.currentColumn === state.sitesPerPlanet - 1
      ? `${state.planetName.toUpperCase()} FINAL APPROACH`
      : `${state.planetName.toUpperCase()} WAYPOINTS`,
    availableSummary,
    contentInner.width - (onOpenTutorial ? 140 : 8)
  );
  if (onOpenTutorial) {
    renderTutorialInfoButton(scene, contentInner.x + contentInner.width - 116, contentInner.y + 4, "BRIEFING", onOpenTutorial);
  }

  if (state.selectedPlanetImageKey) {
    renderPlanetSprite(scene, state.selectedPlanetImageKey, width / 2, contentInner.y + 190, 290, 210, 0.96);
  }

  const graphics = scene.add.graphics();
  const cx = width / 2;
  const cy = contentInner.y + 190;
  const waypointPositions = [
    [
      { x: cx - 116, y: cy - 68 },
      { x: cx + 122, y: cy + 56 },
    ],
    [
      { x: cx - 132, y: cy + 56 },
      { x: cx + 128, y: cy - 64 },
    ],
    [
      { x: cx - 86, y: cy - 84 },
      { x: cx + 94, y: cy + 72 },
    ],
    [
      { x: cx - 76, y: cy - 56 },
      { x: cx + 82, y: cy + 60 },
    ],
  ] as const;

  let previousWaypoint: { x: number; y: number } | null = null;

  for (let column = 0; column < state.currentColumn; column += 1) {
    const clearedNode = state.map[column].find((node) => node.cleared);
    if (!clearedNode) {
      continue;
    }

    const pos = waypointPositions[column][clearedNode.lane];
    if (previousWaypoint) {
      graphics.lineStyle(2, 0x31596a, 0.8);
      graphics.beginPath();
      graphics.moveTo(previousWaypoint.x, previousWaypoint.y);
      graphics.lineTo(pos.x, pos.y);
      graphics.strokePath();
    }

    previousWaypoint = pos;
    scene.add.circle(pos.x, pos.y, 10, 0x8ce5c2, 1);
    scene.add.circle(pos.x, pos.y, 18, 0x1d4d6c, 0.25);
  }

  for (const node of currentNodes) {
    const pos = waypointPositions[state.currentColumn][node.lane];

    if (previousWaypoint) {
      graphics.lineStyle(2, 0x31596a, 0.8);
      graphics.beginPath();
      graphics.moveTo(previousWaypoint.x, previousWaypoint.y);
      graphics.lineTo(pos.x, pos.y);
      graphics.strokePath();
    }

    renderNode(ctx, node, pos.x, pos.y);
  }

  if (currentNodes[0]) {
    renderNodeChoiceCard(scene, currentNodes[0], contentInner.x + 6, contentInner.y + 64, 210);
  }

  if (currentNodes[1]) {
    renderNodeChoiceCard(scene, currentNodes[1], contentInner.x + contentInner.width - 216, contentInner.y + 188, 210);
  }
}
