export function rngPoint(width: number, height: number): { x: number; y: number } {
  const x = Math.floor(Math.random() * width);
  const y = Math.floor(Math.random() * height);
  return { x, y };
}
