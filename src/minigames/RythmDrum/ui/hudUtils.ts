export function clampValue(value: number, min: number, max: number): number {
  return Phaser.Math.Clamp(value, min, max);
}

export function getChanceColor(intensity: number): string {
  if (intensity <= 0.2) {
    return "#6befa8";
  }
  if (intensity <= 0.5) {
    return "#ffd369";
  }
  return "#ff5c8d";
}

export function createText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: Phaser.Types.GameObjects.Text.TextStyle,
  originX = 0.5,
  originY = 0.5,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, style).setOrigin(originX, originY);
}

