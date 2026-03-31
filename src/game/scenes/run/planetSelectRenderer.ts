import type { PlanetChoice, RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, renderPlanetBackdrop, renderPlanetSprite, type RunRenderContext } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { splitRectColumns } from "../../ui/layout.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeImage, makeRectangle, makeText } from "../../ui/display.js";
import type { LayoutRect } from "../../ui/layout.js";

import type { UIPlanetCard } from "../../ui/components/PlanetCard.js";

export class PlanetSelectPhaseView extends PhaseView {
  private subtitleText!: Phaser.GameObjects.Text;
  private cards: UIPlanetCard[] = [];

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  public build(): void {
    const { scene, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    this.cards = [];

    renderMainPanel(localCtx);
    renderPlanetBackdrop(localCtx);
    
    // Header
    const headerTitle = makeText(scene, contentInner.x + 4, contentInner.y + 6, "SELECT PLANET", textStyle(14, LAB_THEME.text), this.container);
    this.subtitleText = makeText(
      scene,
      contentInner.x + 4,
      contentInner.y + 24,
      "",
      textStyle(8, LAB_THEME.textMuted, "left", contentInner.width - 8),
      this.container
    );

    // Cards
    const cardRects = splitRectColumns(
      { x: contentInner.x + 4, y: contentInner.y + 62, width: contentInner.width - 8, height: 176 },
      2,
      24
    );

    for (const rect of cardRects) {
      const card = this.scene.add.uiPlanetCard(rect.x, rect.y, rect.width, rect.height);
      this.container.add(card);
      this.cards.push(card);
    }
  }

  updateState(state: RunState): void {
    this.subtitleText.setText(`Touch down for site ${state.currentSite}. Clear 3 surface sites, then decide whether to beat the boss or flee to orbit.`);

    const choices = state.planetChoices.slice(0, 2);
    
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const choice = choices[i];

      if (!choice) {
        card.setVisible(false);
        continue;
      }

      card.setVisible(true).setChoice(choice);
    }
  }
}
