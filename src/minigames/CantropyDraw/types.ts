export type SymmetryMode = "off" | "vertical" | "horizontal" | "radial";

export type BoundaryMode = "clamp" | "bleed";

export interface CompositionControls {
  noise: number;
  colorDrift: number;
  variation: number;
  patternShift: number;
}
