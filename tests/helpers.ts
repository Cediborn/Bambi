import type { AppState, Habit } from "@/types";
import { shiftKey, todayKey } from "@/utils/dates";

/** A complete, default AppState — override any slice. */
export function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    profile: null,
    habits: [],
    completions: {},
    journal: [],
    questsDone: [],
    tendedDates: [],
    freezeUsed: {},
    focus: [],
    challenges: [],
    vision: [],
    reflections: [],
    settings: {
      theme: "light",
      accent: "violet",
      animatedBackground: true,
      particles: true,
      reduceMotion: false,
      compactMode: false,
      sounds: false,
    },
    ...overrides,
  };
}

/** A habit; by default scheduled every day so streak math is predictable. */
export function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Read",
    icon: "book",
    color: "#4F46E5",
    schedule: [0, 1, 2, 3, 4, 5, 6],
    createdAt: "2026-01-01",
    ...overrides,
  };
}

/** Mark a habit as completed on each of the given day-offsets (0 = today). */
export function completeOn(habitId: string, dayOffsets: number[]): Record<string, string[]> {
  return {
    [habitId]: dayOffsets.map((n) => shiftKey(todayKey(), -n)).sort(),
  };
}

/** A date key `days` ago, e.g. 1 = yesterday. */
export function daysAgo(days: number): string {
  return shiftKey(todayKey(), -days);
}
