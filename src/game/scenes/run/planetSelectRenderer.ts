import type { RunRenderContext } from "./shared.js";
import { renderMainPanel, renderPlanetBackdrop, renderPlanetSprite } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { splitRectColumns } from "../../ui/layout.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";

export function renderPlanetSelectPhase(
  ctx: RunRenderContext,
  onChoosePlanet: (planetId: string) => void
): void {
  const { scene, state, contentInner } = ctx;
  renderMainPanel(ctx);
  renderPlanetBackdrop(ctx);
  renderSectionHeader(
    scene,
    contentInner.x + 4,
    contentInner.y + 6,
    "SELECT PLANET",
    `Touch down for site ${state.currentSite}. Clear 3 surface sites, then decide whether to beat the boss or flee to orbit.`,
    contentInner.width - 8
  );

  const cards = splitRectColumns(
    { x: contentInner.x + 4, y: contentInner.y + 62, width: contentInner.width - 8, height: 176 },
    2,
    24
  );

  state.planetChoices.slice(0, 2).forEach((choice, index) => {
    const rect = cards[index];
    createPanel(scene, rect.x, rect.y, rect.width, rect.height, LAB_THEME.panelAlt);
    scene.add.rectangle(rect.x + 8, rect.y + 10, rect.width - 16, 6, LAB_THEME.accentFill, 0.85).setOrigin(0);

    const hitbox = scene.add
      .rectangle(rect.x, rect.y, rect.width, rect.height, 0x000000, 0)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });
    hitbox.on("pointerdown", () => onChoosePlanet(choice.id));

    renderPlanetSprite(scene, choice.imageKey, rect.x + 108, rect.y + rect.height / 2, 164, 150);
    scene.add.text(rect.x + 198, rect.y + 18, choice.name.toUpperCase(), textStyle(11)).setOrigin(0);
    scene.add
      .text(rect.x + 198, rect.y + 44, choice.description, textStyle(9, LAB_THEME.textMuted, "left", rect.width - 216))
      .setOrigin(0);
    scene.add.text(rect.x + 198, rect.y + 88, "Surface route: 3 sites before the final approach.", textStyle(8, LAB_THEME.text, "left", rect.width - 216)).setOrigin(0);
    scene.add.text(rect.x + 198, rect.y + rect.height - 30, "TOUCH DOWN", textStyle(9, LAB_THEME.accent)).setOrigin(0);
  });
}
