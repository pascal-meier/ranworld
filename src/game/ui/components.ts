import { LAB_THEME, textStyle } from "./theme.js";
import type { LayoutRect } from "./layout.js";
import { UIInfoCard } from "./objects.js";
import { attachDisplayObject, makeContainer, makeImage, makeText, type DisplayParent } from "./display.js";

export function createInfoCard(
  scene: Phaser.Scene,
  rect: LayoutRect,
  title: string,
  body: string | string[],
  titleColor = LAB_THEME.text,
  fill = LAB_THEME.panelAlt,
  parent?: DisplayParent
): Phaser.GameObjects.Container {
  return attachDisplayObject(
    scene,
    new UIInfoCard(scene, rect.x, rect.y, rect.width, rect.height, title, body, titleColor, fill),
    parent
  );
}

export function renderSectionHeader(
  scene: Phaser.Scene,
  x: number,
  y: number,
  title: string,
  subtitle?: string,
  subtitleWidth?: number,
  parent?: DisplayParent
): Phaser.GameObjects.Container {
  const titleText = makeText(scene, 0, 0, title, textStyle(13), null);
  const children: Phaser.GameObjects.GameObject[] = [titleText];

  if (subtitle) {
    const subtitleText = makeText(
      scene,
      0,
      22,
      subtitle,
      textStyle(10, LAB_THEME.textMuted, "left", subtitleWidth),
      null
    );
    children.push(subtitleText);
  }

  return makeContainer(scene, x, y, children, parent);
}

export function renderFittedSprite(
  scene: Phaser.Scene,
  key: string,
  rect: LayoutRect,
  alpha = 1,
  parent?: DisplayParent
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists(key)) {
    return null;
  }

  const texture = scene.textures.get(key).getSourceImage() as { width: number; height: number };
  const scale = Math.min(rect.width / texture.width, rect.height / texture.height);

  return makeImage(
    scene,
    rect.x + rect.width / 2,
    rect.y + rect.height / 2,
    key,
    parent
  )
    .setScale(scale)
    .setAlpha(alpha)
    .setOrigin(0.5);
}
