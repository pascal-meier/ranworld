import { createPanel } from "./widgets.js";
import { makeContainer, makeText, type DisplayParent } from "./display.js";
import { LAB_THEME, textStyle } from "./theme.js";

interface TooltipConfig {
  x: number;
  y: number;
  text: string;
  width?: number;
  minHeight?: number;
}

export function attachImageTooltip(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Image,
  parent: DisplayParent,
  config: TooltipConfig
): Phaser.GameObjects.Container {
  const width = config.width ?? 208;
  const tooltip = makeContainer(scene, config.x, config.y, [], parent);
  const copy = makeText(
    scene,
    12,
    10,
    config.text,
    textStyle(8, LAB_THEME.textMuted, "left", width - 24),
    null
  ).setLineSpacing(-2);
  const height = Math.max(config.minHeight ?? 42, Math.ceil(copy.height) + 18);

  createPanel(scene, 0, 0, width, height, 0x0f2230, LAB_THEME.borderSoft, tooltip);
  tooltip.add(copy);
  tooltip.setVisible(false);

  let pinned = false;

  const show = () => {
    parent.bringToTop(tooltip);
    tooltip.setVisible(true);
  };
  const hide = () => {
    if (!pinned) {
      tooltip.setVisible(false);
    }
  };

  target.setInteractive({ useHandCursor: true });
  target.on("pointerover", () => {
    pinned = false;
    show();
  });
  target.on("pointerout", () => {
    pinned = false;
    hide();
  });
  target.on("pointerdown", () => {
    if (pinned) {
      pinned = false;
      tooltip.setVisible(false);
      return;
    }

    pinned = true;
    show();
  });

  return tooltip;
}
