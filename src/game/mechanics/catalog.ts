import type { MechanicId } from "../types.js";
import type {
  ImplementedMechanicMeta,
  MechanicCatalogEntry,
  MechanicLayerId,
  MechanicUpgradeTrack,
} from "./types.js";

const layerNames: Record<MechanicLayerId, string> = {
  L1: "Structural Randomness Design",
  L2: "Player Appraisal Processes",
  L3: "Experience Outcomes",
  L4: "Design Implications",
};

const categoryNames: Record<string, string> = {
  L1A: "Source / Locus of Randomness",
  L1B: "Temporal Placement",
  L1C: "Gameplay / Mechanic Domain",
  L1D: "Visibility / Legibility of Randomness",
  L1E: "Randomness Constraints",
  L2A: "Perceived Predictability / Uncertainty",
  L2B: "Perceived Fairness",
  L2C: "Perceived Agency",
  L2D: "Expectations",
  L3A: "Emotional Valence",
  L3B: "Engagement / Involvement",
  L3C: "Motivation & Persistence",
  L3D: "Frustration & Disengagement",
  L3E: "Behavioural Adaptation",
  L4A: "Calibrated Uncertainty",
  L4B: "Meaningful Player Agency",
  L4C: "RNG Transparency",
  L4D: "Structured Reward Dynamics",
  L4E: "Frustration Safeguards",
};

function entry(
  tableId: string,
  name: string,
  shortLabel: string,
  categoryId: string,
  upgradeTrack: MechanicUpgradeTrack,
  observation: string,
  runtimeId?: MechanicId
): MechanicCatalogEntry {
  return {
    tableId,
    name,
    shortLabel,
    layerId: tableId.slice(0, 2) as MechanicLayerId,
    categoryId,
    upgradeTrack,
    observation,
    status: runtimeId ? "implemented" : "planned",
    runtimeId,
  };
}

export const mechanicCatalog: MechanicCatalogEntry[] = [
  entry("L1A1", "Input Randomness", "Input RNG", "L1A", "world-modifier", "Watch how the action menu changes before decisions.", "input-randomness"),
  entry("L1A2", "Output Randomness", "Output RNG", "L1A", "world-modifier", "Watch how identical actions resolve differently after you commit.", "output-randomness"),
  entry("L1A3", "Environmental Randomness", "Env RNG", "L1A", "world-modifier", "Watch how the planet itself shifts the odds around the same tools.", "environmental-randomness"),
  entry("L1A4", "Meta-Progression Randomness", "Meta RNG", "L1A", "ship-upgrade", "Watch how long-term run bonuses randomize what each expedition starts with."),
  entry("L1B1", "Pre-Decision Randomness", "Pre-Decision", "L1B", "world-modifier", "Watch how randomness changes the decision before you act."),
  entry("L1B2", "During-Action Randomness", "Mid-Action", "L1B", "world-modifier", "Watch variance unfold while an action is being executed."),
  entry("L1B3", "Post-Outcome Randomness", "Post-Outcome", "L1B", "world-modifier", "Watch rewards and fallout shift after the action resolves."),
  entry("L1B4", "Long-Term Randomness", "Long-Term", "L1B", "ship-upgrade", "Watch effects that only become visible across several planets."),
  entry("L1C1", "Combat Systems", "Combat Sys", "L1C", "world-modifier", "Watch combat numbers and encounter pressure become the randomness carrier."),
  entry("L1C2", "Resource & Reward Systems", "Reward Sys", "L1C", "world-modifier", "Watch randomness move into loot, supplies, and archive income."),
  entry("L1C3", "Rule / Event Systems", "Rule Event", "L1C", "world-modifier", "Watch events rewrite local rules rather than just numbers."),
  entry("L1C4", "Progression Systems", "Progression", "L1C", "ship-upgrade", "Watch randomness shape long-term unlocks and run growth."),
  entry("L1D1", "Explicit Randomness", "Explicit RNG", "L1D", "world-modifier", "Watch how visible probabilities change trust and planning."),
  entry("L1D2", "Implicit Randomness", "Implicit RNG", "L1D", "world-modifier", "Watch hidden but felt randomness without direct number displays."),
  entry("L1D3", "Opaque Randomness", "Opaque RNG", "L1D", "world-modifier", "Watch how hard-to-read randomness affects confidence."),
  entry("L1D4", "Framed / Manipulated Randomness", "Framed RNG", "L1D", "world-modifier", "Watch presentation steer interpretation of the same roll outcomes."),
  entry("L1E1", "Unconstrained Randomness", "Free RNG", "L1E", "world-modifier", "Watch what happens when variance is left fully open."),
  entry("L1E2", "Soft Constraints", "Soft Caps", "L1E", "world-modifier", "Watch light safety rails smooth spikes without removing chance."),
  entry("L1E3", "Hard Constraints", "Hard Caps", "L1E", "world-modifier", "Watch guarantees and hard limits clamp extreme outcomes."),
  entry("L1E4", "Adaptive / Dynamic Constraints", "Adaptive RNG", "L1E", "world-modifier", "Watch the system react to the current run state."),
  entry("L2A1", "Information Uncertainty", "Info Fog", "L2A", "world-modifier", "Watch how missing information changes confidence before selection."),
  entry("L2A2", "Outcome Variability", "Swinginess", "L2A", "world-modifier", "Watch repeated choices produce unstable result ranges."),
  entry("L2A3", "Environmental Complexity", "Complexity", "L2A", "world-modifier", "Watch layered systems make consequences harder to forecast."),
  entry("L2B1", "Distributive Fairness", "Dist Fair", "L2B", "world-modifier", "Watch whether rewards and punishments feel proportionate."),
  entry("L2B2", "Procedural Fairness", "Proc Fair", "L2B", "world-modifier", "Watch whether the rules feel fair even when outcomes sting."),
  entry("L2B3", "Interactional Fairness", "Feedback Fair", "L2B", "world-modifier", "Watch whether the game explains outcomes respectfully and consistently."),
  entry("L2C1", "Decision Agency", "Decision AG", "L2C", "ship-upgrade", "Watch whether the player still feels they made the meaningful choice."),
  entry("L2C2", "Skill Agency", "Skill AG", "L2C", "ship-upgrade", "Watch whether execution and timing can offset randomness."),
  entry("L2C3", "Mitigation Agency", "Mitigation", "L2C", "ship-upgrade", "Watch how explicit counter-tools soften risky systems.", "mitigation-agency"),
  entry("L2D1", "Accurate Expectations", "True Odds", "L2D", "world-modifier", "Watch how well shown odds line up with actual outcomes."),
  entry("L2D2", "Biased Expectations", "Bias", "L2D", "world-modifier", "Watch how displayed information bends player expectation.", "biased-expectations"),
  entry("L2D3", "Design-Induced Expectations", "Design Bias", "L2D", "world-modifier", "Watch how visual framing primes beliefs before the roll."),
  entry("L2D4", "Expectation–Outcome Misalignment", "Misalign", "L2D", "world-modifier", "Watch how mismatch between belief and result lands emotionally."),
  entry("L3A1", "Positive High-Arousal States", "High Hype", "L3A", "world-modifier", "Watch when randomness creates excitement spikes."),
  entry("L3A2", "Negative High-Arousal States", "High Stress", "L3A", "world-modifier", "Watch when randomness turns into anger or panic."),
  entry("L3A3", "Affective Disengagement", "Flatline", "L3A", "world-modifier", "Watch when the system stops generating emotional response."),
  entry("L3B1", "Attentional Engagement", "Attention", "L3B", "world-modifier", "Watch when randomness increases immediate focus."),
  entry("L3B2", "Cognitive Processing Engagement", "Cognition", "L3B", "ship-upgrade", "Watch when randomness forces deeper planning and comparison."),
  entry("L3B3", "Situational Immersion", "Immersion", "L3B", "world-modifier", "Watch when uncertainty makes planets feel alive."),
  entry("L3C1", "Micro Persistence", "Keep Going", "L3C", "ship-upgrade", "Watch what makes the player take one more step."),
  entry("L3C2", "Session Persistence", "Persistence", "L3C", "ship-upgrade", "Watch how previous runs feed the next run's momentum.", "session-persistence"),
  entry("L3C3", "Long-Term Persistence", "Long-Term", "L3C", "ship-upgrade", "Watch what keeps the player returning beyond one session."),
  entry("L3D1", "Outcome Frustration", "Tilt", "L3D", "world-modifier", "Watch frustration created by bad individual rolls."),
  entry("L3D2", "Systemic Frustration", "System Tilt", "L3D", "world-modifier", "Watch frustration with the system as a whole."),
  entry("L3D3", "Persistence Frustration", "Grind Fatigue", "L3D", "ship-upgrade", "Watch when long-run randomness turns into exhaustion."),
  entry("L3D4", "Disengagement Threshold", "Drop-Off", "L3D", "world-modifier", "Watch where the player would likely stop engaging."),
  entry("L3E1", "Risk Regulation", "Risk Reg", "L3E", "ship-upgrade", "Watch how players adapt by becoming safer or greedier."),
  entry("L3E2", "Strategy Optimization", "Optimize", "L3E", "ship-upgrade", "Watch how players learn to route around randomness."),
  entry("L3E3", "RNG Management Strategies", "RNG Mgmt", "L3E", "ship-upgrade", "Watch how players exploit, buffer, or set up randomness."),
  entry("L3E4", "Playstyle Shift", "Style Shift", "L3E", "ship-upgrade", "Watch how mechanics permanently alter play habits."),
  entry("L4A1", "Variance Tuning", "Variance", "L4A", "world-modifier", "Watch the spread of outcomes become tighter or wider."),
  entry("L4A2", "Probability Weighting", "Weighting", "L4A", "world-modifier", "Watch behind-the-scenes weighting change odds without changing labels."),
  entry("L4A3", "Randomness Caps", "RNG Caps", "L4A", "world-modifier", "Watch extreme highs and lows get cut off."),
  entry("L4A4", "Dynamic RNG Adjustment", "Dyn Adjust", "L4A", "world-modifier", "Watch the system rebalance odds mid-run."),
  entry("L4B1", "Re-Roll Mechanics", "Re-Roll", "L4B", "ship-upgrade", "Watch how rerolls change commitment and regret.", "reroll-mechanics"),
  entry("L4B2", "Build Preparation Systems", "Prep Build", "L4B", "ship-upgrade", "Watch how preparation changes the value of uncertainty."),
  entry("L4B3", "Risk–Reward Choice Design", "Risk Reward", "L4B", "world-modifier", "Watch how the game offers cleaner danger-vs-payoff choices."),
  entry("L4B4", "Control Feedback Signals", "Ctrl Signals", "L4B", "world-modifier", "Watch how feedback can make players feel more in control."),
  entry("L4C1", "Probability Transparency", "Prob UI", "L4C", "world-modifier", "Watch how visible odds affect trust and planning.", "probability-transparency"),
  entry("L4C2", "Consistent RNG Feedback", "RNG Feedback", "L4C", "world-modifier", "Watch whether the game explains random outcomes consistently.", "consistent-rng-feedback"),
  entry("L4C3", "Pattern Learnability", "Patterns", "L4C", "world-modifier", "Watch whether the system reveals patterns players can learn."),
  entry("L4C4", "Outcome Causality Clarity", "Cause Clarity", "L4C", "world-modifier", "Watch how clearly actions connect to outcomes."),
  entry("L4D1", "Variable Reward Schedules", "Var Rewards", "L4D", "world-modifier", "Watch reward timing and size stay enticing through variability.", "variable-reward-schedules"),
  entry("L4D2", "Progressive Probability Systems", "Prog Odds", "L4D", "world-modifier", "Watch odds climb over time or attempts.", "progressive-probability-systems"),
  entry("L4D3", "Layered Reward Structures", "Layered", "L4D", "world-modifier", "Watch short-term and long-term rewards stack together.", "layered-reward-structures"),
  entry("L4D4", "Anticipation Cycle Design", "Anticipation", "L4D", "world-modifier", "Watch delayed resolution build suspense before payoff."),
  entry("L4E1", "Pity Systems", "Pity", "L4E", "world-modifier", "Watch guarantees arrive after enough bad luck."),
  entry("L4E2", "Bad-Luck Protection", "Luck Guard", "L4E", "ship-upgrade", "Watch safety nets reduce extreme negative streaks.", "bad-luck-protection"),
  entry("L4E3", "Soft Failure Compensation", "Soft Failure", "L4E", "ship-upgrade", "Watch small recovery tools appear after setbacks.", "soft-failure-compensation"),
  entry("L4E4", "Psychological Recovery Windows", "Recovery", "L4E", "world-modifier", "Watch lower-pressure moments cool the run back down."),
];

const implementedMetaMap = new Map<MechanicId, ImplementedMechanicMeta>(
  mechanicCatalog
    .filter((entry): entry is ImplementedMechanicMeta => entry.status === "implemented" && Boolean(entry.runtimeId))
    .map((entry) => [entry.runtimeId, entry])
);

export function getImplementedMechanicMeta(id: MechanicId): ImplementedMechanicMeta {
  const entry = implementedMetaMap.get(id);

  if (!entry) {
    throw new Error(`Missing mechanic catalog metadata for ${id}.`);
  }

  return entry;
}

export function getLayerName(layerId: MechanicLayerId): string {
  return layerNames[layerId];
}

export function getCategoryName(categoryId: string): string {
  return categoryNames[categoryId] ?? categoryId;
}

export function getUpgradeTrackLabel(track: MechanicUpgradeTrack): string {
  return track === "ship-upgrade" ? "Ship Upgrade" : "World Modifier";
}

export const implementedMechanicCount = mechanicCatalog.filter(
  (entry) => entry.status === "implemented"
).length;

export const plannedMechanicCount = mechanicCatalog.filter(
  (entry) => entry.status === "planned"
).length;
