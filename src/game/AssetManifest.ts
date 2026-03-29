export interface AssetDefinition {
  key: string;
  path: string;
  atlasJson?: string;
}

export const ASSET_MANIFEST = {
  atlases: [
    { key: "ui-icons", path: "assets/atlas/ui-icons.png", atlasJson: "assets/atlas/ui-icons.json" }
  ] as AssetDefinition[],
  
  images: [
    { key: "enemy-warden", path: "assets/actors/enemies/enemy-warden-clean.png" },
    { key: "enemy-scrap-hound", path: "assets/actors/enemies/enemy-scrap-hound-clean.png" },
    { key: "enemy-glass-engine", path: "assets/actors/enemies/enemy-glass-engine-clean.png" },
    { key: "event-analyst", path: "assets/actors/events/event-analyst-v1.png" },
    { key: "player-idle", path: "assets/actors/player/player-idle.png" },
    { key: "player-guard", path: "assets/actors/player/player-guard-v1.png" },
    { key: "player-focus", path: "assets/actors/player/player-focus-v1.png" },
    { key: "player-hit", path: "assets/actors/player/player-hit-v1.png" },
    { key: "player-low-hp", path: "assets/actors/player/player-low-hp-v1.png" },
    { key: "reward-medkit", path: "assets/actors/rewards/reward-medkit-clean.png" },
    { key: "reward-plating", path: "assets/actors/rewards/reward-plating-v1.png" },
    { key: "reward-supply-crate", path: "assets/actors/rewards/reward-supply-crate-clean.png" },
    { key: "reward-archive-shard", path: "assets/ui/resources/archive-shard-bw-v1.png" },
    { key: "reward-stabilizer-kit", path: "assets/actors/rewards/reward-supply-crate-clean.png" },
    { key: "arena-floor", path: "assets/backgrounds/combat/arena-floor-v1.png" },
    { key: "feedback-win", path: "assets/ui/feedback/win-popup-v1.png" },
    { key: "feedback-fail", path: "assets/ui/feedback/fail-popup-v1.png" },
    { key: "archive-shard", path: "assets/ui/resources/archive-shard-bw-v1.png" },
    { key: "archive-bank", path: "assets/ui/resources/archive-bank-v1.png" },
    { key: "supply-token", path: "assets/ui/resources/supply-token-v1.png" },
    { key: "planet-background", path: "assets/backgrounds/space/planet-background-v1.png" },
    { key: "planet-01", path: "assets/illustrations/planets/planet-01.png" },
    { key: "planet-02", path: "assets/illustrations/planets/planet-02.png" },
    { key: "planet-03", path: "assets/illustrations/planets/planet-03.png" },
    { key: "planet-04", path: "assets/illustrations/planets/planet-04.png" },
    { key: "planet-05", path: "assets/illustrations/planets/planet-05.png" },
    { key: "planet-06", path: "assets/illustrations/planets/planet-06.png" },
    { key: "planet-07", path: "assets/illustrations/planets/planet-07.png" },
  ] as AssetDefinition[]
};
