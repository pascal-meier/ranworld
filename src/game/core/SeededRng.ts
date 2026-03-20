export class SeededRng {
  private state: number;
  public drawCount = 0;

  constructor(seed: number | string) {
    const normalized = typeof seed === "number" ? `${seed}` : seed;
    this.state = SeededRng.hash(normalized);
  }

  private static hash(input: string): number {
    let hash = 1779033703 ^ input.length;

    for (let index = 0; index < input.length; index += 1) {
      hash = Math.imul(hash ^ input.charCodeAt(index), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }

    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);

    return (hash ^= hash >>> 16) >>> 0;
  }

  next(): number {
    this.drawCount += 1;
    this.state += 0x6d2b79f5;

    let result = this.state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    const low = Math.ceil(min);
    const high = Math.floor(max);

    return Math.floor(this.next() * (high - low + 1)) + low;
  }

  pick<T>(values: T[]): T {
    return values[this.int(0, values.length - 1)];
  }

  shuffle<T>(values: T[]): T[] {
    const cloned = [...values];

    for (let index = cloned.length - 1; index > 0; index -= 1) {
      const swapIndex = this.int(0, index);
      const temp = cloned[index];
      cloned[index] = cloned[swapIndex];
      cloned[swapIndex] = temp;
    }

    return cloned;
  }

  chance(percent: number): boolean {
    return this.next() * 100 <= percent;
  }
}
