export class RandomSeed {
    generator;
    currentSeed;
    // ℹ️ Builds a deterministic random generator using either the provided or a fresh seed ℹ️
    constructor(seed) {
        this.currentSeed = seed ?? this.generateSeedString();
        this.generator = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
    }
    // ℹ️ Exposes the currently active seed so it can be shown in the HUD ℹ️
    getSeed() {
        return this.currentSeed;
    }
    // ℹ️ Reinitializes the generator with a new seed to change the composition outcome ℹ️
    reseed(seed) {
        this.currentSeed = seed ?? this.generateSeedString();
        this.generator = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
    }
    // ℹ️ Resets the generator to the beginning of the current seed for deterministic replays ℹ️
    replay() {
        this.generator = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
    }
    // ℹ️ Provides a convenient passthrough for random fractional values ℹ️
    frac() {
        return this.generator.frac();
    }
    // ℹ️ Returns deterministic integers between the supplied bounds ℹ️
    between(min, max) {
        return this.generator.between(min, max);
    }
    // ℹ️ Selects an item from a list using the seeded random generator ℹ️
    pick(values) {
        return this.generator.pick(values);
    }
    // ℹ️ Performs weighted selection so brighter/darker palettes can be biased ℹ️
    weightedPick(entries) {
        const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
        const threshold = this.frac() * total;
        let accumulator = 0;
        for (const entry of entries) {
            accumulator += entry.weight;
            if (threshold <= accumulator)
                return entry.value;
        }
        return entries[entries.length - 1].value;
    }
    // ℹ️ Generates a compact uppercase hex string to act as a readable seed ID ℹ️
    generateSeedString() {
        const random = Math.floor(Math.random() * 0xfffff);
        return random.toString(16).toUpperCase();
    }
}
