import { LAB_THEME, textStyle } from "./theme.js";
import type { LayoutRect } from "./layout.js";
import { UIInfoCard } from "./objects.js";

export function createInfoCard(
  scene: Phaser.Scene,
  rect: LayoutRect,
  title: string,
  body: string | string[],
  titleColor = LAB_THEME.text,
  fill = LAB_THEME.panelAlt
): Phaser.GameObjects.Container {
  return new UIInfoCard(scene, rect.x, rect.y, rect.width, rect.height, title, body, titleColor, fill);
}

export function renderSectionHeader(
  scene: Phaser.Scene,
  x: number,
  y: number,
  title: string,
  subtitle?: string,
  subtitleWidth?: number
): Phaser.GameObjects.Container {
  const titleText = scene.add.text(x, y, title, textStyle(13)).setOrigin(0);
  const children: Phaser.GameObjects.GameObject[] = [titleText];

  if (subtitle) {
    const subtitleText = scene.add
      .text(x, y + 22, subtitle, textStyle(10, LAB_THEME.textMuted, "left", subtitleWidth))
      .setOrigin(0);
    children.push(subtitleText);
  }

  return scene.add.container(0, 0, children);
}

export function renderFittedSprite(
  scene: Phaser.Scene,
  key: string,
  rect: LayoutRect,
  alpha = 1
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists(key)) {
    return null;
  }

  const texture = scene.textures.get(key).getSourceImage() as { width: number; height: number };
  const scale = Math.min(rect.width / texture.width, rect.height / texture.height);

  return scene.add
    .image(rect.x + rect.width / 2, rect.y + rect.height / 2, key)
    .setScale(scale)
    .setAlpha(alpha)
    .setOrigin(0.5);
}
