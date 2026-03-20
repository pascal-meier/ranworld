import type { MetaProgress } from "../types.js";

const STORAGE_KEY = "randomness-mechanics-lab.meta";

const defaultMeta: MetaProgress = {
  archive: 0,
  completedRuns: 0,
  bestDepth: 0,
  lastSeed: 0,
};

export function loadMeta(): MetaProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...defaultMeta };
    }

    const parsed = JSON.parse(raw) as Partial<MetaProgress>;

    return {
      archive: parsed.archive ?? 0,
      completedRuns: parsed.completedRuns ?? 0,
      bestDepth: parsed.bestDepth ?? 0,
      lastSeed: parsed.lastSeed ?? 0,
    };
  } catch {
    return { ...defaultMeta };
  }
}

export function saveMeta(meta: MetaProgress): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
}
