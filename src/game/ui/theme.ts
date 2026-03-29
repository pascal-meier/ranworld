export const LAB_THEME = {
  background: 0x07121b,
  panel: 0x112531,
  panelAlt: 0x1a3342,
  panelMuted: 0x17352d,
  panelLine: 0x284d5d,
  panelShadow: 0x03080c,
  border: 0x78d7ff,
  borderSoft: 0x406879,
  accentFill: 0xffc857,
  text: "#e9f4ff",
  textMuted: "#91afbf",
  accent: "#ffc857",
  positive: "#8ce5c2",
  danger: "#ff8b8b",
  tag: 0x203948,
  font: '"Pixelify Sans", monospace',
};

export function textStyle(
  size: number,
  color = LAB_THEME.text,
  align: "left" | "center" | "right" = "left",
  wrapWidth?: number
): Phaser.Types.GameObjects.Text.TextStyle {
  const resolvedSize = Math.max(10, size);

  return {
    fontFamily: LAB_THEME.font,
    fontSize: `${resolvedSize}px`,
    fontStyle: resolvedSize >= 12 ? "bold" : "normal",
    color,
    align,
    lineSpacing: 0,
    resolution: 1,
    padding: { x: 0, y: 1 },
    ...(wrapWidth ? { wordWrap: { width: Math.max(10, wrapWidth), useAdvancedWrap: true } } : {}),
  };
}
