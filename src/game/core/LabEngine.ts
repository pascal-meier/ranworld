import { SeededRng } from "./SeededRng.js";
import { allMechanics, getMechanicDefinition, starterMechanicPool } from "../mechanics/index.js";
import type {
  ActionResolution,
  EventResolution,
  MechanicContext,
  RewardSelection,
} from "../mechanics/types.js";
import type {
  CombatAction,
  CombatActionPreview,
  CombatState,
  EventState,
  MechanicId,
  MetaProgress,
  NodeDefinition,
  NodeKind,
  PlanetChoice,
  PlayerState,
  ProbabilityEntry,
  RewardChoice,
  RewardState,
  RunState,
} from "../types.js";
import { REROLL_SUPPLY_COST } from "./balance.js";
import { getUpgradeLevel } from "./metaUpgrades.js";

const MAX_ACTIVE_MECHANICS = 3;
const PLANET_SITES = 4;
const PLANET_IMAGE_KEYS = [
  "planet-01",
  "planet-02",
  "planet-03",
  "planet-04",
  "planet-05",
  "planet-06",
  "planet-07",
] as const;

const baseCombatActions: CombatAction[] = [
  {
    id: "strike",
    label: "Balanced Attack",
    description: "78% hit chance, 6 damage.",
    kind: "attack",
    baseHitChance: 78,
    baseDamage: 6,
    guardGain: 0,
    focusGain: 0,
  },
  {
    id: "guard",
    label: "Guard",
    description: "Gain 6 guard. Blocks the next enemy attack.",
    kind: "guard",
    baseHitChance: 100,
    baseDamage: 0,
    guardGain: 6,
    focusGain: 0,
  },
  {
    id: "focus",
    label: "Calibrate",
    description: "Gain +16 hit chance for your next attack.",
    kind: "focus",
    baseHitChance: 100,
    baseDamage: 0,
    guardGain: 0,
    focusGain: 16,
  },
];

interface PlanetRewardLedger {
  maxHp: number;
  supplies: number;
  mitigationCharges: number;
  archiveGain: number;
  research: number;
}

const emptyPlanetRewardLedger = (): PlanetRewardLedger => ({
  maxHp: 0,
  supplies: 0,
  mitigationCharges: 0,
  archiveGain: 0,
  research: 0,
});

export class LabEngine {
  public readonly rng: SeededRng;
  public readonly meta: MetaProgress;
  public readonly state: RunState;
  private activeNodeId: string | null = null;
  private planetRewardLedger = emptyPlanetRewardLedger();

  constructor(seed: number, meta: MetaProgress) {
    this.rng = new SeededRng(seed);
    this.meta = meta;

    const planetChoices = this.buildPlanetChoices(1);
    const map = this.buildPlanetMap(1);

    this.state = {
      seed,
      phase: "draft",
      depth: 0,
      planet: 1,
      planetName: "UNSELECTED",
      planetChoices,
      selectedPlanetId: null,
      selectedPlanetImageKey: null,
      currentSite: 1,
      sitesPerPlanet: PLANET_SITES,
      currentColumn: 0,
      map,
      activeMechanics: [],
      retiredMechanics: [],
      logs: [],
      summary: "Pick a starting mechanic before touching down on the first planet.",
      player: {
        hp: 50 + getUpgradeLevel(meta.upgrades, "hp-augment") * 10,
        maxHp: 50 + getUpgradeLevel(meta.upgrades, "hp-augment") * 10,
        supplies: 2 + getUpgradeLevel(meta.upgrades, "supply-line"),
        focus: 0,
        guard: 0,
        rerollCharges: 0,
        mitigationCharges: 0,
        pity: 0,
        progressiveScanBonus: 0,
        badLuckGuard: 0,
        archiveGain: 0,
        research: 0,
        softFailShield: 0,
        legacyBoost: getUpgradeLevel(meta.upgrades, "focus-calibration") * 5,
      },
      combat: null,
      event: null,
      reward: null,
      draft: this.buildDraft(true),
      currentProbabilities: [],
      ended: false,
      victory: false,
    };

    this.log(`Seed ${seed} initialized. Choose a first planet.`);
  }

  private buildPlanetChoices(planet: number): PlanetChoice[] {
    const descriptors = [
      "Gentle biosphere with steady readings.",
      "Sparse crust with clean landing vectors.",
      "Violent climate and dangerous mineral pressure.",
      "Chaotic biomes with unstable surface routes.",
      "Dense storms and signal interference.",
      "Fragmented landmasses with hidden caches.",
      "Harsh atmosphere with high encounter risk.",
    ];

    const names = [
      this.rollPlanetName(planet),
      this.rollPlanetName(planet),
      this.rollPlanetName(planet),
      this.rollPlanetName(planet),
    ];

    return this.rng
      .shuffle([...PLANET_IMAGE_KEYS])
      .slice(0, 2)
      .map((imageKey, index) => ({
        id: `planet-choice-${planet}-${index}`,
        name: names[index],
        imageKey,
        description: descriptors[this.rng.int(0, descriptors.length - 1)],
      }));
  }

  private buildPlanetMap(planet: number): NodeDefinition[][] {
    const landingColumns: NodeKind[][] = [
      this.rng.shuffle<NodeKind>(["combat", "event"]),
      this.rng.shuffle<NodeKind>(["combat", "reward"]),
      this.rng.shuffle<NodeKind>(["event", "reward"]),
      // Site 4 is always the planet climax: boss fight or flee.
      ["boss", "flee"],
    ];

    return landingColumns.map((kinds, column) =>
      kinds.map((kind, lane) => ({
        id: `planet-${planet}-node-${column}-${lane}`,
        kind,
        lane,
        column,
        title: this.getNodeTitle(kind, column, lane),
        description: this.getNodeDescription(kind),
        cleared: false,
      }))
    );
  }

  private rollPlanetName(planet: number): string {
    const prefixes = ["Ash", "Glass", "Mire", "Halo", "Rust", "Storm", "Blue", "Cinder"];
    const suffixes = ["Reach", "Hollow", "Veil", "Basin", "Spindle", "Crown", "Delta", "Orbit"];

    return `${this.rng.pick(prefixes)} ${this.rng.pick(suffixes)} ${planet}`;
  }

  private getNodeTitle(kind: NodeKind, column: number, lane: number): string {
    if (kind === "combat") {
      return column === 0 ? "Ridge Fight" : "Dust Fight";
    }

    if (kind === "event") {
      return lane === 0 ? "Beacon Site" : "Ruined Relay";
    }

    if (kind === "reward") {
      return lane === 0 ? "Supply Cache" : "Mineral Cache";
    }

    if (kind === "boss") {
      return "Boss LZ";
    }

    return "Flee Orbit";
  }

  private getNodeDescription(kind: NodeKind): string {
    if (kind === "combat") {
      return "Hostile waypoint with one repeatable combat encounter.";
    }

    if (kind === "event") {
      return "A risky discovery that trades safety against valuable information.";
    }

    if (kind === "reward") {
      return "A clean upgrade pickup for the current planet.";
    }

    if (kind === "boss") {
      return "Fight the planet boss and carry your planetary gains forward.";
    }

    return "Abort the expedition, lose this planet's upgrades, and move on.";
  }

  private buildDraft(isStarter: boolean): RunState["draft"] {
    const pool = isStarter
      ? starterMechanicPool
      : allMechanics.map((mechanic) => mechanic.id);

    const choices = this.rng
      .shuffle(pool.filter((id) => !this.state?.activeMechanics?.includes(id)))
      .slice(0, 3);

    return {
      title: isStarter ? "Starter Mechanic" : "Mechanic Draft",
      description: isStarter
        ? "Choose one randomness lens before the first touchdown."
        : "Choose one new mechanic before the next waypoint. Active cap: 3.",
      choices,
      canSkip: !isStarter,
    };
  }

  private createContext(): MechanicContext {
    return {
      engine: this,
      state: this.state,
      rng: this.rng,
      log: (entry) => this.log(entry),
    };
  }

  private getActiveMechanics() {
    return this.state.activeMechanics.map((id) => getMechanicDefinition(id));
  }

  private log(entry: string): void {
    this.state.logs = [entry, ...this.state.logs].slice(0, 8);
  }

  hasMechanic(id: MechanicId): boolean {
    return this.state.activeMechanics.includes(id);
  }

  getDebugLines(): string[] {
    const context = this.createContext();

    return this.getActiveMechanics().flatMap((mechanic) =>
      mechanic.getDebugLines ? mechanic.getDebugLines(context) : []
    );
  }

  chooseMechanic(id: MechanicId | null): void {
    if (id) {
      this.addMechanic(id);
    } else {
      this.log("Draft skipped. Proceeding without a new mechanic.");
    }

    this.state.draft = null;
    this.state.phase = this.state.selectedPlanetImageKey ? "map" : "planet-select";
    this.state.summary = this.state.selectedPlanetImageKey
      ? this.state.currentColumn === PLANET_SITES - 1
        ? `Final approach on ${this.state.planetName}: choose boss or flee.`
        : `Choose one waypoint on ${this.state.planetName}.`
      : `Choose one planet for site ${this.state.currentSite}.`;
    this.state.currentProbabilities = [];
  }

  choosePlanet(planetId: string): void {
    if (this.state.phase !== "planet-select") {
      return;
    }

    const choice = this.state.planetChoices.find((entry) => entry.id === planetId);

    if (!choice) {
      return;
    }

    this.state.selectedPlanetId = choice.id;
    this.state.selectedPlanetImageKey = choice.imageKey;
    this.state.planetName = choice.name;
    this.state.map = this.buildPlanetMap(this.state.planet);
    this.state.phase = "map";
    this.state.summary =
      this.state.currentColumn === PLANET_SITES - 1
        ? `Final approach on ${choice.name}: choose boss or flee.`
        : `Choose one waypoint on ${choice.name}.`;
    this.log(`Planet selected: ${choice.name}.`);
  }

  private addMechanic(id: MechanicId): void {
    if (this.hasMechanic(id)) {
      return;
    }

    if (this.state.activeMechanics.length >= MAX_ACTIVE_MECHANICS) {
      const removed = this.state.activeMechanics.shift();

      if (removed) {
        this.state.retiredMechanics = [removed, ...this.state.retiredMechanics].slice(0, 3);
        this.log(`Mechanic cap reached. ${getMechanicDefinition(removed).name} rotated out.`);
      }
    }

    this.state.activeMechanics.push(id);
    this.log(`Activated ${getMechanicDefinition(id).name}.`);
    getMechanicDefinition(id).onAdded?.(this.createContext());
  }

  chooseNode(nodeId: string): void {
    if (this.state.phase !== "map") {
      return;
    }

    const node = this.state.map[this.state.currentColumn]?.find((entry) => entry.id === nodeId);

    if (!node || node.cleared) {
      return;
    }

    if (node.kind === "combat" || node.kind === "boss") {
      this.startCombat(node);
      return;
    }

    if (node.kind === "event") {
      this.startEvent(node);
      return;
    }

    if (node.kind === "reward") {
      this.startReward(node);
      return;
    }

    this.fleePlanet(node);
  }

  private startCombat(node: NodeDefinition): void {
    this.activeNodeId = node.id;
    const isBoss = node.kind === "boss";
    const enemyMaxHp = isBoss
      ? 18 + this.state.planet * 5 + this.rng.int(0, 3)
      : 10 + this.state.planet * 2 + this.state.currentSite + this.rng.int(0, 2);

    const combat: CombatState = {
      enemyName: isBoss ? `${this.state.planetName} Warden` : "Landing Drone",
      enemyRole: isBoss ? "boss" : "landing",
      enemyHp: enemyMaxHp,
      enemyMaxHp,
      enemyAttack: this.rollEnemyAttack(isBoss),
      round: 1,
      environmentName: isBoss ? "Core Basin" : "Controlled Chamber",
      environmentDescription: isBoss
        ? "The surface collapses into a violent boss arena with elevated pressure."
        : "A baseline waypoint with no extra variance.",
      environmentHitShift: 0,
      environmentGuardShift: 0,
      expectationBias: 0,
      actions: baseCombatActions.map((action) => ({ ...action })),
      previews: [],
      lastSummary: [isBoss ? `Boss signal locked on ${this.state.planetName}.` : `Entering ${node.title}.`],
      lastActionId: null,
      lastActionKind: null,
    };

    const enemySeed = this.rng.int(0, 100);
    if (!isBoss) {
      if (enemySeed < 30) {
        combat.enemyName = "Scrap Hound";
      } else if (enemySeed < 55) {
        combat.enemyName = "Landing Drone";
      } else if (enemySeed < 80) {
        combat.enemyName = "Glass Engine";
      } else {
        combat.enemyName = "Drone Swarm";
      }

      // Elite chance for later sites
      if (this.state.currentSite >= 3 && this.rng.chance(35)) {
        combat.enemyName = `Heavy Warden Elite`;
        combat.enemyHp += 6;
      }
    } else {
      combat.enemyName = `${this.state.planetName} Warden`;
    }

    const context = this.createContext();

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onBuildCombat?.(context, combat);
    }

    let actions = combat.actions;

    for (const mechanic of this.getActiveMechanics()) {
      if (mechanic.onBuildCombatActions) {
        actions = mechanic.onBuildCombatActions(context, actions);
      }
    }

    combat.actions = actions;
    this.state.combat = combat;
    this.state.event = null;
    this.state.reward = null;
    this.state.phase = "combat";
    this.state.summary = isBoss
      ? `Boss encounter on ${this.state.planetName}.`
      : `${combat.enemyName} engaged at ${node.title}.`;
    this.refreshCombatPreviews();
  }

  private rollEnemyAttack(isBoss = false): number {
    const base = isBoss ? 6 + this.state.planet : 4 + this.state.planet;
    return base + this.rng.int(0, 3);
  }

  private refreshCombatPreviews(): void {
    const combat = this.state.combat;

    if (!combat) {
      this.state.currentProbabilities = [];
      return;
    }

    combat.previews = combat.actions.map((action) => this.buildCombatPreview(action));
    this.state.currentProbabilities = combat.previews.map((preview, index) => ({
      label: combat.actions[index].label,
      shown: preview.shownHitChance === null ? "n/a" : `${preview.shownHitChance}%`,
      actual: preview.actualHitChance === null ? "n/a" : `${preview.actualHitChance}%`,
      note: preview.note,
    }));
  }

  private buildCombatPreview(action: CombatAction): CombatActionPreview {
    const combat = this.state.combat!;
    const player = this.state.player;

    const base = action.baseHitChance;
    const focus = player.focus;
    const pity = player.pity;
    const env = combat.environmentHitShift;
    const legacy = player.legacyBoost || 0;
    
    let breakdown: string[] = [];
    if (action.kind === "attack") {
      breakdown.push(`Base: ${base}%`);
      if (focus > 0) breakdown.push(`Focus: +${focus}%`);
      if (pity > 0) breakdown.push(`Pity: +${pity}%`);
      if (env !== 0) breakdown.push(`Env: ${env > 0 ? "+" : ""}${env}%`);
      if (legacy > 0) breakdown.push(`Lab: +${legacy}%`);
    }

    const totalRaw = base + focus + pity + env + legacy;
    const totalClamped = Phaser.Math.Clamp(totalRaw, 5, 98);

    let preview: CombatActionPreview = {
      actionId: action.id,
      shownHitChance: action.kind === "attack" ? totalClamped : null,
      actualHitChance: action.kind === "attack" ? totalClamped : null,
      expectedDamage:
        action.kind === "attack"
          ? `${action.baseDamage}`
          : `${action.guardGain || action.focusGain}`,
      note: action.kind === "attack" ? "Attack preview." : "Support action.",
      breakdown: breakdown.length > 0 ? breakdown : undefined,
    };

    for (const mechanic of this.getActiveMechanics()) {
      if (mechanic.onPreviewCombatAction) {
        preview = mechanic.onPreviewCombatAction(this.createContext(), preview, action);
      }
    }

    return preview;
  }

  resolveCombatAction(actionId: string): void {
    const combat = this.state.combat;

    if (!combat || this.state.phase !== "combat") {
      return;
    }

    const action = combat.actions.find((entry) => entry.id === actionId);

    if (!action) {
      return;
    }

    const preview =
      combat.previews.find((entry) => entry.actionId === action.id) ?? this.buildCombatPreview(action);
    const resolution: ActionResolution = {
      action,
      shownHitChance: preview.shownHitChance,
      actualHitChance: preview.actualHitChance,
      chanceShift: 0,
      damageShift: 0,
      critChance: 0,
      critBonus: 0,
      hit: action.kind !== "attack",
      damage: 0,
      enemyDamage: 0,
      prevented: 0,
      notes: [],
    };

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onResolveCombatAction?.(this.createContext(), resolution);
    }

    if (action.kind === "attack") {
      const finalChance = Phaser.Math.Clamp((resolution.actualHitChance ?? 100) + resolution.chanceShift, 5, 98);
      resolution.actualHitChance = finalChance;
      resolution.hit = this.rng.chance(finalChance);

      if (resolution.hit) {
        resolution.damage = Math.max(1, action.baseDamage + resolution.damageShift);

        if (resolution.critChance > 0 && this.rng.chance(resolution.critChance)) {
          resolution.damage += resolution.critBonus;
          resolution.notes.push("Critical spike triggered.");
        }

        combat.enemyHp = Math.max(0, combat.enemyHp - resolution.damage);
      resolution.notes.push(`${action.label} hit for ${resolution.damage}.`);
      } else {
        resolution.notes.push(`${action.label} missed at ${finalChance}% actual hit chance.`);
      }

      this.state.player.focus = 0;
    }

    if (action.kind === "guard") {
      this.state.player.guard += Math.max(0, action.guardGain + combat.environmentGuardShift);
      resolution.notes.push(`Guard prepared ${this.state.player.guard} block for the next enemy attack.`);
    }

    if (action.kind === "focus") {
      this.state.player.focus += action.focusGain;
      resolution.notes.push(`Focus stored +${action.focusGain} accuracy.`);
    }

    if (action.kind === "stabilize" && this.state.player.mitigationCharges > 0) {
      this.state.player.mitigationCharges -= 1;
      this.state.player.guard += action.guardGain;
      this.state.player.focus += action.focusGain;
      resolution.notes.push(`Stabilize spent 1 charge for +${action.focusGain} focus and ${action.guardGain} guard.`);
    }

    if (combat.enemyHp <= 0) {
      resolution.notes.push(combat.enemyRole === "boss" ? "Boss defeated." : "Enemy defeated.");
      this.finishCombat(true, resolution.notes);
      return;
    }

    const incomingDamage = Math.max(0, combat.enemyAttack - this.state.player.guard);
    resolution.prevented = combat.enemyAttack - incomingDamage;
    resolution.enemyDamage = incomingDamage;

    if (incomingDamage > 0) {
      this.state.player.hp = Math.max(0, this.state.player.hp - incomingDamage);
      resolution.notes.push(`Enemy dealt ${incomingDamage} damage.`);
    } else {
      resolution.notes.push("Incoming damage fully blocked.");
    }

    this.state.player.guard = 0;

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onAfterCombatAction?.(this.createContext(), resolution);
    }

    if (this.state.player.hp <= 0 && !this.tryPreventDefeat("combat")) {
      this.finishCombat(false, resolution.notes);
      return;
    }

    combat.round += 1;
    combat.enemyAttack = this.rollEnemyAttack(combat.enemyRole === "boss");
    combat.lastSummary = resolution.notes;
    combat.lastActionId = action.id;
    combat.lastActionKind = action.kind;
    this.state.summary = resolution.notes[resolution.notes.length - 1] ?? "Combat updated.";
    this.refreshCombatPreviews();
  }

  private finishCombat(won: boolean, notes: string[]): void {
    const combat = this.state.combat;

    if (!combat) {
      return;
    }

    if (!won && this.state.player.hp <= 0) {
      this.endRun(false, "The expedition collapsed in combat.");
      return;
    }

    if (won && combat.enemyRole === "boss") {
      this.state.player.supplies += 1;
      this.state.player.archiveGain += 2;
      notes.push("Boss cleared: +1 supply and +2 archive shards.");
      this.completePlanet(notes[notes.length - 1] ?? "Planet boss defeated.");
      return;
    }

    if (won) {
      this.state.player.supplies += 1;
      this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + 2);
      notes.push("Waypoint reward: +1 supply and +2 HP.");
    }

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onAfterCombat?.(this.createContext(), won, notes);
    }

    this.advanceAfterNode(notes[notes.length - 1] ?? "Combat resolved.");
  }

  private startEvent(node: NodeDefinition): void {
    this.activeNodeId = node.id;

    let event: EventState = {
      title: "Signal Relay",
      description:
        "A cracked relay on the surface offers a safe repair or a risky deep scan for archived data.",
      options: [
        {
          id: "stabilize-signal",
          label: "Patch Relay",
          description: "Take a guaranteed +4 HP.",
        },
        {
          id: "scan-deep",
          label: "Deep Scan",
          description: "65%: +2 archive shards. Fail: take 4 damage.",
          shownChance: 65,
          actualChance: 65,
        },
      ],
    };

    for (const mechanic of this.getActiveMechanics()) {
      if (mechanic.onBuildEvent) {
        event = mechanic.onBuildEvent(this.createContext(), event);
      }
    }

    this.state.event = event;
    this.state.combat = null;
    this.state.reward = null;
    this.state.phase = "event";
    this.state.summary = `${node.title}: compare a safe repair against a risky scan.`;
    this.state.currentProbabilities = event.options
      .filter((option) => option.actualChance !== undefined || option.shownChance !== undefined)
      .map((option) => ({
        label: option.label,
        shown: option.shownChance === undefined ? "n/a" : `${Math.round(option.shownChance)}%`,
        actual: option.actualChance === undefined ? "n/a" : `${Math.round(option.actualChance)}%`,
      }));
  }

  resolveEventChoice(choiceId: string): void {
    const event = this.state.event;

    if (!event || this.state.phase !== "event") {
      return;
    }

    const choice = event.options.find((option) => option.id === choiceId);

    if (!choice) {
      return;
    }

    const resolution: EventResolution = {
      choiceId,
      shownChance: choice.shownChance,
      actualChance: choice.actualChance,
      notes: [],
    };

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onResolveEvent?.(this.createContext(), resolution);
    }

    if (choiceId === "stabilize-signal") {
      this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + 4);
      resolution.notes.push("Relay patched: +4 HP.");
    } else {
      const actualChance = resolution.actualChance ?? 65;
      resolution.success = this.rng.chance(actualChance);

      if (resolution.success) {
        this.state.player.archiveGain += 2;
        resolution.notes.push("Deep scan succeeded: +2 archive shards.");
      } else {
        this.state.player.hp = Math.max(0, this.state.player.hp - 4);
        resolution.notes.push("Deep scan backfired: -4 HP.");
      }
    }

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onAfterEventResolution?.(this.createContext(), resolution);
    }

    if (this.state.player.hp <= 0 && !this.tryPreventDefeat("event")) {
      this.endRun(false, "The expedition broke apart during a surface event.");
      return;
    }

    this.advanceAfterNode(resolution.notes[resolution.notes.length - 1] ?? "Event resolved.");
  }

  private startReward(node: NodeDefinition): void {
    this.activeNodeId = node.id;

    const rewardPool: RewardChoice[] = this.rng.shuffle([
      {
        id: "field-repair",
        label: "Field Repair",
        description: "Restore 5 HP.",
        type: "heal",
        amount: 5,
        secondary: [],
      },
      {
        id: "armor-plating",
        label: "Armor Plating",
        description: "Gain +3 max HP and heal 3.",
        type: "max-hp",
        amount: 3,
        secondary: [],
      },
      {
        id: "supply-crate",
        label: "Supply Crate",
        description: "Gain 2 supplies.",
        type: "supplies",
        amount: 2,
        secondary: [],
      },
      {
        id: "stabilizer-kit",
        label: "Stabilizer Kit",
        description: "Gain 1 mitigation charge.",
        type: "mitigation",
        amount: 1,
        secondary: [],
      },
      {
        id: "archive-cache",
        label: "Archive Cache",
        description: "Bank 2 archive shards for the run.",
        type: "archive",
        amount: 2,
        secondary: [],
      },
    ]);

    let choices = rewardPool.slice(0, 3);

    for (const mechanic of this.getActiveMechanics()) {
      if (mechanic.onBuildRewardChoices) {
        choices = mechanic.onBuildRewardChoices(this.createContext(), choices);
      }
    }

    const reward: RewardState = {
      title: node.title,
      description: "Pick one planetary upgrade package before moving to the next waypoint.",
      choices,
    };

    this.state.reward = reward;
    this.state.combat = null;
    this.state.event = null;
    this.state.phase = "reward";
    this.state.summary = "Choose one planetary upgrade package.";
    this.state.currentProbabilities = [];
  }

  chooseReward(choiceId: string): void {
    const reward = this.state.reward;

    if (!reward || this.state.phase !== "reward") {
      return;
    }

    const choice = reward.choices.find((entry) => entry.id === choiceId);

    if (!choice) {
      return;
    }

    const before = this.clonePlayer(this.state.player);

    if (choice.type === "heal") {
      this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + choice.amount);
    }

    if (choice.type === "max-hp") {
      this.state.player.maxHp += choice.amount;
      this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + choice.amount);
    }

    if (choice.type === "supplies") {
      this.state.player.supplies += choice.amount;
    }

    if (choice.type === "mitigation") {
      this.state.player.mitigationCharges += choice.amount;
    }

    if (choice.type === "archive") {
      this.state.player.archiveGain += choice.amount;
    }

    const selection: RewardSelection = {
      choice,
      notes: [`Planetary upgrade selected: ${choice.label}.`],
    };

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onAfterReward?.(this.createContext(), selection);
    }

    this.capturePlanetRewardDelta(before, this.state.player);
    this.advanceAfterNode(selection.notes[selection.notes.length - 1] ?? "Reward claimed.");
  }

  rerollCurrentOffer(): void {
    if (
      !this.hasMechanic("reroll-mechanics") ||
      this.state.player.rerollCharges <= 0 ||
      this.state.player.supplies < REROLL_SUPPLY_COST
    ) {
      return;
    }

    if (this.state.phase !== "combat" && this.state.phase !== "event" && this.state.phase !== "reward") {
      return;
    }

    this.state.player.rerollCharges -= 1;
    this.state.player.supplies -= REROLL_SUPPLY_COST;

    if (this.state.phase === "combat" && this.state.combat) {
      let actions = baseCombatActions.map((action) => ({ ...action }));

      for (const mechanic of this.getActiveMechanics()) {
        if (mechanic.onBuildCombatActions) {
          actions = mechanic.onBuildCombatActions(this.createContext(), actions);
        }
      }

      this.state.combat.actions = actions;
      this.state.combat.lastSummary = [`Reroll spent: combat actions redrawn.`];
      this.state.summary = "Combat actions redrawn.";
      this.refreshCombatPreviews();
      this.log(
        `Reroll spent in combat. ${this.state.player.rerollCharges} charges and ${this.state.player.supplies} supplies remaining.`
      );
      return;
    }

    if (this.state.phase === "event" && this.state.event) {
      let event: EventState = {
        title: "Signal Relay",
        description:
          "A cracked relay on the surface offers a safe repair or a risky deep scan for archived data.",
        options: [
          {
            id: "stabilize-signal",
            label: "Patch Relay",
            description: "Take a guaranteed +4 HP.",
          },
          {
            id: "scan-deep",
            label: "Deep Scan",
            description: "65%: +2 archive shards. Fail: take 4 damage.",
            shownChance: 65,
            actualChance: 65,
          },
        ],
      };

      for (const mechanic of this.getActiveMechanics()) {
        if (mechanic.onBuildEvent) {
          event = mechanic.onBuildEvent(this.createContext(), event);
        }
      }

      this.state.event = event;
      this.state.currentProbabilities = event.options
        .filter((option) => option.actualChance !== undefined || option.shownChance !== undefined)
        .map((option) => ({
          label: option.label,
          shown: option.shownChance === undefined ? "n/a" : `${Math.round(option.shownChance)}%`,
          actual: option.actualChance === undefined ? "n/a" : `${Math.round(option.actualChance)}%`,
        }));
      this.state.summary = "Event options redrawn.";
      this.log(
        `Reroll spent in event. ${this.state.player.rerollCharges} charges and ${this.state.player.supplies} supplies remaining.`
      );
      return;
    }

    if (this.state.phase === "reward" && this.state.reward) {
      const rewardPool: RewardChoice[] = this.rng.shuffle([
        {
          id: "field-repair",
          label: "Field Repair",
          description: "Restore 5 HP.",
          type: "heal",
          amount: 5,
          secondary: [],
        },
        {
          id: "armor-plating",
          label: "Armor Plating",
          description: "Gain +3 max HP and heal 3.",
          type: "max-hp",
          amount: 3,
          secondary: [],
        },
        {
          id: "supply-crate",
          label: "Supply Crate",
          description: "Gain 2 supplies.",
          type: "supplies",
          amount: 2,
          secondary: [],
        },
        {
          id: "stabilizer-kit",
          label: "Stabilizer Kit",
          description: "Gain 1 mitigation charge.",
          type: "mitigation",
          amount: 1,
          secondary: [],
        },
        {
          id: "archive-cache",
          label: "Archive Cache",
          description: "Bank 2 archive shards for the run.",
          type: "archive",
          amount: 2,
          secondary: [],
        },
      ]);

      let choices = rewardPool.slice(0, 3);

      for (const mechanic of this.getActiveMechanics()) {
        if (mechanic.onBuildRewardChoices) {
          choices = mechanic.onBuildRewardChoices(this.createContext(), choices);
        }
      }

      this.state.reward.choices = choices;
      this.state.summary = "Reward packages redrawn.";
      this.log(
        `Reroll spent on rewards. ${this.state.player.rerollCharges} charges and ${this.state.player.supplies} supplies remaining.`
      );
    }
  }

  private capturePlanetRewardDelta(before: PlayerState, after: PlayerState): void {
    this.planetRewardLedger.maxHp += Math.max(0, after.maxHp - before.maxHp);
    this.planetRewardLedger.supplies += Math.max(0, after.supplies - before.supplies);
    this.planetRewardLedger.mitigationCharges += Math.max(0, after.mitigationCharges - before.mitigationCharges);
    this.planetRewardLedger.archiveGain += Math.max(0, after.archiveGain - before.archiveGain);
    this.planetRewardLedger.research += Math.max(0, after.research - before.research);
  }

  private fleePlanet(node: NodeDefinition): void {
    this.activeNodeId = node.id;
    this.revertPlanetUpgrades();
    this.state.depth += 1;
    this.completePlanet(`Fled ${this.state.planetName} and lost this planet's upgrades.`);
  }

  private revertPlanetUpgrades(): void {
    const player = this.state.player;

    player.maxHp = Math.max(8, player.maxHp - this.planetRewardLedger.maxHp);
    player.hp = Math.min(player.hp, player.maxHp);
    player.supplies = Math.max(0, player.supplies - this.planetRewardLedger.supplies);
    player.mitigationCharges = Math.max(0, player.mitigationCharges - this.planetRewardLedger.mitigationCharges);
    player.archiveGain = Math.max(0, player.archiveGain - this.planetRewardLedger.archiveGain);
    player.research = Math.max(0, player.research - this.planetRewardLedger.research);
  }

  private completePlanet(summary: string): void {
    const resolvedNode = this.state.map[this.state.currentColumn]?.find((node) => node.id === this.activeNodeId);

    if (resolvedNode) {
      resolvedNode.cleared = true;
    }

    this.state.player.guard += 1;
    this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + 20);

    this.planetRewardLedger = emptyPlanetRewardLedger();
    this.activeNodeId = null;
    this.state.combat = null;
    this.state.event = null;
    this.state.reward = null;
    this.state.draft = null;
    this.state.currentProbabilities = [];
    this.state.currentColumn = 0;
    this.state.currentSite = 1;
    this.state.planet += 1;
    this.state.planetName = "UNSELECTED";
    this.state.selectedPlanetId = null;
    this.state.selectedPlanetImageKey = null;
    this.state.planetChoices = this.buildPlanetChoices(this.state.planet);
    this.state.map = this.buildPlanetMap(this.state.planet);
    this.state.phase = "planet-select";
    this.state.summary = `${summary} Choose the next planet.`;
    this.log(`Planet ${this.state.planet} available for selection.`);
  }

  private tryPreventDefeat(source: "combat" | "event"): boolean {
    for (const mechanic of this.getActiveMechanics()) {
      if (mechanic.onBeforeDefeat?.(this.createContext(), source)) {
        this.state.summary = "Defeat prevented by a compensation mechanic.";
        return true;
      }
    }

    return false;
  }

  private advanceAfterNode(summary: string): void {
    const currentNodes = this.state.map[this.state.currentColumn];
    const resolvedNode = currentNodes.find((node) => node.id === this.activeNodeId);

    if (resolvedNode) {
      resolvedNode.cleared = true;
    }

    this.state.depth += 1;
    this.state.currentColumn += 1;
    this.state.currentSite = Math.min(this.state.currentColumn + 1, this.state.sitesPerPlanet);
    this.activeNodeId = null;
    this.state.combat = null;
    this.state.event = null;
    this.state.reward = null;
    this.state.currentProbabilities = [];

    if (this.state.currentColumn >= this.state.sitesPerPlanet) {
      this.completePlanet(summary);
      return;
    }

    if (this.state.currentColumn === this.state.sitesPerPlanet - 1) {
      this.state.draft = null;
      this.state.phase = "map";
      this.state.summary = `${summary} Final approach: boss or flee.`;
      return;
    }

    this.state.draft = this.buildDraft(false);
    this.state.phase = "draft";
    this.state.summary = summary;
  }

  private endRun(victory: boolean, summary: string): void {
    this.state.ended = true;
    this.state.victory = victory;
    this.state.phase = "run-end";
    this.state.summary = summary;
    this.state.draft = null;
    this.state.combat = null;
    this.state.event = null;
    this.state.reward = null;
    this.state.currentProbabilities = [];

    this.meta.completedRuns += 1;
    this.meta.bestPlanet = Math.max(this.meta.bestPlanet, this.state.planet);
    this.meta.lastSeed = this.state.seed;
    this.meta.archive += this.state.player.archiveGain;

    this.log(`Expedition failed. Meta archive is now ${this.meta.archive}.`);
  }

  private clonePlayer(player: PlayerState): PlayerState {
    return { ...player };
  }
}
