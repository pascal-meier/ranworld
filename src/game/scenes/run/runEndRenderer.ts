import type { RunRenderContext } from "./shared.js";
import { renderMainPanel } from "./shared.js";
import { createButton } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";

export function renderRunEndPhase(
  ctx: RunRenderContext,
  onReturnToSetup: (mode: "same" | "new") => void
): void {
  const { scene, state, contentInner } = ctx;
  renderMainPanel(ctx);

  scene.add.text(contentInner.x + 4, contentInner.y + 6, "EXPEDITION FAILED", textStyle(16, LAB_THEME.danger)).setOrigin(0);
  scene.add
    .text(
      contentInner.x + 4,
      contentInner.y + 38,
      `Planets crossed ${Math.max(0, state.planet - 1)}\nSurface sites cleared ${state.depth}\nMeta archive ${state.player.archiveGain}`,
      textStyle(10, LAB_THEME.text, "left", contentInner.width - 8)
    )
    .setOrigin(0);

  createButton(scene, {
    x: contentInner.x + 4,
    y: contentInner.y + 140,
    width: 220,
    height: 54,
    label: "SAME SEED",
    detail: "",
    onClick: () => onReturnToSetup("same"),
    fill: 0x1d4d6c,
  });

  createButton(scene, {
    x: contentInner.x + 240,
    y: contentInner.y + 140,
    width: 220,
    height: 54,
    label: "NEW SEED",
    detail: "",
    onClick: () => onReturnToSetup("new"),
  });
}
