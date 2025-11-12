export type RythmPhaseKey = "memoryWarmup" | "syncShift" | "chaosGroove";

export interface PhaseDefinition {
  key: RythmPhaseKey;
  title: string;
  description: string;
  roundsRequired: number | null;
}

export interface NoteVariation {
  rate: number;
  detune: number;
  delayFactor: number;
}

export interface MelodyPlan {
  notes: number[];
  variations: NoteVariation[];
  chanceIntensity: number;
  chanceLabel: string;
}
