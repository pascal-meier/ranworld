export type LabPhase =
  | "setup"
  | "planet-select"
  | "draft"
  | "map"
  | "combat"
  | "event"
  | "reward"
  | "run-end";

export type NodeKind = "combat" | "event" | "reward" | "boss" | "flee";

export type TutorialId = "map-basics";

export type MechanicId =
  | "input-randomness"
  | "output-randomness"
  | "environmental-randomness"
  | "mitigation-agency"
  | "biased-expectations"
  | "reroll-mechanics"
  | "probability-transparency"
  | "consistent-rng-feedback"
  | "session-persistence"
  | "variable-reward-schedules"
  | "progressive-probability-systems"
  | "bad-luck-protection"
  | "layered-reward-structures"
  | "soft-failure-compensation";

export interface MetaProgress {
  archive: number;
  completedRuns: number;
  bestPlanet: number;
  lastSeed: number;
  seenTutorials: Partial<Record<TutorialId, boolean>>;
}

export interface NodeDefinition {
  id: string;
  kind: NodeKind;
  lane: number;
  column: number;
  title: string;
  description: string;
  cleared: boolean;
}

export interface CombatAction {
  id: string;
  label: string;
  description: string;
  kind: "attack" | "guard" | "focus" | "stabilize";
  baseHitChance: number;
  baseDamage: number;
  guardGain: number;
  focusGain: number;
}

export interface CombatActionPreview {
  actionId: string;
  shownHitChance: number | null;
  actualHitChance: number | null;
  expectedDamage: string;
  note: string;
}

export interface CombatState {
  enemyName: string;
  enemyRole: "landing" | "boss";
  enemyHp: number;
  enemyMaxHp: number;
  enemyAttack: number;
  round: number;
  environmentName: string;
  environmentDescription: string;
  environmentHitShift: number;
  environmentGuardShift: number;
  expectationBias: number;
  actions: CombatAction[];
  previews: CombatActionPreview[];
  lastSummary: string[];
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  shownChance?: number;
  actualChance?: number;
}

export interface EventState {
  title: string;
  description: string;
  options: EventChoice[];
}

export interface RewardChoice {
  id: string;
  label: string;
  description: string;
  type: "heal" | "max-hp" | "supplies" | "mitigation" | "archive";
  amount: number;
  secondary: string[];
}

export interface RewardState {
  title: string;
  description: string;
  choices: RewardChoice[];
}

export interface MechanicDraftState {
  title: string;
  description: string;
  choices: MechanicId[];
  canSkip: boolean;
}

export interface PlanetChoice {
  id: string;
  name: string;
  imageKey: string;
  description: string;
}

export interface ProbabilityEntry {
  label: string;
  shown: string;
  actual: string;
  note?: string;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  supplies: number;
  focus: number;
  guard: number;
  rerollCharges: number;
  mitigationCharges: number;
  pity: number;
  progressiveScanBonus: number;
  badLuckGuard: number;
  archiveGain: number;
  research: number;
  softFailShield: number;
  legacyBoost: number;
}

export interface RunState {
  seed: number;
  phase: LabPhase;
  depth: number;
  planet: number;
  planetName: string;
  planetChoices: PlanetChoice[];
  selectedPlanetId: string | null;
  selectedPlanetImageKey: string | null;
  currentSite: number;
  sitesPerPlanet: number;
  currentColumn: number;
  map: NodeDefinition[][];
  activeMechanics: MechanicId[];
  retiredMechanics: MechanicId[];
  logs: string[];
  summary: string;
  player: PlayerState;
  combat: CombatState | null;
  event: EventState | null;
  reward: RewardState | null;
  draft: MechanicDraftState | null;
  currentProbabilities: ProbabilityEntry[];
  ended: boolean;
  victory: boolean;
}
