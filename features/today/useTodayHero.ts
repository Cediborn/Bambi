"use client";

import { useApp } from "@/hooks/useApp";
import { todayKey } from "@/utils/dates";
import { heroContext } from "@/utils/hero";
import { dailyQuest, isQuestDone } from "@/utils/quests";
import { isScheduledOn, topStreak } from "@/utils/streaks";
import { computeXp, levelForXp } from "@/utils/xp";
import { DEFAULT_AVATAR } from "@/components/ui/Avatar";
import type { Habit } from "@/types";

/**
 * All derived numbers the Today hero needs, computed in one place so the
 * presentation component stays purely visual. Everything is a pure
 * function of state + today — same values, same render, just a cleaner
 * seam between business logic and UI.
 */
export interface TodayHeroData {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  ctx: ReturnType<typeof heroContext>;
  quest: ReturnType<typeof dailyQuest>;
  questDone: boolean;
  /** The first scheduled goal not yet done, if any. */
  pending: Habit | undefined;
  focusLine: string;
}

export function useTodayHero(): TodayHeroData {
  const { state } = useApp();
  const today = todayKey();

  const name = state.profile?.name ?? "friend";
  const avatar = state.profile?.avatar ?? DEFAULT_AVATAR;
  const xp = computeXp(state);
  const level = levelForXp(xp);
  const streak = topStreak(state.habits, state.completions, state.freezeUsed);
  const ctx = heroContext(state, today);

  const quest = dailyQuest(today, state.profile?.interests);
  const questDone = isQuestDone(state, today);

  const goals = state.habits.filter((h) => isScheduledOn(h, today));
  const done = goals.filter((h) => (state.completions[h.id] ?? []).includes(today)).length;
  const pending = goals.find((h) => !(state.completions[h.id] ?? []).includes(today));
  const allDone = goals.length > 0 && done === goals.length;

  const focusLine = questDone
    ? allDone
      ? "Quest and goals done. The rest of the day is yours."
      : `${goals.length - done} goal${goals.length - done === 1 ? "" : "s"} left — small steps.`
    : "One quest, then the day is yours.";

  return { name, avatar, xp, level, streak, ctx, quest, questDone, pending, focusLine };
}
