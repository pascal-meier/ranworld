import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { renderMainPanel, renderPlanetBackdrop } from "./shared.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import type { NodeDefinition, NodeKind } from "../../types.js";
import { createPanel } from "../../ui/widgets.js";
import { makeCircle, makeFrameImage, makeGraphics, makeImage, makeRectangle, makeText } from "../../ui/display.js";

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

function getNodeSymbolKey(kind: NodeDefinition["kind"]): string | null {
  if (kind === "combat" || kind === "boss") {
    return "intent-attack";
  }

  if (kind === "event" || kind === "reward") {
    return "intent-reward";
  }

  if (kind === "flee") {
    return "intent-risk";
  }

  return null;
}

interface MapNodeSlot {
  root: Phaser.GameObjects.Container;
  circle: Phaser.GameObjects.Arc;
  base: Phaser.GameObjects.Image;
  symbol?: Phaser.GameObjects.Image;
  bossLeft?: Phaser.GameObjects.Image;
  bossRight?: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
}

interface MapChoiceCard {
  panel: Phaser.GameObjects.Container;
  title: Phaser.GameObjects.Text;
  detail: Phaser.GameObjects.Text;
}

function createTutorialInfoButton(
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  onClick: () => void
): Phaser.GameObjects.Container {
  const root = new Phaser.GameObjects.Container(scene, 0, 0);
  const hitbox = makeRectangle(scene, 0, 0, 28, 28, LAB_THEME.panelAlt, 1, root)
    .setStrokeStyle(2, LAB_THEME.borderSoft, 1)
    .setInteractive({ useHandCursor: true });
  const icon = makeText(scene, 14, 6, "i", textStyle(9, LAB_THEME.accent, "center"), root).setOrigin(0.5, 0);
  const label = makeText(scene, 36, 6, "BRIEFING", textStyle(8, LAB_THEME.textMuted), root);

  hitbox.on("pointerdown", onClick);
  hitbox.on("pointerover", () => {
    hitbox.setFillStyle(0x24485d, 1);
    hitbox.setStrokeStyle(2, LAB_THEME.accentFill, 1);
  });
  hitbox.on("pointerout", () => {
    hitbox.setFillStyle(LAB_THEME.panelAlt, 1);
    hitbox.setStrokeStyle(2, LAB_THEME.borderSoft, 1);
  });

  root.add([hitbox, icon, label]);
  parent.add(root);
  return root;
}

function updateNodeSlot(
  slot: MapNodeSlot,
  node: NodeDefinition,
  selectable: boolean,
  onSelectNode: (nodeId: string) => void
): void {
  const cleared = node.cleared;
  const nodeRadius = selectable ? 29 : 25;
  const baseSize = selectable ? 60 : 50;
  const symbolSize = selectable ? 32 : 26;

  slot.root.setVisible(true);
  slot.circle.setRadius(nodeRadius);
  slot.circle.setFillStyle(cleared ? 0x254a44 : selectable ? 0x1d4d6c : 0x152636, 0.35);

  if (selectable && !cleared) {
    slot.circle.setInteractive({
      hitArea: new Phaser.Geom.Circle(nodeRadius, nodeRadius, nodeRadius),
      hitAreaCallback: Phaser.Geom.Circle.Contains,
      useHandCursor: true,
    });
    slot.circle.removeAllListeners("pointerdown");
    slot.circle.on("pointerdown", () => onSelectNode(node.id));
  } else {
    slot.circle.disableInteractive();
  }

  slot.base.setVisible(true).setDisplaySize(baseSize, baseSize).setAlpha(cleared ? 0.65 : 1);

  if (selectable && !cleared) {
    slot.base.setInteractive({ useHandCursor: true });
    slot.base.removeAllListeners("pointerdown");
    slot.base.on("pointerdown", () => onSelectNode(node.id));
  } else {
    slot.base.disableInteractive();
  }

  slot.label.setText(node.title).setColor(selectable ? LAB_THEME.text : LAB_THEME.textMuted).setAlpha(cleared ? 0.65 : 1);
  if (selectable && !cleared) {
    slot.label.setInteractive({ useHandCursor: true });
    slot.label.removeAllListeners("pointerdown");
    slot.label.on("pointerdown", () => onSelectNode(node.id));
  } else {
    slot.label.disableInteractive();
  }

  const symbolKey = getNodeSymbolKey(node.kind);
  if (node.kind === "boss" && slot.bossLeft && slot.bossRight) {
    const bossSwordSize = selectable ? 32 : 27;
    slot.bossLeft
      .setVisible(true)
      .setDisplaySize(bossSwordSize, bossSwordSize)
      .setAlpha(cleared ? 0.65 : 1);
    slot.bossRight
      .setVisible(true)
      .setDisplaySize(bossSwordSize, bossSwordSize)
      .setAlpha(cleared ? 0.65 : 1);
    slot.symbol?.setVisible(false);
  } else if (symbolKey && slot.symbol) {
    slot.symbol.setVisible(true).setFrame(symbolKey).setAlpha(cleared ? 0.65 : 1);
    if (node.kind === "flee") {
      slot.symbol
        .setCrop(2, 3, 60, 58)
        .setDisplaySize(selectable ? 30 : 25, selectable ? 30 : 25)
        .setTint(0xe9f4ff);
    } else {
      slot.symbol.setCrop(0, 0, slot.symbol.width, slot.symbol.height).clearTint().setDisplaySize(symbolSize, symbolSize);
    }
    slot.bossLeft?.setVisible(false);
    slot.bossRight?.setVisible(false);
  } else {
    slot.symbol?.setVisible(false);
    slot.bossLeft?.setVisible(false);
    slot.bossRight?.setVisible(false);
  }
}

function updateChoiceCard(
  card: MapChoiceCard,
  node: NodeDefinition,
  onClick: () => void
): void {
  const copy = describeNodeChoice(node.kind);

  card.panel.setVisible(true);
  card.title.setText(`${copy.heading} / ${node.title.toUpperCase()}`).setColor(copy.accent);
  card.detail.setText(copy.detail);
  card.panel
    .setSize(210, 62)
    .setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, 210, 62),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
  card.panel.removeAllListeners("pointerdown");
  card.panel.on("pointerdown", onClick);
}

export class MapPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private mapContainer!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private tutorialButton?: Phaser.GameObjects.Container;
  private planetSprite?: Phaser.GameObjects.Image;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private clearedMarkers: Phaser.GameObjects.Arc[] = [];
  private clearedHalos: Phaser.GameObjects.Arc[] = [];
  private nodeSlots: MapNodeSlot[] = [];
  private choiceCards: MapChoiceCard[] = [];
  private onOpenTutorial?: () => void;

  public build(): void {
    const { scene, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };

    renderMainPanel(localCtx);
    renderPlanetBackdrop(localCtx);

    this.headerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.mapContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.container.add([this.headerContainer, this.mapContainer]);

    this.titleText = makeText(scene, contentInner.x + 4, contentInner.y + 6, "", textStyle(13, LAB_THEME.text), this.headerContainer);
    this.subtitleText = makeText(
      scene,
      contentInner.x + 4,
      contentInner.y + 28,
      "",
      textStyle(10, LAB_THEME.textMuted, "left", contentInner.width - 8),
      this.headerContainer
    );

    this.tutorialButton = createTutorialInfoButton(scene, this.headerContainer, () => this.onOpenTutorial?.());
    this.tutorialButton.setVisible(false);

    this.planetSprite = makeImage(scene, this.ctx.width / 2, contentInner.y + 190, "planet-01", this.mapContainer)
      .setOrigin(0.5)
      .setVisible(false);
    this.pathGraphics = makeGraphics(scene, this.mapContainer);

    for (let index = 0; index < 4; index += 1) {
      this.clearedMarkers.push(makeCircle(scene, 0, 0, 10, 0x8ce5c2, 1, this.mapContainer).setVisible(false));
      this.clearedHalos.push(makeCircle(scene, 0, 0, 18, 0x1d4d6c, 0.25, this.mapContainer).setVisible(false));
    }

    for (let index = 0; index < 2; index += 1) {
      const root = new Phaser.GameObjects.Container(scene, 0, 0);
      const circle = makeCircle(scene, 0, 0, 29, 0x1d4d6c, 0.35, root);
      const base = makeFrameImage(scene, 0, 0, "ui-icons", "icon-seed", root).setDisplaySize(60, 60);
      const symbol = makeFrameImage(scene, 0, 0, "ui-icons", "intent-attack", root).setDisplaySize(32, 32);
      const bossLeft = makeFrameImage(scene, -6, -1, "ui-icons", "intent-attack", root)
        .setDisplaySize(32, 32)
        .setFlipX(true)
        .setAngle(-32)
        .setTint(0xe9f4ff)
        .setVisible(false);
      const bossRight = makeFrameImage(scene, 6, -1, "ui-icons", "intent-attack", root)
        .setDisplaySize(32, 32)
        .setAngle(32)
        .setTint(0xe9f4ff)
        .setVisible(false);
      const label = makeText(scene, 35, -4, "", textStyle(8, LAB_THEME.text, "left", 120), root).setOrigin(0, 0.5);

      root.setVisible(false);
      this.mapContainer.add(root);
      this.nodeSlots.push({ root, circle, base, symbol, bossLeft, bossRight, label });

      const panel = createPanel(scene, 0, 0, 210, 62, LAB_THEME.panelAlt, LAB_THEME.borderSoft, this.mapContainer);
      const title = makeText(scene, 12, 10, "", textStyle(8, LAB_THEME.text), panel);
      const detail = makeText(scene, 12, 28, "", textStyle(8, LAB_THEME.textMuted, "left", 186), panel).setLineSpacing(-2);
      panel.setVisible(false);
      this.choiceCards.push({ panel, title, detail });
    }
  }

  updateState(state: RunState, onOpenTutorial?: () => void): void {
    const { scene, width, contentInner, onSelectNode } = this.ctx;
    this.onOpenTutorial = onOpenTutorial;

    const currentNodes = state.map[state.currentColumn] ?? [];
    const availableSummary = state.currentColumn === state.sitesPerPlanet - 1
      ? "Boss keeps this planet's gains. Flee skips the risk but drops planet rewards."
      : currentNodes
          .map((node) => `${describeNodeChoice(node.kind).heading}: ${describeNodeChoice(node.kind).detail}`)
          .join("  |  ");

    this.titleText.setText(
      state.currentColumn === state.sitesPerPlanet - 1
        ? `${state.planetName.toUpperCase()} FINAL APPROACH`
        : `${state.planetName.toUpperCase()} WAYPOINTS`
    );
    this.subtitleText.setText(availableSummary).setWordWrapWidth(contentInner.width - (this.onOpenTutorial ? 140 : 8));

    if (this.tutorialButton) {
      this.tutorialButton
        .setVisible(Boolean(this.onOpenTutorial))
        .setPosition(contentInner.x + contentInner.width - 116, contentInner.y + 4);
    }

    if (state.selectedPlanetImageKey && this.planetSprite && scene.textures.exists(state.selectedPlanetImageKey)) {
      const texture = scene.textures.get(state.selectedPlanetImageKey).getSourceImage() as { width: number; height: number };
      const scale = Math.min(290 / texture.width, 210 / texture.height);
      this.planetSprite
        .setVisible(true)
        .setTexture(state.selectedPlanetImageKey)
        .setPosition(width / 2, contentInner.y + 190)
        .setScale(scale)
        .setAlpha(0.96);
    } else {
      this.planetSprite?.setVisible(false);
    }

    this.pathGraphics.clear();
    const cx = width / 2;
    const cy = contentInner.y + 190;
    const waypointPositions = [
      [{ x: cx - 116, y: cy - 68 }, { x: cx + 122, y: cy + 56 }],
      [{ x: cx - 132, y: cy + 56 }, { x: cx + 128, y: cy - 64 }],
      [{ x: cx - 86, y: cy - 84 }, { x: cx + 94, y: cy + 72 }],
      [{ x: cx - 76, y: cy - 56 }, { x: cx + 82, y: cy + 60 }],
    ] as const;

    let previousWaypoint: { x: number; y: number } | null = null;
    let clearedIndex = 0;

    for (let column = 0; column < state.currentColumn; column += 1) {
      const clearedNode = state.map[column].find((node) => node.cleared);
      if (!clearedNode) {
        continue;
      }

      const pos = waypointPositions[column][clearedNode.lane];
      if (previousWaypoint) {
        this.pathGraphics.lineStyle(2, 0x31596a, 0.8);
        this.pathGraphics.beginPath();
        this.pathGraphics.moveTo(previousWaypoint.x, previousWaypoint.y);
        this.pathGraphics.lineTo(pos.x, pos.y);
        this.pathGraphics.strokePath();
      }

      previousWaypoint = pos;
      this.clearedMarkers[clearedIndex]?.setVisible(true).setPosition(pos.x, pos.y);
      this.clearedHalos[clearedIndex]?.setVisible(true).setPosition(pos.x, pos.y);
      clearedIndex += 1;
    }

    for (let index = clearedIndex; index < this.clearedMarkers.length; index += 1) {
      this.clearedMarkers[index].setVisible(false);
      this.clearedHalos[index].setVisible(false);
    }

    for (let index = 0; index < this.nodeSlots.length; index += 1) {
      const slot = this.nodeSlots[index];
      const card = this.choiceCards[index];
      const node = currentNodes[index];

      if (!node) {
        slot.root.setVisible(false);
        card.panel.setVisible(false);
        continue;
      }

      const pos = waypointPositions[state.currentColumn][node.lane];
      if (previousWaypoint) {
        this.pathGraphics.lineStyle(2, 0x31596a, 0.8);
        this.pathGraphics.beginPath();
        this.pathGraphics.moveTo(previousWaypoint.x, previousWaypoint.y);
        this.pathGraphics.lineTo(pos.x, pos.y);
        this.pathGraphics.strokePath();
      }

      slot.root.setPosition(pos.x, pos.y);
      updateNodeSlot(slot, node, node.column === state.currentColumn, () => onSelectNode(node.id));

      card.panel.setPosition(pos.x + 45, pos.y - 25);
      updateChoiceCard(card, node, () => onSelectNode(node.id));
    }
  }
}
