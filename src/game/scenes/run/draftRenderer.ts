import type { RunRenderContext } from "./shared.js";
import { renderMainPanel } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createButton } from "../../ui/widgets.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import { getUpgradeTrackLabel } from "../../mechanics/catalog.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import type { MechanicId } from "../../types.js";

export function renderDraftPhase(
  ctx: RunRenderContext,
  onChooseMechanic: (id: MechanicId | null) => void
): void {
  const { scene, state, contentInner } = ctx;
  const draft = state.draft!;

  renderMainPanel(ctx);
  renderSectionHeader(scene, contentInner.x + 4, contentInner.y + 6, draft.title.toUpperCase(), draft.description, contentInner.width - 8);

  const gap = 18;
  const buttonWidth = Math.floor((contentInner.width - gap * 2) / 3);
  let x = contentInner.x + 4;

  for (const mechanicId of draft.choices) {
    const mechanic = getMechanicDefinition(mechanicId);
    createButton(scene, {
      x,
      y: contentInner.y + 54,
      width: buttonWidth,
      height: 110,
      label: mechanic.shortLabel.toUpperCase(),
      detail: `${getUpgradeTrackLabel(mechanic.upgradeTrack)}. ${mechanic.effectText}`,
      onClick: () => onChooseMechanic(mechanicId),
    });
    x += buttonWidth + gap;
  }

  if (draft.canSkip) {
    createButton(scene, {
      x: contentInner.x + 4,
      y: contentInner.y + 176,
      width: 180,
      height: 32,
      label: "SKIP",
      detail: "",
      onClick: () => onChooseMechanic(null),
      fill: 0x284861,
    });
  }

  if (state.activeMechanics.length >= 3) {
    scene.add
      .text(
        contentInner.x + 4,
        contentInner.y + 214,
        "Choosing a new mechanic rotates out the oldest active one.",
        textStyle(8, LAB_THEME.accent, "left", contentInner.width - 8)
      )
      .setOrigin(0);
  }
}
