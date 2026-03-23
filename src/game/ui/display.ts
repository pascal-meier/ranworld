export type DisplayParent = Phaser.GameObjects.Container;
type DisplayTarget = DisplayParent | null | undefined;

export function attachDisplayObject<T extends Phaser.GameObjects.GameObject>(
  scene: Phaser.Scene,
  gameObject: T,
  parent?: DisplayTarget
): T {
  if (parent === null) {
    return gameObject;
  }

  if (parent) {
    parent.add(gameObject);
    return gameObject;
  }

  scene.add.existing(gameObject);
  return gameObject;
}

export function makeContainer(
  scene: Phaser.Scene,
  x = 0,
  y = 0,
  children: Phaser.GameObjects.GameObject[] = [],
  parent?: DisplayTarget
): Phaser.GameObjects.Container {
  return attachDisplayObject(scene, new Phaser.GameObjects.Container(scene, x, y, children), parent);
}

export function makeRectangle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: number,
  fillAlpha = 1,
  parent?: DisplayTarget
): Phaser.GameObjects.Rectangle {
  const rectangle = new Phaser.GameObjects.Rectangle(scene, x, y, width, height, fillColor, fillAlpha).setOrigin(0);
  return attachDisplayObject(scene, rectangle, parent);
}

export function makeCircle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  fillColor: number,
  fillAlpha = 1,
  parent?: DisplayTarget
): Phaser.GameObjects.Arc {
  const circle = new Phaser.GameObjects.Arc(scene, x, y, radius, 0, 360, false, fillColor, fillAlpha);
  return attachDisplayObject(scene, circle, parent);
}

export function makeText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: Phaser.Types.GameObjects.Text.TextStyle,
  parent?: DisplayTarget
): Phaser.GameObjects.Text {
  const gameText = new Phaser.GameObjects.Text(scene, x, y, text, style).setOrigin(0);
  return attachDisplayObject(scene, gameText, parent);
}

export function makeImage(
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  parent?: DisplayTarget
): Phaser.GameObjects.Image {
  return attachDisplayObject(scene, new Phaser.GameObjects.Image(scene, x, y, key), parent);
}

export function makeGraphics(
  scene: Phaser.Scene,
  parent?: DisplayTarget
): Phaser.GameObjects.Graphics {
  return attachDisplayObject(scene, new Phaser.GameObjects.Graphics(scene), parent);
}
