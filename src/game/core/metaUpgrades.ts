export interface MetaUpgrade {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  costs: number[]; // Index 0 is cost for level 1
}

export const META_UPGRADES: MetaUpgrade[] = [
  {
    id: "hp-augment",
    name: "HULL REINFORCEMENT",
    description: "Permanently increases starting Maximum HP by +10 per level.",
    maxLevel: 3,
    costs: [100, 250, 500]
  },
  {
    id: "supply-line",
    name: "SUPPLY LOGISTICS",
    description: "Start each run with +1 additional supply token per level.",
    maxLevel: 2,
    costs: [150, 450]
  },
  {
    id: "focus-calibration",
    name: "FOCUS CALIBRATION",
    description: "+5% inherent Accuracy bonus (Legacy Boost).",
    maxLevel: 3,
    costs: [200, 400, 800]
  }
];

export function getUpgradeLevel(upgrades: Record<string, number>, id: string): number {
  return upgrades[id] || 0;
}

export function canAffordUpgrade(archive: number, upgrade: MetaUpgrade, currentLevel: number): boolean {
  if (currentLevel >= upgrade.maxLevel) return false;
  return archive >= upgrade.costs[currentLevel];
}

export function getUpgradeCost(upgrade: MetaUpgrade, currentLevel: number): number | null {
  if (currentLevel >= upgrade.maxLevel) return null;
  return upgrade.costs[currentLevel];
}
