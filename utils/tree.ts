import type { AppState } from "@/types";
import { totalCompletions, weekSummary } from "./streaks";
import { unlockedCount } from "./achievements";

/**
 * Tree Growth System — BAMBI's signature feature.
 *
 * The tree grows with consistency, never with intensity:
 *  - completing goals grows the tree (total completions → stage),
 *  - the last week's rhythm decides how full the leaves are
 *    (a missed week thins the canopy, it never kills the tree),
 *  - unlocked achievements blossom into flowers.
 */

export interface TreeStage {
  key: "seed" | "sprout" | "sapling" | "young" | "large" | "flowering";
  name: string;
  /** Total goal completions needed to reach this stage. */
  min: number;
  blurb: string;
}

export const TREE_STAGES: TreeStage[] = [
  { key: "seed", name: "Seed", min: 0, blurb: "Every tree starts here. So do you." },
  { key: "sprout", name: "Sprout", min: 12, blurb: "Roots are finding their way down." },
  { key: "sapling", name: "Sapling", min: 30, blurb: "Growing taller, one goal at a time." },
  { key: "young", name: "Young tree", min: 60, blurb: "Branches reaching for the light." },
  { key: "large", name: "Large tree", min: 110, blurb: "Deep roots. Steady growth. Shade for others." },
  { key: "flowering", name: "Flowering tree", min: 180, blurb: "Consistency, fully bloomed." },
];

/** 0..1 — how complete the canopy is, driven by the last 7 days. */
export function canopyDensity(state: AppState): number {
  const days = weekSummary(state);
  let scheduled = 0;
  let completed = 0;
  for (const d of days) {
    scheduled += d.scheduled;
    completed += d.completed;
  }
  if (scheduled === 0) return 0;
  return Math.min(1, completed / scheduled);
}

/** How many flowers bloom on the tree (capped). */
export function flowerCount(state: AppState): number {
  return Math.min(8, unlockedCount(state));
}

export interface TreeInfo {
  stage: TreeStage;
  index: number;
  /** 0..1 progress from the current stage toward the next one. */
  nextProgress: number;
  /** Estimated days until the next stage, from recent pace. */
  daysToNext: number | null;
  total: number;
  leaves: number;
  flowers: number;
  density: number;
}

/** Evaluate the tree for the current state. */
export function treeInfo(state: AppState): TreeInfo {
  const total = totalCompletions(state.completions);
  let index = 0;
  for (let i = 0; i < TREE_STAGES.length; i++) {
    if (total >= TREE_STAGES[i].min) index = i;
  }
  const stage = TREE_STAGES[index];
  const next = TREE_STAGES[index + 1] ?? null;

  let nextProgress = 1;
  let daysToNext: number | null = null;
  if (next) {
    const span = next.min - stage.min;
    nextProgress = Math.min(1, Math.max(0, (total - stage.min) / span));
    // Rough pace: completions over the last 7 days → days to cover the gap.
    const week = weekSummary(state);
    const weekTotal = week.reduce((s, d) => s + d.completed, 0);
    const pace = weekTotal / 7;
    const remaining = next.min - total;
    daysToNext = pace > 0 ? Math.ceil(remaining / pace) : null;
  }

  const density = canopyDensity(state);
  const leaves = Math.round(6 + density * 8);

  return {
    stage,
    index,
    nextProgress,
    daysToNext,
    total,
    leaves,
    flowers: flowerCount(state),
    density,
  };
}
