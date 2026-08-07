import type { AppState, Habit } from "@/types";
import { lastNDays, narrowDayLabel, shiftKey, todayKey } from "./dates";

/** Days of the week a habit is scheduled on, given its schedule array. */
export function scheduledDays(habit: Habit): number[] {
  return [...habit.schedule].sort((a, b) => a - b);
}

/** Is the habit scheduled on the given date key? */
export function isScheduledOn(habit: Habit, dateKey: string): boolean {
  const [y, m, d] = dateKey.split("-").map(Number);
  return habit.schedule.includes(new Date(y, m - 1, d).getDay());
}

export function isEveryDay(habit: Habit): boolean {
  return habit.schedule.length === 7;
}

/** Human-readable schedule summary, e.g. "Every day" or "Mon · Wed · Fri". */
export function scheduleLabel(habit: Habit): string {
  if (habit.schedule.length === 0) return "Not scheduled";
  if (isEveryDay(habit)) return "Every day";
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return scheduledDays(habit).map((d) => names[d]).join(" · ");
}

/** Empty frozen set shared by defaulted params — never mutated. */
const NO_FROZEN: ReadonlySet<string> = new Set();

/** The frozen dates (YYYY-MM-DD) for one habit, as a Set. */
export function frozenSetFor(
  habitId: string,
  freezeUsed: AppState["freezeUsed"]
): ReadonlySet<string> {
  const dates = freezeUsed[habitId];
  return dates && dates.length > 0 ? new Set(dates) : NO_FROZEN;
}

/**
 * Current streak for a habit: consecutive scheduled days completed,
 * counting back from today. A not-yet-completed today does not break
 * the streak (it "starts" from yesterday). Dates in `frozen` count as
 * completed — that's what a streak freeze does.
 */
export function habitStreak(
  habit: Habit,
  completions: AppState["completions"],
  frozen: ReadonlySet<string> = NO_FROZEN
): number {
  const done = new Set(completions[habit.id] ?? []);
  let cursor = todayKey();
  if (!done.has(cursor) && !frozen.has(cursor)) cursor = shiftKey(cursor, -1);

  let streak = 0;
  // Bounded walk: a streak is consecutive scheduled days, and 366 days back
  // is beyond any real streak. The bound also guarantees termination when a
  // habit is never scheduled (isScheduledOn is always false).
  for (let i = 0; i < 366; i++) {
    if (!isScheduledOn(habit, cursor)) {
      cursor = shiftKey(cursor, -1);
      continue;
    }
    if (!done.has(cursor) && !frozen.has(cursor)) break;
    streak += 1;
    cursor = shiftKey(cursor, -1);
  }
  return streak;
}

/** Best streak across all habits (frozen days count as done). */
export function topStreak(
  habits: Habit[],
  completions: AppState["completions"],
  freezeUsed: AppState["freezeUsed"] = {}
): number {
  return habits.reduce(
    (best, h) => Math.max(best, habitStreak(h, completions, frozenSetFor(h.id, freezeUsed))),
    0
  );
}

/**
 * The most recent scheduled-and-missed day that broke a habit's streak.
 * Returns the day and the streak it would restore, or null when there is
 * nothing to freeze (no miss, or no streak existed beyond the miss).
 */
export function freezableDay(
  habit: Habit,
  completions: AppState["completions"],
  freezeUsed: AppState["freezeUsed"] = {}
): { day: string; restoredStreak: number } | null {
  const done = new Set(completions[habit.id] ?? []);
  const frozen = frozenSetFor(habit.id, freezeUsed);

  // Walk back from yesterday — today can still be completed, no freeze needed.
  let cursor = shiftKey(todayKey(), -1);
  let missed: string | null = null;
  for (let i = 0; i < 14; i++) {
    if (isScheduledOn(habit, cursor) && !done.has(cursor) && !frozen.has(cursor)) {
      missed = cursor;
      break;
    }
    cursor = shiftKey(cursor, -1);
  }
  if (!missed) return null;

  // A freeze only matters if a real streak existed before the miss, and
  // only when that history is recent enough to be worth saving (the same
  // 14-day window as the miss search).
  const before = [...done].some(
    (d) => d < missed && d >= shiftKey(missed, -14) && isScheduledOn(habit, d)
  );
  if (!before) return null;

  const restored = habitStreak(habit, completions, new Set([...frozen, missed]));
  return { day: missed, restoredStreak: restored };
}

/** Distinct days with any recorded activity — the "showed up" count. */
export function activeDays(state: AppState): number {
  const days = new Set<string>();
  for (const dates of Object.values(state.completions)) {
    for (const d of dates) days.add(d);
  }
  for (const d of state.questsDone) days.add(d);
  for (const e of state.journal) days.add(e.date);
  for (const d of state.tendedDates) days.add(d);
  for (const s of state.focus) days.add(s.date);
  for (const c of state.challenges) {
    for (const d of c.doneDates) days.add(d);
  }
  return days.size;
}

/**
 * Streak freezes earned but not yet spent: one for every 7 active days,
 * minus the ones already used.
 */
export function freezesAvailable(state: AppState): number {
  const earned = Math.floor(activeDays(state) / 7);
  const used = Object.values(state.freezeUsed).reduce((sum, dates) => sum + dates.length, 0);
  return Math.max(0, earned - used);
}

/** Total number of goal completions recorded. */
export function totalCompletions(completions: AppState["completions"]): number {
  return Object.values(completions).reduce((sum, dates) => sum + dates.length, 0);
}

/**
 * Number of goal completions recorded within the last `days` calendar days
 * (including today). Counts completions, not unique days.
 */
export function completionsInLastDays(
  completions: AppState["completions"],
  days: number
): number {
  const cutoff = shiftKey(todayKey(), -(days - 1));
  let count = 0;
  for (const dates of Object.values(completions)) {
    for (const d of dates) {
      if (d >= cutoff) count += 1;
    }
  }
  return count;
}

/**
 * Rolling 7-day summary (oldest first): for each day, how many habits were
 * scheduled and how many were completed.
 */
export interface DaySummary {
  key: string;
  label: string;
  scheduled: number;
  completed: number;
  isToday: boolean;
}

export function weekSummary(state: AppState): DaySummary[] {
  const days = lastNDays(7);
  const doneByDate = new Map<string, number>();
  for (const dates of Object.values(state.completions)) {
    for (const d of dates) {
      doneByDate.set(d, (doneByDate.get(d) ?? 0) + 1);
    }
  }
  return days.map((key) => {
    const scheduled = state.habits.filter((h) => isScheduledOn(h, key)).length;
    return {
      key,
      label: narrowDayLabel(key),
      scheduled,
      completed: doneByDate.get(key) ?? 0,
      isToday: key === todayKey(),
    };
  });
}

/**
 * Any sign of life (goals, quest, journal, focus, tending, challenges)
 * within the last `days` calendar days — used by the hero and banner to
 * detect returns after a gap.
 */
export function activeInLastDays(state: AppState, days: number): boolean {
  const cutoff = shiftKey(todayKey(), -(days - 1));
  for (const dates of Object.values(state.completions)) {
    if (dates.some((d) => d >= cutoff)) return true;
  }
  for (const d of [...state.questsDone, ...state.tendedDates]) {
    if (d >= cutoff) return true;
  }
  if (state.journal.some((e) => e.date >= cutoff)) return true;
  if (state.focus.some((f) => f.date >= cutoff)) return true;
  if (state.challenges.some((c) => c.doneDates.some((d) => d >= cutoff))) return true;
  return false;
}

/** Journaling streak: consecutive days with an entry, ending today or yesterday. */
export function journalStreak(entries: AppState["journal"]): number {
  const days = new Set(entries.map((e) => e.date));
  let cursor = todayKey();
  if (!days.has(cursor)) cursor = shiftKey(cursor, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftKey(cursor, -1);
  }
  return streak;
}
