export type Rarity = "common" | "rare" | "epic" | "legendary";
export type BoxTier = 1 | 2 | 3;

export interface LootRange {
  rarity: Rarity;
  chance: number;
  min: number;
  max: number;
}

export interface LootResult {
  rarity: Rarity;
  value: number;
  tier: BoxTier;
  roll: number;
  ranges: LootRange[];
}

const LOOT_TABLES: Record<BoxTier, Record<Rarity, number>> = {
  1: { common: 50, rare: 35, epic: 14, legendary: 1 },
  2: { common: 20, rare: 50, epic: 25, legendary: 5 },
  3: { common: 0, rare: 35, epic: 55, legendary: 10 },
};

const RARITY_VALUES: Record<Rarity, number> = {
  common: 5,
  rare: 10,
  epic: 20,
  legendary: 50,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: "#CCCCCC",
  rare: "#3399FF",
  epic: "#AA33FF",
  legendary: "#FFD700",
};

export function generateLoot(
  scene: Phaser.Scene,
  boxNr: number,
  x: number,
  y: number
): LootResult {
  const tier = normalizeTier(boxNr);
  const table = LOOT_TABLES[tier];
  const { rarity, roll, ranges } = rollRarity(table);
  const value = RARITY_VALUES[rarity];

  showLootText(scene, rarity, x, y);

  return { rarity, value, tier, roll, ranges };
}

export function getOddsForTier(tier: BoxTier): LootRange[] {
  const table = LOOT_TABLES[tier];
  let cumulative = 0;
  return (Object.entries(table) as [Rarity, number][]).map(([rarity, chance]) => {
    const min = cumulative;
    cumulative += chance;
    const max = cumulative;
    return { rarity, chance, min, max };
  });
}

function normalizeTier(boxNr: number): BoxTier {
  if (boxNr < 2) return 1;
  if (boxNr < 4) return 2;
  return 3;
}

function rollRarity(table: Record<Rarity, number>): { rarity: Rarity; roll: number; ranges: LootRange[] } {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let chosen: Rarity | null = null;
  const ranges: LootRange[] = [];

  for (const [rarity, chance] of Object.entries(table) as [Rarity, number][]) {
    const min = cumulative;
    cumulative += chance;
    const max = cumulative;
    ranges.push({ rarity, chance, min, max });

    if (roll >= min && roll < max && chosen === null) {
      chosen = rarity;
    }
  }

  return { rarity: chosen ?? "common", roll, ranges };
}

function showLootText(scene: Phaser.Scene, rarity: Rarity, x: number, y: number): void {
  const lootText = scene.add
    .text(x, y, rarity.toUpperCase(), {
      fontSize: "48px",
      fontStyle: "bold",
      color: RARITY_COLORS[rarity],
      stroke: "#000000",
      strokeThickness: 6,
    })
    .setOrigin(0.5)
    .setAlpha(0)
    .setScale(0);

  scene.tweens.add({
    targets: lootText,
    alpha: 1,
    scale: 1,
    duration: 400,
    ease: "Back.Out",
    onComplete: () => {
      scene.tweens.add({
        targets: lootText,
        alpha: 0,
        duration: 900,
        delay: 700,
        onComplete: () => lootText.destroy(),
      });
    },
  });
}
