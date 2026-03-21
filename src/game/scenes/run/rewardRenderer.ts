import type { RunRenderContext } from "./shared.js";
import { renderMainPanel, renderRerollButton, renderActiveMechanicEffects, renderRewardChoice } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";

export function renderRewardPhase(
  ctx: RunRenderContext,
  onChooseReward: (choiceId: string) => void,
  onReroll: () => void
): void {
  const { scene, state, width, contentInner } = ctx;
  const reward = state.reward!;
  const gap = 18;
  const choiceW = Math.floor((contentInner.width - gap * 2) / 3);

  renderMainPanel(ctx);
  renderSectionHeader(
    scene,
    contentInner.x + 4,
    contentInner.y + 6,
    `${reward.title.toUpperCase()} / ${state.planetName.toUpperCase()}`,
    reward.description,
    contentInner.width - 180
  );

  createPanel(scene, width - 176, contentInner.y + 8, 132, 124, 0x1a3342);
  createPanel(scene, contentInner.x + 4, contentInner.y + 62, contentInner.width - 180, 72, 0x1a3342);
  renderActiveMechanicEffects(ctx, contentInner.x + 16, contentInner.y + 76, contentInner.width - 204, 3);

  if (scene.textures.exists("reward-cache-sheet")) {
    scene.add
      .image(width - 110, contentInner.y + 70, "reward-cache-sheet")
      .setCrop(0, 0, 128, 128)
      .setDisplaySize(72, 72)
      .setOrigin(0.5);
  }

  createPanel(scene, contentInner.x + 4, contentInner.y + 150, contentInner.width - 8, 96, 0x1a3342);
  renderRerollButton(ctx, width - 180, contentInner.y + 158, 152, onReroll);

  let x = contentInner.x + 4;
  for (const choice of reward.choices) {
    renderRewardChoice(scene, choice, x, contentInner.y + 168, choiceW, () => onChooseReward(choice.id));
    x += choiceW + gap;
  }
}
