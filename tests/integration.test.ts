import { describe, expect, it } from "vitest";
import { createHabit, createJournalEntry, initialState, reducer } from "@/db/appState";
import { exportState, importState, loadState, saveState } from "@/db/persistence";
import { createMemoryStorage } from "@/db/storage";
import { bannerMessage } from "@/utils/banner";
import { heroContext } from "@/utils/hero";
import { freezableDay, freezesAvailable, habitStreak } from "@/utils/streaks";
import { computeXp, XP_PER_GOAL } from "@/utils/xp";
import { completeOn, daysAgo, makeHabit, makeState } from "./helpers";
import { todayKey } from "@/utils/dates";

const today = todayKey();

describe("flow: create habit → complete → streak + XP → Today UI", () => {
  it("reflects a completed day across streaks, XP and the Today selectors", () => {
    // Create a daily habit.
    const created = reducer(initialState(), {
      type: "habits/add",
      habit: createHabit({ name: "Read", icon: "book", color: "#4F46E5", schedule: [0, 1, 2, 3, 4, 5, 6] }),
    });
    const habit = created.habits[0];
    expect(habit).toBeTruthy();

    // Complete today and yesterday.
    let state = reducer(created, { type: "completion/toggle", habitId: habit.id, date: today });
    state = reducer(state, { type: "completion/toggle", habitId: habit.id, date: daysAgo(1) });

    // Streak + XP update.
    expect(habitStreak(habit, state.completions)).toBe(2);
    expect(computeXp(state)).toBe(2 * XP_PER_GOAL);

    // The Today UI (hero + banner) reads the same state and reflects it.
    expect(heroContext(state, today).mood).toBe("all-done");
    expect(bannerMessage(state, today).icon).toBe("star");
  });
});

describe("flow: journal entry → save → reload → still there", () => {
  it("keeps a journal entry across a persistence reload and XP reflects it", () => {
    const profile = { name: "Cedi", avatar: "fawn", interests: [], onboardedAt: "2026-01-01" };
    let state = makeState({ profile });
    state = reducer(state, {
      type: "journal/upsert",
      entry: createJournalEntry(today, 5, "A genuinely good day"),
    });

    // "Reload": write to storage, then read it back fresh.
    const storage = createMemoryStorage();
    saveState(state, storage);
    const reloaded = loadState(storage);

    expect(reloaded.journal).toHaveLength(1);
    expect(reloaded.journal[0]).toMatchObject({ date: today, mood: 5, content: "A genuinely good day" });
    expect(computeXp(reloaded)).toBe(computeXp(state));
    expect(computeXp(reloaded) - 20 /* welcome */).toBe(5);
  });
});

describe("flow: export → reset → import → equivalent state", () => {
  it("returns to an equivalent state after a round trip", () => {
    const original = makeState({
      profile: { name: "Cedi", avatar: "fawn", interests: ["study"], onboardedAt: "2026-01-01" },
      habits: [makeHabit(), makeHabit({ id: "h2", name: "Run", icon: "dumbbell", color: "#22C55E" })],
      completions: completeOn("h1", [0, 1, 2, 3]),
      journal: [{ id: "j1", date: today, mood: 4, content: "hi", createdAt: "" }],
      questsDone: [today],
      tendedDates: [daysAgo(1)],
      focus: [{ id: "f1", date: today, minutes: 25, endedAt: "" }],
      challenges: [{ id: "c1", title: "C", days: 3, startedAt: "", doneDates: [], xpReward: 100 }],
      reflections: [
        { id: "r1", weekKey: "2026-06-01", wentWell: "", wentWrong: "", win: "", lesson: "", nextWeek: "", createdAt: "" },
      ],
    });

    // Export, then wipe the app.
    const backup = exportState(original);
    const reset = reducer(original, { type: "app/reset" });
    expect(reset).toEqual(initialState());

    // Restore and confirm the state is equivalent.
    const result = importState(backup);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state).toEqual(original);
      expect(computeXp(result.state)).toBe(computeXp(original));
    }
  });
});

describe("flow: streak freezes", () => {
  it("earns, spends and correctly restores a streak", () => {
    const habit = makeHabit();
    // 6 completed days + a quest day = 7 active days → one freeze earned.
    const state = makeState({
      habits: [habit],
      completions: completeOn("h1", [0, 2, 3, 4, 5, 6]),
      questsDone: [daysAgo(7)],
    });
    expect(freezesAvailable(state)).toBe(1);

    // Yesterday is the missed, freezable day.
    const missed = freezableDay(habit, state.completions);
    expect(missed).not.toBeNull();
    expect(missed!.day).toBe(daysAgo(1));

    // Spend the freeze.
    const spent = reducer(state, { type: "freeze/use", habitId: habit.id, date: daysAgo(1) });
    expect(spent.freezeUsed[habit.id]).toContain(daysAgo(1));
    expect(freezesAvailable(spent)).toBe(0);

    // The streak now counts the frozen day as done.
    const frozen = new Set(spent.freezeUsed[habit.id]);
    expect(habitStreak(habit, spent.completions, frozen)).toBe(7);

    // A second miss with no freeze left cannot earn back below zero.
    expect(freezesAvailable(spent)).toBe(0);
  });
});
