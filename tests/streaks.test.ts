import { describe, expect, it } from "vitest";
import {
  activeDays,
  activeInLastDays,
  completionsInLastDays,
  freezableDay,
  freezesAvailable,
  habitStreak,
  isScheduledOn,
  journalStreak,
  topStreak,
  weekSummary,
} from "@/utils/streaks";
import { completeOn, daysAgo, makeHabit, makeState } from "./helpers";

describe("isScheduledOn", () => {
  it("respects the schedule array", () => {
    const habit = makeHabit({ schedule: [1, 3, 5] }); // Mon, Wed, Fri
    expect(isScheduledOn(habit, "2026-06-08")).toBe(true); // Monday
    expect(isScheduledOn(habit, "2026-06-09")).toBe(false); // Tuesday
  });
});

describe("habitStreak", () => {
  const everyDay = makeHabit();

  it("counts consecutive completed scheduled days", () => {
    expect(habitStreak(everyDay, completeOn("h1", [0, 1]))).toBe(2);
  });

  it("does not break on a pending today", () => {
    expect(habitStreak(everyDay, completeOn("h1", [1, 2]))).toBe(2);
  });

  it("breaks on a missed scheduled day", () => {
    // today + two days ago done, yesterday missed
    expect(habitStreak(everyDay, completeOn("h1", [0, 2, 3]))).toBe(1);
  });

  it("counts frozen days as completed", () => {
    const frozen = new Set([daysAgo(1)]);
    expect(habitStreak(everyDay, completeOn("h1", [0, 2, 3]), frozen)).toBe(4);
  });
});

describe("topStreak", () => {
  it("returns the best streak across habits", () => {
    const habits = [makeHabit({ id: "a" }), makeHabit({ id: "b" })];
    const completions = { ...completeOn("a", [0, 1]), ...completeOn("b", [0]) };
    expect(topStreak(habits, completions)).toBe(2);
  });
});

describe("freezableDay", () => {
  it("returns the missed day when a streak exists beyond it", () => {
    const habit = makeHabit();
    const done = completeOn("h1", [2, 3]); // 2 and 3 days ago
    const result = freezableDay(habit, done, {});
    expect(result).not.toBeNull();
    expect(result!.day).toBe(daysAgo(1)); // yesterday is the miss
    expect(result!.restoredStreak).toBe(3); // frozen yesterday + 2 + 3
  });

  it("returns null when nothing was ever completed", () => {
    expect(freezableDay(makeHabit(), {}, {})).toBeNull();
  });

  it("returns null when the miss is already frozen", () => {
    const done = completeOn("h1", [2, 3]);
    expect(freezableDay(makeHabit(), done, { h1: [daysAgo(1)] })).toBeNull();
  });
});

describe("freezes", () => {
  it("earns one freeze per seven active days", () => {
    const state = makeState({ completions: completeOn("h1", [0, 1, 2, 3, 4, 5, 6]) });
    expect(activeDays(state)).toBe(7);
    expect(freezesAvailable(state)).toBe(1);
  });

  it("spends earned freezes", () => {
    const state = makeState({
      completions: completeOn("h1", [0, 1, 2, 3, 4, 5, 6]),
      freezeUsed: { h1: [daysAgo(1)] },
    });
    expect(freezesAvailable(state)).toBe(0);
  });

  it("never goes negative", () => {
    const state = makeState({
      completions: completeOn("h1", [0, 1, 2]),
      freezeUsed: { h1: [daysAgo(1)] },
    });
    expect(freezesAvailable(state)).toBe(0);
  });
});

describe("weekSummary", () => {
  it("covers the last 7 days with today last", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [0]) });
    const days = weekSummary(state);
    expect(days).toHaveLength(7);
    expect(days[6].isToday).toBe(true);
    expect(days[6].completed).toBe(1);
    expect(days[6].scheduled).toBe(1);
  });
});

describe("completionsInLastDays / activeInLastDays / journalStreak", () => {
  it("counts completions inside the window only", () => {
    expect(completionsInLastDays(completeOn("h1", [0, 2, 10]), 7)).toBe(2);
  });

  it("detects recent activity", () => {
    expect(activeInLastDays(makeState({ completions: completeOn("h1", [1]) }), 3)).toBe(true);
    expect(activeInLastDays(makeState({ completions: completeOn("h1", [10]) }), 3)).toBe(false);
  });

  it("counts journal streaks", () => {
    const entries = [daysAgo(2), daysAgo(1)].map((date, i) => ({
      id: `j${i}`,
      date,
      mood: 3,
      content: "",
      createdAt: "",
    }));
    expect(journalStreak(entries)).toBe(2);
  });
});
