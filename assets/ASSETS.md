# Asset Guide

This project is intentionally small, but it should still feel readable and game-like.
The goal is not lots of content. The goal is strong presentation for a controlled prototype.

## MVP Needs

### UI
- [ ] `assets/ui/panels/panel-main.png`
- [ ] `assets/ui/panels/panel-muted.png`
- [ ] `assets/ui/buttons/button-primary.png`
- [ ] `assets/ui/buttons/button-secondary.png`
- [ ] `assets/ui/buttons/button-hover.png`

### Icons: system
- [ ] `assets/ui/icons/system/icon-hp.png`
- [ ] `assets/ui/icons/system/icon-guard.png`
- [ ] `assets/ui/icons/system/icon-focus.png`
- [ ] `assets/ui/icons/system/icon-supplies.png`
- [ ] `assets/ui/icons/system/icon-seed.png`
- [ ] `assets/ui/icons/system/icon-archive.png`
- [ ] `assets/ui/icons/system/icon-research.png`
- [ ] `assets/ui/icons/system/icon-warning.png`

### Resources
- [x] `assets/ui/resources/archive-shard-bw-v1.png`
- [x] `assets/ui/resources/archive-bank-v1.png`
- [x] `assets/ui/resources/supply-token-v1.png`

### Icons: nodes
- [ ] `assets/ui/icons/nodes/node-combat.png`
- [ ] `assets/ui/icons/nodes/node-event.png`
- [ ] `assets/ui/icons/nodes/node-reward.png`
- [ ] `assets/ui/icons/nodes/node-draft.png`

### Icons: mechanics
- [ ] `assets/ui/icons/mechanics/mechanic-input-randomness.png`
- [ ] `assets/ui/icons/mechanics/mechanic-output-randomness.png`
- [ ] `assets/ui/icons/mechanics/mechanic-environmental-randomness.png`
- [ ] `assets/ui/icons/mechanics/mechanic-mitigation-agency.png`
- [ ] `assets/ui/icons/mechanics/mechanic-biased-expectations.png`
- [ ] `assets/ui/icons/mechanics/mechanic-session-persistence.png`
- [ ] `assets/ui/icons/mechanics/mechanic-layered-reward-structures.png`
- [ ] `assets/ui/icons/mechanics/mechanic-soft-failure-compensation.png`

## Less Text-Based Presentation Layer

### Player: portrait or simple actor
- [ ] `assets/actors/player/player-idle.png`
- [ ] `assets/actors/player/player-guard.png`
- [ ] `assets/actors/player/player-focus.png`
- [ ] `assets/actors/player/player-hit.png`
- [ ] `assets/actors/player/player-low-hp.png`

### Enemies: same mechanics, different visual shells
- [ ] `assets/actors/enemies/enemy-calibration-drone.png`
- [ ] `assets/actors/enemies/enemy-scrap-hound.png`
- [ ] `assets/actors/enemies/enemy-glass-engine.png`

### Event presenters
- [ ] `assets/actors/events/event-analyst.png`
- [ ] `assets/actors/events/event-terminal.png`

### Reward presenters
- [ ] `assets/actors/rewards/reward-cache.png`
- [ ] `assets/actors/rewards/reward-archive-shard.png`
- [ ] `assets/actors/rewards/reward-stabilizer-kit.png`

### Intent icons
- [ ] `assets/ui/icons/intents/intent-attack.png`
- [ ] `assets/ui/icons/intents/intent-guard.png`
- [ ] `assets/ui/icons/intents/intent-focus.png`
- [ ] `assets/ui/icons/intents/intent-risk.png`
- [ ] `assets/ui/icons/intents/intent-reward.png`

### Status overlays
- [ ] `assets/ui/icons/status/status-hit.png`
- [ ] `assets/ui/icons/status/status-miss.png`
- [ ] `assets/ui/icons/status/status-crit.png`
- [ ] `assets/ui/icons/status/status-block.png`
- [ ] `assets/ui/icons/status/status-heal.png`
- [ ] `assets/ui/icons/status/status-warning.png`

### Encounter art
- [ ] `assets/illustrations/encounters/encounter-combat.png`
- [ ] `assets/illustrations/events/event-signal-cache.png`
- [ ] `assets/illustrations/rewards/reward-cache-scene.png`

### Environment backdrops
- [ ] `assets/backgrounds/environments/env-controlled-chamber.png`
- [ ] `assets/backgrounds/environments/env-ion-storm.png`
- [ ] `assets/backgrounds/environments/env-clear-corridor.png`
- [ ] `assets/backgrounds/environments/env-dust-field.png`
- [ ] `assets/backgrounds/environments/env-echo-vault.png`

### Stage props
- [ ] `assets/props/combat/prop-console.png`
- [ ] `assets/props/combat/prop-barrier.png`
- [ ] `assets/props/combat/prop-sparks.png`
- [ ] `assets/props/events/prop-terminal.png`
- [ ] `assets/props/rewards/prop-crate.png`

### VFX
- [ ] `assets/vfx/combat/vfx-hit.png`
- [ ] `assets/vfx/combat/vfx-miss.png`
- [ ] `assets/vfx/combat/vfx-crit.png`
- [ ] `assets/vfx/combat/vfx-block.png`
- [ ] `assets/vfx/ui/vfx-reward-pick.png`
- [ ] `assets/vfx/ui/vfx-mechanic-pick.png`

### Audio
- [ ] `assets/audio/ui/sfx-ui-click.wav`
- [ ] `assets/audio/ui/sfx-ui-confirm.wav`
- [ ] `assets/audio/combat/sfx-hit.wav`
- [ ] `assets/audio/combat/sfx-miss.wav`
- [ ] `assets/audio/combat/sfx-block.wav`
- [ ] `assets/audio/combat/sfx-crit.wav`
- [ ] `assets/audio/rewards/sfx-reward.wav`
- [ ] `assets/audio/ambient/amb-lab-loop.wav`

## Naming Rules

- Use lowercase kebab-case only.
- Prefix by purpose: `icon-`, `node-`, `mechanic-`, `player-`, `enemy-`, `event-`, `reward-`, `intent-`, `status-`, `env-`, `prop-`, `vfx-`, `sfx-`, `amb-`.
- Keep one concept per file.
- Prefer PNG for UI, icons, simple actor art, and VFX.
- Prefer WAV for short SFX. Use OGG or WAV for ambient loops.

## Suggested Sizes

- System icons: `32x32` or `48x48`
- Node icons: `64x64`
- Mechanic icons: `64x64`
- Intent and status icons: `32x32` to `64x64`
- Player and enemy portraits: `256x256` to `512x512`
- Simple actor busts: around `384x384`
- Encounter illustrations: around `512x512`
- Environment backdrops: around `1280x720`
- Props: around `128x128` to `256x256`
- Panel/button slices: power-of-two friendly, e.g. `256x64`, `512x256`

## Recommended First Pass

- [ ] `assets/ui/icons/nodes/node-combat.png`
- [ ] `assets/ui/icons/nodes/node-event.png`
- [ ] `assets/ui/icons/nodes/node-reward.png`
- [ ] `assets/ui/icons/mechanics/mechanic-input-randomness.png`
- [ ] `assets/ui/icons/mechanics/mechanic-output-randomness.png`
- [ ] `assets/ui/icons/mechanics/mechanic-environmental-randomness.png`
- [ ] `assets/ui/icons/mechanics/mechanic-mitigation-agency.png`
- [ ] `assets/actors/player/player-idle.png`
- [ ] `assets/actors/enemies/enemy-calibration-drone.png`
- [ ] `assets/actors/events/event-terminal.png`
- [ ] `assets/actors/rewards/reward-cache.png`
- [ ] `assets/backgrounds/environments/env-controlled-chamber.png`

## Priority Order

- [ ] 1. Node icons
- [ ] 2. Mechanic icons
- [ ] 3. Player + one enemy + one event presenter + one reward presenter
- [ ] 4. Core environment backdrop
- [ ] 5. Button and panel assets
- [ ] 6. Intent and status icons
- [ ] 7. Core SFX
- [ ] 8. Extra enemies, props, and VFX polish
