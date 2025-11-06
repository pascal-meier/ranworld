let value = 0;
export function generateLoot(scene, boxNr, x, y) {
    // 🔸 Loot-Chancen pro Box
    const lootTables = {
        1: { common: 50, rare: 35, epic: 14, legendary: 1 },
        2: { common: 20, rare: 50, epic: 25, legendary: 5 },
        3: { common: 0, rare: 35, epic: 55, legendary: 10 },
    };
    if (boxNr < 2) {
        boxNr = 1;
    }
    else if (boxNr < 4) {
        boxNr = 2;
    }
    else {
        boxNr = 3;
    }
    const table = lootTables[boxNr];
    if (!table) {
        console.warn("⚠️ Ungültige Boxnummer:", boxNr);
        return ["common", 1];
    }
    // 🔹 Zufallswurf
    const roll = Math.random() * 100;
    let cumulative = 0;
    let result = "common";
    let value = 0;
    for (const [rarity, chance] of Object.entries(table)) {
        cumulative += chance;
        if (roll < cumulative) {
            result = rarity;
            break;
        }
    }
    if (result == "common") {
        value = 5;
    }
    else if (result == "rare") {
        value = 10;
    }
    else if (result == "epic") {
        value = 20;
    }
    else {
        value = 50;
    }
    // 🎨 Farbtabelle für Anzeige
    const colors = {
        common: "#CCCCCC",
        rare: "#3399FF",
        epic: "#AA33FF",
        legendary: "#FFD700",
    };
    // ✨ Text anzeigen
    const lootText = scene.add.text(x, y, result.toUpperCase(), {
        fontSize: "48px",
        fontStyle: "bold",
        color: colors[result],
        stroke: "#000000",
        strokeThickness: 6,
    })
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(0);
    // Tween-Animation (auftauchen → ausblenden)
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
    return [result, value];
}
