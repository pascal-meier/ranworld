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
    { key: "enemy-drone-swarm", path: "assets/actors/enemies/enemy-drone-swarm.png" },
    { key: "enemy-heavy-warden", path: "assets/actors/enemies/enemy-heavy-warden.png" },
    { key: "event-analyst", path: "assets/actors/events/event-analyst.png" },
    { key: "event-terminal", path: "assets/actors/events/event-terminal.png" },
    { key: "illustration-ion-storm", path: "assets/illustrations/events/ion-storm.png" },
    { key: "illustration-echo-vault", path: "assets/illustrations/events/echo-vault.png" },
    { key: "player-idle", path: "assets/actors/player/player-idle.png" },
    { key: "player-guard", path: "assets/actors/player/player-guard.png" },
    { key: "player-focus", path: "assets/actors/player/player-focus.png" },
    { key: "player-hit", path: "assets/actors/player/player-hit.png" },
    { key: "player-low-hp", path: "assets/actors/player/player-low-hp.png" },
    { key: "reward-medkit", path: "assets/actors/rewards/reward-medkit-clean.png" },
    { key: "reward-plating", path: "assets/actors/rewards/reward-plating.png" },
    { key: "reward-supply-crate", path: "assets/actors/rewards/reward-supply-crate-clean.png" },
    { key: "reward-archive-shard", path: "assets/ui/resources/archive-shard-bw.png" },
    { key: "reward-stabilizer-kit", path: "assets/actors/rewards/reward-supply-crate-clean.png" },
    { key: "arena-floor", path: "assets/backgrounds/combat/arena-floor.png" },
    { key: "feedback-win", path: "assets/ui/feedback/win-popup.png" },
    { key: "feedback-fail", path: "assets/ui/feedback/fail-popup.png" },
    { key: "archive-shard", path: "assets/ui/resources/archive-shard-bw.png" },
    { key: "archive-bank", path: "assets/ui/resources/archive-bank.png" },
    { key: "supply-token", path: "assets/ui/resources/supply-token.png" },
    { key: "mechanic-transparency", path: "assets/ui/icons/mechanics/mechanic-transparency.png" },
    { key: "mechanic-reroll", path: "assets/ui/icons/mechanics/mechanic-reroll.png" },
    { key: "mechanic-persistence", path: "assets/ui/icons/mechanics/mechanic-persistence.png" },
    { key: "planet-background", path: "assets/backgrounds/space/planet-background.png" },
    { key: "planet-01", path: "assets/illustrations/planets/planet-01.png" },
    { key: "planet-02", path: "assets/illustrations/planets/planet-02.png" },
    { key: "planet-03", path: "assets/illustrations/planets/planet-03.png" },
    { key: "planet-04", path: "assets/illustrations/planets/planet-04.png" },
    { key: "planet-05", path: "assets/illustrations/planets/planet-05.png" },
    { key: "planet-06", path: "assets/illustrations/planets/planet-06.png" },
    { key: "planet-07", path: "assets/illustrations/planets/planet-07.png" },
  ] as AssetDefinition[]
};
