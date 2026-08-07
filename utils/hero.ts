import type { AppState } from "@/types";
import { daySeed } from "./greetings";
import { activeInLastDays, isScheduledOn, topStreak, totalCompletions } from "./streaks";
import { computeXp, levelForXp, xpToNextLevel } from "./xp";

/**
 * Hero context — the dashboard's opening line should never feel static.
 *
 * The hero reads the user's actual situation (streak, progress, time of
 * day, first visit, return after a gap…) and adapts its message, glyph
 * and chip accordingly. Pure function of state + date — deterministic,
 * testable, no random at render time.
 */

export type HeroMood =
  | "first"
  | "anniversary"
  | "all-done"
  | "streak"
  | "streak-line"
  | "almost-level"
  | "returning"
  | "rest"
  | "monday"
  | "weekend"
  | "morning"
  | "afternoon"
  | "evening";

export interface HeroContext {
  mood: HeroMood;
  /** Companion line under the greeting. */
  line: string;
  /** Small glyph that personalizes the greeting. */
  glyph: string;
  /** Short chip label, e.g. "3-day streak". */
  chip: string;
}

/** Rotating lines for the persistent states so they never repeat verbatim. */
function pick(lines: string[], dateKey: string): string {
  return lines[daySeed(dateKey + ":hero") % lines.length];
}

const STREAK_LINES = [
  (n: number) => `${n}-day streak. Future You is proud.`,
  (n: number) => `${n} days of showing up. That's real.`,
  (n: number) => `The streak is ${n}. Protect it.`,
];
const ALL_DONE_LINES = [
  "Everything's done. The rest of the day is yours.",
  "All caught up. Quietly excellent.",
  "Nothing left on the list. Enjoy that.",
];
const REST_LINES = [
  "A lighter day. Rest counts as growth.",
  "Nothing scheduled — the garden rests, and so can you.",
  "A softer day. Your rhythm doesn't need to be loud.",
];

export function heroContext(state: AppState, dateKey: string): HeroContext {
  const xp = computeXp(state);
  const level = levelForXp(xp);
  const streak = topStreak(state.habits, state.completions, state.freezeUsed);
  const total = totalCompletions(state.completions);

  const goalsToday = state.habits.filter((h) => isScheduledOn(h, dateKey));
  const doneToday = goalsToday.filter((h) => (state.completions[h.id] ?? []).includes(dateKey)).length;
  const allDone = goalsToday.length > 0 && doneToday === goalsToday.length;
  const pickIdx = daySeed(dateKey + ":hero") % 3;

  // Day one — the garden hasn't started yet.
  if (total === 0 && state.questsDone.length === 0) {
    return {
      mood: "first",
      line: "Your garden begins today. One seed, one step.",
      glyph: "🌱",
      chip: "Day one",
    };
  }

  // BAMBI-versary — the anniversary of joining (not the day they joined).
  const onboarded = state.profile?.onboardedAt;
  if (onboarded) {
    const joined = new Date(onboarded);
    const todayDt = new Date(dateKey + "T00:00:00");
    const daysSince = Math.round(
      (todayDt.getTime() - new Date(joined.getFullYear(), joined.getMonth(), joined.getDate()).getTime()) / 86400000
    );
    if (
      daysSince > 0 &&
      joined.getMonth() === todayDt.getMonth() &&
      joined.getDate() === todayDt.getDate()
    ) {
      return {
        mood: "anniversary",
        line: `Happy BAMBI-versary — ${daysSince} days of showing up.`,
        glyph: "🎉",
        chip: "Celebrating you",
      };
    }
  }

  // Everything finished — the hero relaxes with the user.
  if (allDone) {
    return {
      mood: "all-done",
      line: pick(ALL_DONE_LINES, dateKey),
      glyph: "⭐",
      chip: "All caught up",
    };
  }

  // A live streak worth protecting.
  if (streak >= 3) {
    return {
      mood: "streak",
      line: STREAK_LINES[pickIdx](streak),
      glyph: "🔥",
      chip: `${streak}-day streak`,
    };
  }

  // Something scheduled, nothing done yet, and a streak that could break.
  if (goalsToday.length > 0 && !allDone && streak > 0 && doneToday === 0) {
    return {
      mood: "streak-line",
      line: "One more today keeps the streak alive.",
      glyph: "🔥",
      chip: "Streak on the line",
    };
  }

  // Close to a level-up.
  const toNext = xpToNextLevel(xp);
  if (toNext <= 40) {
    return {
      mood: "almost-level",
      line: `${toNext} XP from Level ${level + 1}. So close.`,
      glyph: "⚡",
      chip: `${toNext} XP to go`,
    };
  }

  // Has history, but no activity for a few days.
  if (total > 0 && !activeInLastDays(state, 3)) {
    return {
      mood: "returning",
      line: "Welcome back. The garden missed you.",
      glyph: "🌿",
      chip: "Welcome back",
    };
  }

  // A lighter day — reinforce that rest is part of the routine.
  if (goalsToday.length === 0) {
    return {
      mood: "rest",
      line: pick(REST_LINES, dateKey),
      glyph: "🍃",
      chip: "Rest day",
    };
  }

  // Day-of-week flavor.
  const weekday = new Date(dateKey + "T00:00:00").getDay();
  if (weekday === 1) {
    return { mood: "monday", line: "Fresh week. Fresh start.", glyph: "✨", chip: "New week" };
  }
  if (weekday === 0 || weekday === 6) {
    return { mood: "weekend", line: "Slow mornings count too.", glyph: "🌤", chip: "Weekend pace" };
  }

  // Time-of-day fallback.
  const h = new Date().getHours();
  if (h < 12) {
    return { mood: "morning", line: "A fresh page. Start with one small thing.", glyph: "☀️", chip: "Morning" };
  }
  if (h < 18) {
    return { mood: "afternoon", line: "You're still here. That counts for plenty.", glyph: "🌤", chip: "Afternoon" };
  }
  return { mood: "evening", line: "The day's quiet hours. Wind down well.", glyph: "🌙", chip: "Evening" };
}
