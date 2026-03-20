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
  EventChoice,
  EventState,
  MechanicId,
  MetaProgress,
  NodeDefinition,
  NodeKind,
  ProbabilityEntry,
  RewardChoice,
  RewardState,
  RunState,
} from "../types.js";

const MAX_ACTIVE_MECHANICS = 3;

const baseCombatActions: CombatAction[] = [
  {
    id: "strike",
    label: "Strike",
    description: "Reliable fixed damage with medium accuracy.",
    kind: "attack",
    baseHitChance: 78,
    baseDamage: 6,
    guardGain: 0,
    focusGain: 0,
  },
  {
    id: "guard",
    label: "Guard",
    description: "Block the incoming enemy intent.",
    kind: "guard",
    baseHitChance: 100,
    baseDamage: 0,
    guardGain: 6,
    focusGain: 0,
  },
  {
    id: "focus",
    label: "Focus",
    description: "Store +16 accuracy for the next attack.",
    kind: "focus",
    baseHitChance: 100,
    baseDamage: 0,
    guardGain: 0,
    focusGain: 16,
  },
];

export class LabEngine {
  public readonly rng: SeededRng;
  public readonly meta: MetaProgress;
  public readonly state: RunState;
  private activeNodeId: string | null = null;

  constructor(seed: number, meta: MetaProgress) {
    this.rng = new SeededRng(seed);
    this.meta = meta;

    const map = this.buildMap();

    this.state = {
      seed,
      phase: "draft",
      depth: 0,
      maxDepth: map.length,
      currentColumn: 0,
      map,
      activeMechanics: [],
      retiredMechanics: [],
      logs: [],
      summary: "Pick a starting mechanic to define this run's lens.",
      player: {
        hp: 24,
        maxHp: 24,
        supplies: 2,
        focus: 0,
        guard: 0,
        mitigationCharges: 0,
        pity: 0,
        archiveGain: 0,
        research: 0,
        softFailShield: 0,
        legacyBoost: 0,
      },
      combat: null,
      event: null,
      reward: null,
      draft: this.buildDraft(true),
      currentProbabilities: [],
      ended: false,
      victory: false,
    };

    this.log(`Seed ${seed} initialized. Node map length: ${map.length}.`);
  }

  private buildMap(): NodeDefinition[][] {
    const columnKinds: NodeKind[][] = [
      ["combat", "event"],
      this.rng.shuffle<NodeKind>(["combat", "reward"]),
      this.rng.shuffle<NodeKind>(["combat", "event"]),
      this.rng.shuffle<NodeKind>(["reward", "combat"]),
    ];

    return columnKinds.map((kinds, column) =>
      kinds.map((kind, lane) => ({
        id: `node-${column}-${lane}`,
        kind,
        lane,
        column,
        title: this.getNodeTitle(kind, column),
        description: this.getNodeDescription(kind),
        cleared: false,
      }))
    );
  }

  private getNodeTitle(kind: NodeKind, column: number): string {
    if (kind === "combat") {
      return `Skirmish ${column + 1}`;
    }

    if (kind === "event") {
      return "Signal Event";
    }

    return "Reward Cache";
  }

  private getNodeDescription(kind: NodeKind): string {
    if (kind === "combat") {
      return "One repeatable combat type, ideal for comparing random pressure.";
    }

    if (kind === "event") {
      return "A single risk/reward event template with transparent outcomes.";
    }

    return "A clean reward choice screen for pacing and motivation experiments.";
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
        ? "Begin with one controlled randomness layer."
        : "Choose one new mechanic before the next node. Active cap: 3.",
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
    this.state.phase = "map";
    this.state.summary = `Select one node from column ${this.state.currentColumn + 1}.`;
    this.state.currentProbabilities = [];
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

    if (node.kind === "combat") {
      this.startCombat(node);
      return;
    }

    if (node.kind === "event") {
      this.startEvent(node);
      return;
    }

    this.startReward(node);
  }

  private startCombat(node: NodeDefinition): void {
    this.activeNodeId = node.id;

    const enemyMaxHp = 12 + this.state.depth * 3 + this.rng.int(0, 2);
    const combat: CombatState = {
      enemyName: "Calibration Drone",
      enemyHp: enemyMaxHp,
      enemyMaxHp,
      enemyIntent: this.rollEnemyIntent(),
      round: 1,
      environmentName: "Controlled Chamber",
      environmentDescription: "Baseline arena with no extra variance.",
      environmentHitShift: 0,
      environmentGuardShift: 0,
      expectationBias: 0,
      actions: baseCombatActions.map((action) => ({ ...action })),
      previews: [],
      lastSummary: [`Entering ${node.title}.`],
    };

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
    this.state.summary = `${combat.enemyName} engaged. Resolve the turn and inspect the overlay.`;
    this.refreshCombatPreviews();
  }

  private rollEnemyIntent(): number {
    return 4 + this.state.depth + this.rng.int(0, 3);
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

    let preview: CombatActionPreview = {
      actionId: action.id,
      shownHitChance:
        action.kind === "attack"
          ? Phaser.Math.Clamp(
              action.baseHitChance +
                player.focus +
                player.pity +
                combat.environmentHitShift,
              5,
              98
            )
          : null,
      actualHitChance:
        action.kind === "attack"
          ? Phaser.Math.Clamp(
              action.baseHitChance +
                player.focus +
                player.pity +
                combat.environmentHitShift,
              5,
              98
            )
          : null,
      expectedDamage:
        action.kind === "attack" ? `${action.baseDamage}` : `${action.guardGain || action.focusGain}`,
      note: action.kind === "attack" ? "Attack preview." : "Support action.",
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

    const preview = combat.previews.find((entry) => entry.actionId === action.id) ?? this.buildCombatPreview(action);
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
      const finalChance = Phaser.Math.Clamp(
        (resolution.actualHitChance ?? 100) + resolution.chanceShift,
        5,
        98
      );
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
        resolution.notes.push(
          `${action.label} missed at ${finalChance}% actual hit chance.`
        );
      }

      this.state.player.focus = 0;
    }

    if (action.kind === "guard") {
      this.state.player.guard += Math.max(0, action.guardGain + combat.environmentGuardShift);
      resolution.notes.push(
        `Guard prepared ${this.state.player.guard} block for the enemy turn.`
      );
    }

    if (action.kind === "focus") {
      this.state.player.focus += action.focusGain;
      resolution.notes.push(`Focus stored +${action.focusGain} accuracy.`);
    }

    if (action.kind === "stabilize" && this.state.player.mitigationCharges > 0) {
      this.state.player.mitigationCharges -= 1;
      this.state.player.guard += action.guardGain;
      this.state.player.focus += action.focusGain;
      resolution.notes.push(
        `Stabilize spent 1 charge for +${action.focusGain} focus and ${action.guardGain} guard.`
      );
    }

    if (combat.enemyHp <= 0) {
      resolution.notes.push("Enemy defeated.");
      this.finishCombat(true, resolution.notes);
      return;
    }

    const incomingDamage = Math.max(0, combat.enemyIntent - this.state.player.guard);
    resolution.prevented = combat.enemyIntent - incomingDamage;
    resolution.enemyDamage = incomingDamage;

    if (incomingDamage > 0) {
      this.state.player.hp = Math.max(0, this.state.player.hp - incomingDamage);
      resolution.notes.push(`Enemy dealt ${incomingDamage} damage.`);
    } else {
      resolution.notes.push("Incoming damage fully blocked.");
    }

    this.state.player.guard = 0;

    if (this.state.player.hp <= 0 && !this.tryPreventDefeat("combat")) {
      this.finishCombat(false, resolution.notes);
      return;
    }

    combat.round += 1;
    combat.enemyIntent = this.rollEnemyIntent();
    combat.lastSummary = resolution.notes;
    this.state.summary = resolution.notes[resolution.notes.length - 1] ?? "Combat updated.";
    this.refreshCombatPreviews();
  }

  private finishCombat(won: boolean, notes: string[]): void {
    if (won) {
      this.state.player.supplies += 1;
      notes.push("Combat reward: +1 supply.");
    }

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onAfterCombat?.(this.createContext(), won, notes);
    }

    if (!won && this.state.player.hp <= 0) {
      this.endRun(false, "The prototype run collapsed during combat.");
      return;
    }

    this.advanceAfterNode(notes[notes.length - 1] ?? "Combat resolved.");
  }

  private startEvent(node: NodeDefinition): void {
    this.activeNodeId = node.id;

    let event: EventState = {
      title: "Signal Cache",
      description:
        "A fractured beacon offers a safe calibration or a risky scan for archived knowledge.",
      options: [
        {
          id: "stabilize-signal",
          label: "Stabilize",
          description: "Take a guaranteed +4 HP.",
        },
        {
          id: "scan-deep",
          label: "Scan Deep",
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
    this.state.summary = `${node.title}: compare a safe reward against a risky one.`;
    this.state.currentProbabilities = event.options
      .filter((option) => option.actualChance !== undefined || option.shownChance !== undefined)
      .map((option) => ({
        label: option.label,
        shown:
          option.shownChance === undefined ? "n/a" : `${Math.round(option.shownChance)}%`,
        actual:
          option.actualChance === undefined ? "n/a" : `${Math.round(option.actualChance)}%`,
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
      resolution.notes.push("Signal stabilized: +4 HP.");
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

    if (this.state.player.hp <= 0 && !this.tryPreventDefeat("event")) {
      this.endRun(false, "The run ended inside a volatile event.");
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
        type: "heal" as const,
        amount: 5,
        secondary: [],
      },
      {
        id: "armor-plating",
        label: "Armor Plating",
        description: "Gain +3 max HP and heal 3.",
        type: "max-hp" as const,
        amount: 3,
        secondary: [],
      },
      {
        id: "supply-crate",
        label: "Supply Crate",
        description: "Gain 2 supplies.",
        type: "supplies" as const,
        amount: 2,
        secondary: [],
      },
      {
        id: "stabilizer-kit",
        label: "Stabilizer Kit",
        description: "Gain 1 mitigation charge.",
        type: "mitigation" as const,
        amount: 1,
        secondary: [],
      },
      {
        id: "archive-cache",
        label: "Archive Cache",
        description: "Bank 2 archive shards for the meta layer.",
        type: "archive" as const,
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
      description: "Pick one clean reward and compare immediate versus delayed incentives.",
      choices,
    };

    this.state.reward = reward;
    this.state.combat = null;
    this.state.event = null;
    this.state.phase = "reward";
    this.state.summary = "Choose exactly one reward package.";
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
      notes: [`Reward selected: ${choice.label}.`],
    };

    for (const mechanic of this.getActiveMechanics()) {
      mechanic.onAfterReward?.(this.createContext(), selection);
    }

    this.advanceAfterNode(selection.notes[selection.notes.length - 1] ?? "Reward claimed.");
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
    this.activeNodeId = null;
    this.state.combat = null;
    this.state.event = null;
    this.state.reward = null;
    this.state.currentProbabilities = [];

    if (this.state.currentColumn >= this.state.maxDepth) {
      this.endRun(true, summary);
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
    this.meta.bestDepth = Math.max(this.meta.bestDepth, this.state.depth);
    this.meta.lastSeed = this.state.seed;
    this.meta.archive += this.state.player.archiveGain + (victory ? 1 : 0);

    this.log(
      victory
        ? `Run complete. Meta archive is now ${this.meta.archive}.`
        : `Run failed. Meta archive is now ${this.meta.archive}.`
    );
  }
}
