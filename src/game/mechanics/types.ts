import type { SeededRng } from "../core/SeededRng.js";
import type { LabEngine } from "../core/LabEngine.js";
import type {
  CombatAction,
  CombatActionPreview,
  CombatState,
  EventState,
  MechanicId,
  RewardChoice,
  RunState,
} from "../types.js";

export type MechanicLayerId = "L1" | "L2" | "L3" | "L4";
export type MechanicUpgradeTrack = "ship-upgrade" | "world-modifier";
export type MechanicCatalogStatus = "implemented" | "planned";

export interface MechanicTaxonomyMeta {
  tableId: string;
  layerId: MechanicLayerId;
  categoryId: string;
  upgradeTrack: MechanicUpgradeTrack;
  observation: string;
}

export interface MechanicCatalogEntry extends MechanicTaxonomyMeta {
  name: string;
  shortLabel: string;
  status: MechanicCatalogStatus;
  runtimeId?: MechanicId;
  iconKey?: string;
}

export interface ImplementedMechanicMeta extends MechanicTaxonomyMeta {
  name: string;
  shortLabel: string;
  status: "implemented";
  runtimeId: MechanicId;
}

export interface MechanicContext {
  engine: LabEngine;
  state: RunState;
  rng: SeededRng;
  log: (entry: string) => void;
}

export interface ActionResolution {
  action: CombatAction;
  shownHitChance: number | null;
  actualHitChance: number | null;
  chanceShift: number;
  damageShift: number;
  critChance: number;
  critBonus: number;
  hit: boolean;
  damage: number;
  enemyDamage: number;
  prevented: number;
  notes: string[];
}

export interface EventResolution {
  choiceId: string;
  shownChance?: number;
  actualChance?: number;
  success?: boolean;
  notes: string[];
}

export interface RewardSelection {
  choice: RewardChoice;
  notes: string[];
}

export interface MechanicDefinition extends ImplementedMechanicMeta {
  id: MechanicId;
  category: string;
  summary: string;
  detail: string;
  effectText: string;
  iconKey?: string;
  onAdded?: (context: MechanicContext) => void;
  onBuildCombat?: (context: MechanicContext, combat: CombatState) => void;
  onBuildCombatActions?: (
    context: MechanicContext,
    actions: CombatAction[]
  ) => CombatAction[];
  onPreviewCombatAction?: (
    context: MechanicContext,
    preview: CombatActionPreview,
    action: CombatAction
  ) => CombatActionPreview;
  onResolveCombatAction?: (
    context: MechanicContext,
    resolution: ActionResolution
  ) => void;
  onAfterCombatAction?: (
    context: MechanicContext,
    resolution: ActionResolution
  ) => void;
  onAfterCombat?: (
    context: MechanicContext,
    won: boolean,
    notes: string[]
  ) => void;
  onBuildEvent?: (context: MechanicContext, event: EventState) => EventState;
  onResolveEvent?: (
    context: MechanicContext,
    resolution: EventResolution
  ) => void;
  onAfterEventResolution?: (
    context: MechanicContext,
    resolution: EventResolution
  ) => void;
  onBuildRewardChoices?: (
    context: MechanicContext,
    rewards: RewardChoice[]
  ) => RewardChoice[];
  onAfterReward?: (
    context: MechanicContext,
    selection: RewardSelection
  ) => void;
  onBeforeDefeat?: (
    context: MechanicContext,
    source: "combat" | "event"
  ) => boolean;
  getDebugLines?: (context: MechanicContext) => string[];
}
