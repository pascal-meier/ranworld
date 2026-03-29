import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { renderMainPanel, renderPlanetBackdrop, renderPlanetSprite, renderNode } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import type { NodeDefinition, NodeKind } from "../../types.js";
import { renderTutorialInfoButton } from "../../ui/tutorialOverlay.js";
import { makeCircle, makeGraphics, makeText } from "../../ui/display.js";

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
  width: number,
  parent: Phaser.GameObjects.Container
): void {
  const copy = describeNodeChoice(node.kind);

  createPanel(scene, x, y, width, 62, LAB_THEME.panelAlt, LAB_THEME.borderSoft, parent);
  makeText(scene, x + 12, y + 10, `${copy.heading} / ${node.title.toUpperCase()}`, textStyle(8, copy.accent), parent);
  makeText(scene, x + 12, y + 28, copy.detail, textStyle(8, LAB_THEME.textMuted, "left", width - 24), parent).setLineSpacing(-2);
}

export class MapPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private mapContainer!: Phaser.GameObjects.Container;
  private onOpenTutorial?: () => void;

  public build(): void {
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    
    renderMainPanel(localCtx);
    renderPlanetBackdrop(localCtx);

    this.headerContainer = this.scene.add.container(0, 0);
    this.mapContainer = this.scene.add.container(0, 0);
    this.container.add([this.headerContainer, this.mapContainer]);
  }

  updateState(state: RunState, onOpenTutorial?: () => void): void {
    const { scene, width, contentInner } = this.ctx;
    this.onOpenTutorial = onOpenTutorial;

    // Fast-rebuild header
    this.headerContainer.removeAll(true);
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
      contentInner.width - (this.onOpenTutorial ? 140 : 8),
      this.headerContainer
    );
    if (this.onOpenTutorial) {
      renderTutorialInfoButton(scene, contentInner.x + contentInner.width - 116, contentInner.y + 4, "BRIEFING", this.onOpenTutorial, this.headerContainer);
    }

    // Fast-rebuild map
    this.mapContainer.removeAll(true);

    if (state.selectedPlanetImageKey) {
      renderPlanetSprite(scene, state.selectedPlanetImageKey, width / 2, contentInner.y + 190, 290, 210, 0.96, this.mapContainer);
    }

    const graphics = makeGraphics(scene, this.mapContainer);
    const cx = width / 2;
    const cy = contentInner.y + 190;
    const waypointPositions = [
      [{ x: cx - 116, y: cy - 68 }, { x: cx + 122, y: cy + 56 }],
      [{ x: cx - 132, y: cy + 56 }, { x: cx + 128, y: cy - 64 }],
      [{ x: cx - 86,  y: cy - 84 }, { x: cx + 94,  y: cy + 72 }],
      [{ x: cx - 76,  y: cy - 56 }, { x: cx + 82,  y: cy + 60 }],
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
      makeCircle(scene, pos.x, pos.y, 10, 0x8ce5c2, 1, this.mapContainer);
      makeCircle(scene, pos.x, pos.y, 18, 0x1d4d6c, 0.25, this.mapContainer);
    }

    // Context for node buttons to mount to mapContainer
    const mapCtx = { ...this.ctx, phaseRoot: this.mapContainer };

    for (const node of currentNodes) {
      const pos = waypointPositions[state.currentColumn][node.lane];

      if (previousWaypoint) {
        graphics.lineStyle(2, 0x31596a, 0.8);
        graphics.beginPath();
        graphics.moveTo(previousWaypoint.x, previousWaypoint.y);
        graphics.lineTo(pos.x, pos.y);
        graphics.strokePath();
      }

      renderNode(mapCtx, node, pos.x, pos.y);
    }

    if (currentNodes[0]) {
      renderNodeChoiceCard(scene, currentNodes[0], contentInner.x + 6, contentInner.y + 64, 210, this.mapContainer);
    }

    if (currentNodes[1]) {
      renderNodeChoiceCard(scene, currentNodes[1], contentInner.x + contentInner.width - 216, contentInner.y + 188, 210, this.mapContainer);
    }
  }
}
