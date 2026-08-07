import { totalCompletions } from "./streaks";
import type { AppState } from "@/types";

/** XP awarded per completed goal. */
export const XP_PER_GOAL = 10;
/** XP awarded per journal entry (once per day). */
export const XP_PER_ENTRY = 5;
/** XP awarded for completing the daily quest. */
export const XP_PER_QUEST = 20;
/** XP awarded each day the tree is tended (watered). */
export const XP_PER_TEND = 5;
/** Welcome bonus granted at onboarding. */
export const XP_WELCOME = 20;
/** XP needed to reach the first level. */
const XP_PER_LEVEL = 100;

/** Total XP from challenges that were actually completed. */
export function challengeXp(state: AppState): number {
  return state.challenges
    .filter((c) => c.completedAt)
    .reduce((sum, c) => sum + c.xpReward, 0);
}

/**
 * XP is fully derived from state — nothing to store or drift.
 * Swap target note: with a backend this becomes a column, but the
 * selectors below keep the UI identical.
 */
export function computeXp(state: AppState): number {
  const goals = totalCompletions(state.completions) * XP_PER_GOAL;
  const entries = state.journal.length * XP_PER_ENTRY;
  const quests = state.questsDone.length * XP_PER_QUEST;
  const tended = state.tendedDates.length * XP_PER_TEND;
  const challenges = challengeXp(state);
  const welcome = state.profile ? XP_WELCOME : 0;
  return goals + entries + quests + tended + challenges + welcome;
}

export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** Progress (0..1) toward the next level. */
export function levelProgress(xp: number): number {
  const into = xp % XP_PER_LEVEL;
  return into / XP_PER_LEVEL;
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
}

/** Growing titles given at each level — the "next reward" a user works toward. */
const LEVEL_TITLES = [
  "Sprout",
  "Seedling",
  "Sapling",
  "Bamboo",
  "Grove",
  "Forest",
  "Old Growth",
  "Summit",
  "Evergreen",
  "Canopy",
];

/** Title for a level, e.g. level 1 is the first "Sprout". */
export function levelTitle(level: number): string {
  return LEVEL_TITLES[(level - 1) % LEVEL_TITLES.length];
}
