const LOOT_TABLES = {
    1: { common: 50, rare: 35, epic: 14, legendary: 1 },
    2: { common: 20, rare: 50, epic: 25, legendary: 5 },
    3: { common: 0, rare: 35, epic: 55, legendary: 10 },
};
const RARITY_VALUES = {
    common: 5,
    rare: 10,
    epic: 20,
    legendary: 50,
};
export const RARITY_COLORS = {
    common: "#CCCCCC",
    rare: "#3399FF",
    epic: "#AA33FF",
    legendary: "#FFD700",
};
/**
 * ℹ️ Produces a loot result for a clicked box and renders the rarity text. ℹ️
 */
export function generateLoot(scene, boxNr, x, y) {
    const tier = normalizeTier(boxNr);
    const table = LOOT_TABLES[tier];
    const { rarity, roll, ranges } = rollRarity(table);
    const value = RARITY_VALUES[rarity];
    showLootText(scene, rarity, x, y);
    return { rarity, value, tier, roll, ranges };
}
/**
 * ℹ️ Returns the cumulative odds table for the given tier. ℹ️
 */
export function getOddsForTier(tier) {
    const table = LOOT_TABLES[tier];
    let cumulative = 0;
    return Object.entries(table).map(([rarity, chance]) => {
        const min = cumulative;
        cumulative += chance;
        const max = cumulative;
        return { rarity, chance, min, max };
    });
}
/**
 * ℹ️ Converts a box index into the discrete loot tier. ℹ️
 */
function normalizeTier(boxNr) {
    if (boxNr <= 1)
        return 1;
    if (boxNr <= 2)
        return 2;
    return 3;
}
/**
 * ℹ️ Rolls a rarity based on the provided table and records its ranges. ℹ️
 */
function rollRarity(table) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let chosen = null;
    const ranges = [];
    for (const [rarity, chance] of Object.entries(table)) {
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
/**
 * ℹ️ Displays an animated text label representing the awarded rarity. ℹ️
 */
function showLootText(scene, rarity, x, y) {
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
