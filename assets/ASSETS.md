# Asset Guide

This project is intentionally small, but it should still feel readable and game-like.
The goal is not lots of content. The goal is strong presentation for a controlled prototype.

## MVP Needs

### UI
- [x] `assets/ui/panels/panel-main.png`
- [x] `assets/ui/panels/panel-muted.png`
- [x] `assets/ui/buttons/button-primary.png`
- [x] `assets/ui/buttons/button-secondary.png`
- [x] `assets/ui/buttons/button-hover.png`

### Icons: system
- [x] `assets/ui/icons/system/icon-hp.png`
- [x] `assets/ui/icons/system/icon-guard.png`
- [x] `assets/ui/icons/system/icon-focus.png`
- [x] `assets/ui/icons/system/icon-supplies.png`
- [x] `assets/ui/icons/system/icon-seed.png`
- [x] `assets/ui/icons/system/icon-archive.png`
- [x] `assets/ui/icons/system/icon-research.png`
- [x] `assets/ui/icons/system/icon-warning.png`

### Resources
- [x] `assets/ui/resources/archive-shard-bw-v1.png`
- [x] `assets/ui/resources/archive-bank-v1.png`
- [x] `assets/ui/resources/supply-token-v1.png`

### Icons: nodes
- [x] `assets/ui/icons/nodes/node-combat.png`
- [x] `assets/ui/icons/nodes/node-event.png`
- [x] `assets/ui/icons/nodes/node-reward.png`
- [x] `assets/ui/icons/nodes/node-draft.png`

### Icons: mechanics
- [x] `assets/ui/icons/mechanics/mechanic-input-randomness.png`
- [x] `assets/ui/icons/mechanics/mechanic-output-randomness.png`
- [x] `assets/ui/icons/mechanics/mechanic-environmental-randomness.png`
- [x] `assets/ui/icons/mechanics/mechanic-mitigation-agency.png`
- [x] `assets/ui/icons/mechanics/mechanic-biased-expectations.png`
- [x] `assets/ui/icons/mechanics/mechanic-session-persistence.png`
- [x] `assets/ui/icons/mechanics/mechanic-layered-reward-structures.png`
- [x] `assets/ui/icons/mechanics/mechanic-soft-failure-compensation.png`

## Less Text-Based Presentation Layer

### Player: portrait or simple actor
- [x] `assets/actors/player/player-idle.png`
- [x] `assets/actors/player/player-guard.png`
- [x] `assets/actors/player/player-focus.png`
- [x] `assets/actors/player/player-hit.png`
- [x] `assets/actors/player/player-low-hp.png`

### Enemies: same mechanics, different visual shells
- [x] `assets/actors/enemies/enemy-calibration-drone.png`
- [x] `assets/actors/enemies/enemy-warden-v1.png`
- [x] `assets/actors/enemies/enemy-scrap-hound.png`
- [x] `assets/actors/enemies/enemy-glass-engine.png`

### Event presenters
- [x] `assets/actors/events/event-analyst.png`
- [x] `assets/actors/events/event-terminal.png`

### Reward presenters
- [x] `assets/actors/rewards/reward-cache.png`
- [x] `assets/actors/rewards/reward-medkit-v1.png`
- [x] `assets/actors/rewards/reward-plating-v1.png`
- [x] `assets/actors/rewards/reward-supply-crate-v1.png`
- [ ] `assets/actors/rewards/reward-archive-shard.png`
- [ ] `assets/actors/rewards/reward-stabilizer-kit.png`

### Intent icons
- [x] `assets/ui/icons/intents/intent-attack.png`
- [x] `assets/ui/icons/intents/intent-guard.png`
- [x] `assets/ui/icons/intents/intent-focus.png`
- [x] `assets/ui/icons/intents/intent-risk.png`
- [x] `assets/ui/icons/intents/intent-reward.png`
- [x] `assets/ui/icons/actions/action-strike-v1.png`
- [x] `assets/ui/icons/actions/action-guard-v1.png`
- [x] `assets/ui/icons/actions/action-calibrate-v1.png`

### Status overlays
- [x] `assets/ui/icons/status/status-hit.png`
- [x] `assets/ui/icons/status/status-miss.png`
- [x] `assets/ui/icons/status/status-crit.png`
- [x] `assets/ui/icons/status/status-block.png`
- [x] `assets/ui/icons/status/status-heal.png`
- [x] `assets/ui/icons/status/status-warning.png`

### Encounter art
- [ ] `assets/illustrations/encounters/encounter-combat.png`
- [ ] `assets/illustrations/events/event-signal-cache.png`
- [ ] `assets/illustrations/rewards/reward-cache-scene.png`

### Environment backdrops
- [x] `assets/backgrounds/environments/env-controlled-chamber.png`
- [x] `assets/backgrounds/combat/arena-floor-v1.png`
- [x] `assets/backgrounds/environments/env-ion-storm.png`
- [x] `assets/backgrounds/environments/env-clear-corridor.png`
- [x] `assets/backgrounds/environments/env-dust-field.png`
- [x] `assets/backgrounds/environments/env-echo-vault.png`

### Stage props
- [/] `assets/props/combat/prop-console.png`
- [/] `assets/props/combat/prop-barrier.png`
- [x] `assets/props/combat/prop-sparks.png` (SOLVED VIA CODE: Phaser Particles)
- [x] `assets/props/events/prop-terminal.png` (Re-using event-terminal.png)
- [/] `assets/props/rewards/prop-crate.png`

### VFX
- [x] `assets/vfx/combat/vfx-hit.png` (Created prior)
- [x] `assets/vfx/combat/vfx-miss.png` (Created prior)
- [x] `assets/vfx/combat/vfx-crit.png` (SOLVED VIA CODE: Camera Shake + Tinting vfx-hit)
- [x] `assets/vfx/combat/vfx-block.png` (Created prior)
- [x] `assets/vfx/ui/vfx-reward-pick.png` (SOLVED VIA CODE: Phaser Tweens Pulse/Fade)
- [x] `assets/vfx/ui/vfx-mechanic-pick.png` (SOLVED VIA CODE: Phaser Tweens Pulse/Fade)

### Audio
- [x] `assets/audio/ui/sfx-ui-click.wav` (SOLVED VIA CODE: SynthesisManager)
- [x] `assets/audio/ui/sfx-ui-confirm.wav` (SOLVED VIA CODE: SynthesisManager)
- [x] `assets/audio/combat/sfx-hit.wav` (SOLVED VIA CODE: SynthesisManager)
- [x] `assets/audio/combat/sfx-miss.wav` (SOLVED VIA CODE: SynthesisManager)
- [x] `assets/audio/combat/sfx-block.wav` (SOLVED VIA CODE: SynthesisManager)
- [x] `assets/audio/combat/sfx-crit.wav` (SOLVED VIA CODE: SynthesisManager)
- [x] `assets/audio/rewards/sfx-reward.wav` (SOLVED VIA CODE: SynthesisManager)
- [x] `assets/audio/ambient/amb-lab-loop.wav` (SOLVED VIA CODE: SynthesisManager Drone)

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

- [x] `assets/ui/icons/nodes/node-combat.png`
- [x] `assets/ui/icons/nodes/node-event.png`
- [x] `assets/ui/icons/nodes/node-reward.png`
- [x] `assets/ui/icons/mechanics/mechanic-input-randomness.png`
- [x] `assets/ui/icons/mechanics/mechanic-output-randomness.png`
- [x] `assets/ui/icons/mechanics/mechanic-environmental-randomness.png`
- [x] `assets/ui/icons/mechanics/mechanic-mitigation-agency.png`
- [x] `assets/actors/player/player-idle.png`
- [x] `assets/actors/enemies/enemy-calibration-drone.png`
- [x] `assets/actors/events/event-terminal.png`
- [x] `assets/actors/rewards/reward-cache.png`
- [x] `assets/backgrounds/environments/env-controlled-chamber.png`

## Priority Order

- [x] 1. Node icons
- [x] 2. Mechanic icons
- [x] 3. Player + one enemy + one event presenter + one reward presenter
- [x] 4. Core environment backdrop
- [x] 5. Button and panel assets
- [x] 6. Intent and status icons
- [ ] 7. Core SFX
- [ ] 8. Extra enemies, props, and VFX polish

## Cleanup Tasks (Manual Background Removal)
List of generated assets that currently have backgrounds and need manual transparency cleanup:

- [ ] `assets/actors/enemies/enemy-warden-v1.png`
- [ ] `assets/actors/enemies/enemy-scrap-hound-v1.png`
- [ ] `assets/actors/enemies/enemy-glass-engine-v1.png`
- [ ] `assets/actors/player/player-low-hp-v1.png` (High Priority)
- [ ] `assets/actors/player/player-guard-v1.png`
- [ ] `assets/actors/player/player-focus-v1.png`
- [ ] `assets/actors/player/player-hit-v1.png`
- [ ] `assets/actors/events/event-analyst-v1.png`
- [ ] `assets/actors/rewards/reward-medkit-v1.png`
- [ ] `assets/actors/rewards/reward-plating-v1.png`
- [ ] `assets/actors/rewards/reward-supply-crate-v1.png`
- [ ] `assets/ui/icons/actions/action-strike-v1.png`
- [ ] `assets/ui/icons/actions/action-guard-v1.png`
- [ ] `assets/ui/icons/actions/action-calibrate-v1.png`
- [ ] `assets/ui/icons/status/status-heal-v1.png`
- [ ] `assets/ui/icons/status/status-warning-v1.png`
- [ ] `assets/backgrounds/combat/arena-floor-v1.png`
- [ ] `assets/vfx/combat/vfx-hit-v1.png`
- [ ] `assets/vfx/combat/vfx-miss-v1.png`
- [ ] `assets/vfx/combat/vfx-block-v1.png`
- [ ] `assets/actors/rewards/reward-archive-shard-v1.png`
- [ ] `assets/actors/rewards/reward-stabilizer-kit-v1.png`
- [ ] `assets/actors/props/prop-console-v1.png`
- [ ] `assets/actors/props/prop-barrier-v1.png`
- [ ] `assets/ui/panels/panel-main-v1.png`
- [ ] `assets/ui/panels/button-primary-v1.png`
- [ ] `assets/ui/panels/button-hover-v1.png`
- [ ] `assets/ui/icons/nodes/node-draft-v1.png`
- [ ] `assets/ui/icons/mechanics/mechanic-biased-expectations-v1.png`
- [ ] `assets/ui/icons/mechanics/mechanic-session-persistence-v1.png`
- [ ] `assets/ui/icons/mechanics/mechanic-layered-reward-structures-v1.png`
- [ ] `assets/ui/icons/mechanics/mechanic-soft-failure-compensation-v1.png`
