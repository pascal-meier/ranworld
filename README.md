# Planetfall Mechanics Lab

Small seeded Phaser prototype for comparing randomness mechanics inside an endless planet-hopping roguelike loop.

## Run

```bash
npm run build
npm run start
```

Open `http://127.0.0.1:8080`.

## Core Idea

You are an astronaut exploring planets.

Each planet works like this:

1. Choose 1 of 2 planets.
2. On the selected planet, choose 1 of 2 waypoints.
3. Resolve the encounter there.
4. Take a reward or upgrade.
5. The same planet is shown again with the current route and 2 new waypoints.
6. On site 4, choose:
   Boss fight and keep the planet's upgrades.
   Or flee to orbit and lose the upgrades collected on that planet.
7. Then choose the next planet and continue until the run fails.

The randomness mechanics are still the main experiment layer, but they now live inside a clearer roguelike structure.

## Taxonomy Backbone

The project now treats the local table in `/home/pmeier/Documents/Library/table/Table.html` as the real source of truth.

That means:

- the roguelike loop is just the playable shell
- the mechanics taxonomy is the real design backbone
- every mechanic should eventually exist in-game as either:
  a `Ship Upgrade`
  or a `World Modifier`

The full taxonomy catalog now lives in:

- `src/game/mechanics/catalog.ts`

This catalog contains all mechanics from the table and marks which ones are already playable.

## First Orientation

You can ignore most folders at first.

Focus on these:

- `src/main.ts`
  Starts Phaser.
- `src/game/config.ts`
  Screen size, scaling, pixel-art rendering.
- `src/game/scenes/SetupScene.ts`
  The first screen before a run starts.
- `src/game/scenes/RunScene.ts`
  The main game screen. Most visible UI lives here.
- `src/game/scenes/OverlayScene.ts`
  Optional dev overlay.
- `src/game/core/LabStore.ts`
  Scene-facing state access.
- `src/game/core/LabEngine.ts`
  The actual run logic.
- `src/game/mechanics/`
  One file per randomness mechanic.
- `src/game/ui/theme.ts`
  Colors, font, text spacing.
- `src/game/ui/widgets.ts`
  Reusable UI building blocks like panels, buttons, tags.

Usually, if something looks wrong on screen, the change is in one of these files:

- layout problem: `src/game/scenes/SetupScene.ts` or `src/game/scenes/RunScene.ts`
- button/panel problem: `src/game/ui/widgets.ts`
- style problem: `src/game/ui/theme.ts`
- game rules problem: `src/game/core/LabEngine.ts`
- mechanic behavior problem: one file in `src/game/mechanics/`

## What To Ignore

You do not need to think about these most of the time:

- `dist/`
  Generated build output.
- `node_modules/`
  Installed packages.
- `src/phaser-globals.d.ts`
  Type helper for Phaser globals.
- `.github/`
  Deployment only.
- `scripts/build.mjs`
  Build script only.

## Mental Model

The project is basically just this:

1. `SetupScene`
   Show seed and start the run.
2. `LabStore`
   Holds current run state for the scenes.
3. `LabEngine`
   Decides what happens when the player picks a node, action, reward, or mechanic.
4. `RunScene`
   Draws the current phase: planet select, waypoint view, combat, event, reward, fail screen.
5. `mechanics/*`
   Each active mechanic modifies the run through the engine.

If you only understand those 5 parts, you understand the project well enough to work on it.

## Where Things Live

### Gameplay

- `src/game/core/LabEngine.ts`
- `src/game/core/LabStore.ts`
- `src/game/types.ts`

### Screens

- `src/game/scenes/BootScene.ts`
- `src/game/scenes/SetupScene.ts`
- `src/game/scenes/RunScene.ts`
- `src/game/scenes/OverlayScene.ts`

### UI

- `src/game/ui/theme.ts`
- `src/game/ui/widgets.ts`

### Mechanics

- `src/game/mechanics/index.ts`
- `src/game/mechanics/*.ts`
- `src/game/mechanics/catalog.ts`

## Current Taxonomy Status

- Total taxonomy mechanics in the table: `70`
- Already implemented and playable: `14`
- Still planned: `56`

The currently implemented playable mechanics are:

- `L1A1` Input Randomness
- `L1A2` Output Randomness
- `L1A3` Environmental Randomness
- `L2C3` Mitigation Agency
- `L2D2` Biased Expectations
- `L4B1` Re-Roll Mechanics
- `L4C1` Probability Transparency
- `L4C2` Consistent RNG Feedback
- `L3C2` Session Persistence
- `L4D1` Variable Reward Schedules
- `L4D2` Progressive Probability Systems
- `L4D3` Layered Reward Structures
- `L4E2` Bad-Luck Protection
- `L4E3` Soft Failure Compensation

### Assets

- `assets/actors/`
  Player, enemies, event objects, reward objects.
- `assets/ui/icons/nodes/`
  Node base and node symbols.
- `assets/draft/`
  Temporary generated assets before sorting/renaming.

## Recommended Workflow

If you want to change:

- the look of the game:
  start in `src/game/ui/theme.ts`
- the size or placement of UI:
  start in `src/game/scenes/RunScene.ts`
- the setup screen:
  start in `src/game/scenes/SetupScene.ts`
- combat/event/reward behavior:
  start in `src/game/core/LabEngine.ts`
- a specific mechanic:
  start in the matching file in `src/game/mechanics/`

## Assets

Put new art, icons, SFX, and fonts into `assets/`.

See:
- `assets/ASSETS.md`
