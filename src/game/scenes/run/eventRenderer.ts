import type { RunRenderContext } from "./shared.js";
import { renderMainPanel, renderRerollButton, renderEventOption } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { makeImage } from "../../ui/display.js";

export function renderEventPhase(
  ctx: RunRenderContext,
  onResolveChoice: (choiceId: string) => void,
  onReroll: () => void
): void {
  const { scene, state, width, contentInner, phaseRoot } = ctx;
  const event = state.event!;

  renderMainPanel(ctx);
  renderSectionHeader(
    scene,
    contentInner.x + 4,
    contentInner.y + 6,
    `${event.title.toUpperCase()} / ${state.planetName.toUpperCase()}`,
    event.description,
    contentInner.width - 180,
    phaseRoot
  );

  createPanel(scene, width - 176, contentInner.y + 8, 132, 124, 0x1a3342, undefined, phaseRoot);
  if (scene.textures.exists("event-terminal")) {
    makeImage(scene, width - 110, contentInner.y + 70, "event-terminal", phaseRoot).setScale(0.94).setOrigin(0.5);
  }

  createPanel(scene, contentInner.x + 4, contentInner.y + 148, contentInner.width - 8, 140, 0x1a3342, undefined, phaseRoot);
  renderRerollButton(ctx, width - 180, contentInner.y + 158, 152, onReroll);

  let y = contentInner.y + 176;
  for (const option of event.options) {
    renderEventOption(scene, option, contentInner.x + 16, y, contentInner.width - 32, () => onResolveChoice(option.id), phaseRoot);
    y += 54;
  }
}
