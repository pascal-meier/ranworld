export class RandomSeed {
  private generator: Phaser.Math.RandomDataGenerator;
  private currentSeed: string;

  // ℹ️ Builds a deterministic random generator using either the provided or a fresh seed ℹ️
  constructor(seed?: string) {
    this.currentSeed = seed ?? this.generateSeedString();
    this.generator = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
  }

  // ℹ️ Exposes the currently active seed so it can be shown in the HUD ℹ️
  getSeed(): string {
    return this.currentSeed;
  }

  // ℹ️ Reinitializes the generator with a new seed to change the composition outcome ℹ️
  reseed(seed?: string): void {
    this.currentSeed = seed ?? this.generateSeedString();
    this.generator = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
  }

  // ℹ️ Resets the generator to the beginning of the current seed for deterministic replays ℹ️
  replay(): void {
    this.generator = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
  }

  // ℹ️ Provides a convenient passthrough for random fractional values ℹ️
  frac(): number {
    return this.generator.frac();
  }

  // ℹ️ Returns deterministic integers between the supplied bounds ℹ️
  between(min: number, max: number): number {
    return this.generator.between(min, max);
  }

  // ℹ️ Selects an item from a list using the seeded random generator ℹ️
  pick<T>(values: readonly T[]): T {
    return this.generator.pick(values as T[]);
  }

  // ℹ️ Performs weighted selection so brighter/darker palettes can be biased ℹ️
  weightedPick<T>(entries: { value: T; weight: number }[]): T {
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    const threshold = this.frac() * total;
    let accumulator = 0;
    for (const entry of entries) {
      accumulator += entry.weight;
      if (threshold <= accumulator) return entry.value;
    }
    return entries[entries.length - 1].value;
  }

  // ℹ️ Generates a compact uppercase hex string to act as a readable seed ID ℹ️
  private generateSeedString(): string {
    const random = Math.floor(Math.random() * 0xfffff);
    return random.toString(16).toUpperCase();
  }
}
