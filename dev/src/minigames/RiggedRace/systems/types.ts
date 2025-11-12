export interface RunnerConfig {
  id: string;
  name: string;
  texture: string;
  color: number;
  baseSpeed: number; // pixels per second
  variance: number; // +/- fluctuation per second
}

export interface RaceDimensions {
  startX: number;
  finishX: number;
}
