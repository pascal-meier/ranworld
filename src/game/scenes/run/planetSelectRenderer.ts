import type { RunRenderContext } from "./shared.js";
import { renderMainPanel, renderPlanetBackdrop, renderPlanetSprite } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { splitRectColumns } from "../../ui/layout.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeRectangle, makeText } from "../../ui/display.js";

export function renderPlanetSelectPhase(
  ctx: RunRenderContext,
  onChoosePlanet: (planetId: string) => void
): void {
  const { scene, state, contentInner, phaseRoot } = ctx;
  renderMainPanel(ctx);
  renderPlanetBackdrop(ctx);
  renderSectionHeader(
    scene,
    contentInner.x + 4,
    contentInner.y + 6,
    "SELECT PLANET",
    `Touch down for site ${state.currentSite}. Clear 3 surface sites, then decide whether to beat the boss or flee to orbit.`,
    contentInner.width - 8,
    phaseRoot
  );

  const cards = splitRectColumns(
    { x: contentInner.x + 4, y: contentInner.y + 62, width: contentInner.width - 8, height: 176 },
    2,
    24
  );

  state.planetChoices.slice(0, 2).forEach((choice, index) => {
    const rect = cards[index];
    createPanel(scene, rect.x, rect.y, rect.width, rect.height, LAB_THEME.panelAlt, LAB_THEME.borderSoft, phaseRoot);
    makeRectangle(scene, rect.x + 8, rect.y + 10, rect.width - 16, 6, LAB_THEME.accentFill, 0.85, phaseRoot).setOrigin(0);

    const hitbox = makeRectangle(scene, rect.x, rect.y, rect.width, rect.height, 0x000000, 0, phaseRoot).setOrigin(0).setInteractive({ useHandCursor: true });
    hitbox.on("pointerdown", () => onChoosePlanet(choice.id));

    renderPlanetSprite(scene, choice.imageKey, rect.x + 108, rect.y + rect.height / 2, 164, 150, 1, phaseRoot);
    makeText(scene, rect.x + 198, rect.y + 18, choice.name.toUpperCase(), textStyle(11), phaseRoot);
    makeText(scene, rect.x + 198, rect.y + 44, choice.description, textStyle(9, LAB_THEME.textMuted, "left", rect.width - 216), phaseRoot);
    makeText(
      scene,
      rect.x + 198,
      rect.y + 88,
      "Surface route: 3 sites before the final approach.",
      textStyle(8, LAB_THEME.text, "left", rect.width - 216),
      phaseRoot
    );
    makeText(scene, rect.x + 198, rect.y + rect.height - 30, "TOUCH DOWN", textStyle(9, LAB_THEME.accent), phaseRoot);
  });
}
