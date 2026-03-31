import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const probabilityTransparency: MechanicDefinition = {
  ...getImplementedMechanicMeta("probability-transparency"),
  id: "probability-transparency",
  category: "Legibility",
  summary: "Shown odds are forced to match the real odds exactly.",
  detail:
    "This mechanic removes hidden drift from previews and exposes the underlying probabilities directly.",
  effectText: "Combat and event odds display exact actual values instead of framed or biased numbers.",
  iconKey: "mechanic-transparency",
  onPreviewCombatAction: (_, preview, action) => {
    if (action.kind !== "attack" || preview.actualHitChance === null) {
      return preview;
    }

    return {
      ...preview,
      shownHitChance: preview.actualHitChance,
      note: "Exact odds exposed.",
    };
  },
  onBuildEvent: (_, event) => ({
    ...event,
    options: event.options.map((option) =>
      option.actualChance === undefined
        ? option
        : {
            ...option,
            shownChance: option.actualChance,
          }
    ),
  }),
  getDebugLines: () => ["Probability Transparency: shown odds mirror actual odds."],
};
